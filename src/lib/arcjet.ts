import arcjet, {
  shield,
  detectBot,
  fixedWindow,
  slidingWindow,
} from "@arcjet/next";

// =============================================================================
// Base Arcjet instance — shared WAF + bot detection for all routes
// =============================================================================
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // WAF: blocks SQL injection, XSS, CSRF, and other common attacks
    shield({ mode: "LIVE" }),

    // Bot detection: allow legitimate crawlers, block everything else
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
  ],
});

// =============================================================================
// Route-specific clients — chain additional rules per protection tier
// =============================================================================

/**
 * AUTH routes (/auth/*) — strictest rate limits to prevent brute force
 * - 5 requests per 10 seconds (burst protection)
 * - 20 requests per 10 minutes (sustained protection)
 */
export const ajAuth = aj
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "10s",
      max: 5,
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "10m",
      max: 20,
    })
  );

/**
 * ROOM routes (/room/*) — moderate limits, must allow real-time interaction
 * - 200 requests per minute (page loads, lobby checks, etc.)
 */
export const ajRoom = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "60s",
    max: 200,
  })
);

/**
 * DASHBOARD routes (/dashboard/*) — standard rate limits
 * - 120 requests per minute
 */
export const ajDashboard = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "60s",
    max: 120,
  })
);

/**
 * PUBLIC routes (/, /about) — generous limits, light protection
 * - 60 requests per minute
 */
export const ajPublic = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "60s",
    max: 60,
  })
);

/**
 * SENSITIVE operations (password reset, email verification, etc.)
 * - 3 requests per 10 seconds (tight burst limit)
 * - 10 requests per hour (abuse prevention)
 */
export const ajSensitive = aj
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "10s",
      max: 3,
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 10,
    })
  );

export default aj;
