import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import aj, {
  ajAuth,
  ajRoom,
  ajDashboard,
  ajPublic,
  ajSensitive,
} from "@/lib/arcjet";

// Route patterns for tier matching
const AUTH_ROUTES = /^\/auth\//;
const SENSITIVE_AUTH_ROUTES =
  /^\/auth\/(reset-password|forgot-password|verify-email)/;
const ROOM_ROUTES = /^\/room\//;
const DASHBOARD_ROUTES = /^\/dashboard/;
const PUBLIC_ROUTES = /^\/($|about)/;

/**
 * Select the correct Arcjet client based on the request path.
 * More specific patterns are checked first.
 */
function getArcjetClient(pathname: string) {
  if (SENSITIVE_AUTH_ROUTES.test(pathname)) return ajSensitive;
  if (AUTH_ROUTES.test(pathname)) return ajAuth;
  if (ROOM_ROUTES.test(pathname)) return ajRoom;
  if (DASHBOARD_ROUTES.test(pathname)) return ajDashboard;
  if (PUBLIC_ROUTES.test(pathname)) return ajPublic;
  // Fallback: base protection (WAF + bot detection, no rate limit)
  return aj;
}

/**
 * Build an appropriate response based on the denial reason.
 */
function buildDeniedResponse(
  decision: Awaited<ReturnType<typeof aj.protect>>,
  request: NextRequest
) {
  const isPageRequest = request.headers.get("accept")?.includes("text/html");

  // Rate limited
  if (decision.reason.isRateLimit()) {
    if (isPageRequest) {
      const url = request.nextUrl.clone();
      url.pathname = "/rate-limited";
      url.searchParams.set("retry", getRetryAfter(decision));
      return NextResponse.rewrite(url);
    }
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: getRetryAfter(decision),
      },
      {
        status: 429,
        headers: {
          "Retry-After": getRetryAfter(decision),
        },
      }
    );
  }

  // Bot detected
  if (decision.reason.isBot()) {
    if (isPageRequest) {
      const url = request.nextUrl.clone();
      url.pathname = "/blocked";
      return NextResponse.rewrite(url);
    }
    return NextResponse.json(
      { error: "Automated access is not allowed" },
      { status: 403 }
    );
  }

  // Shield WAF (attack detected)
  if (decision.reason.isShield()) {
    if (isPageRequest) {
      const url = request.nextUrl.clone();
      url.pathname = "/blocked";
      return NextResponse.rewrite(url);
    }
    return NextResponse.json(
      { error: "Request blocked for security reasons" },
      { status: 403 }
    );
  }

  // Generic denial fallback
  if (isPageRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/blocked";
    return NextResponse.rewrite(url);
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Extract a retry-after value from rate limit results.
 */
function getRetryAfter(
  decision: Awaited<ReturnType<typeof aj.protect>>
): string {
  for (const result of decision.results) {
    if (result.reason.isRateLimit() && result.reason.resetTime) {
      const seconds = Math.ceil(
        (result.reason.resetTime.getTime() - Date.now()) / 1000
      );
      return String(Math.max(seconds, 1));
    }
  }
  return "60";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const client = getArcjetClient(pathname);

  const decision = await client.protect(request);

  // Add security headers to all responses
  const response = decision.isDenied()
    ? buildDeniedResponse(decision, request)
    : NextResponse.next();

  // Attach Arcjet decision metadata as headers for observability
  response.headers.set("x-arcjet-decision", decision.conclusion);
  response.headers.set("x-arcjet-request-id", decision.id);

  // IP intelligence headers (useful for logging/analytics)
  if (decision.ip.hasCountry()) {
    response.headers.set("x-arcjet-country", decision.ip.country!);
  }

  return response;
}

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|.*\\.svg|.*\\.webp|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};
