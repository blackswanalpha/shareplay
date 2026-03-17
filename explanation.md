# SharePlay — Technical Explanation

## What It Is

SharePlay is a real-time collaborative media platform built with Next.js 16 and React 19. Users create rooms where they can watch videos or listen to music together, with playback synchronized across all participants. The app includes voice chat, text messaging, a shared media queue, and a social layer with friends and notifications.

## Architecture

### App Router & Page Structure

The app uses Next.js App Router with a clear route hierarchy:

- `/` — Public landing page with ambient audio and animated background
- `/auth` — Tab-based login/signup form
- `/dashboard` — Protected hub with active rooms, online friends, pending invites, and stats
- `/dashboard/friends` — Friend list, requests, and user search
- `/dashboard/settings` — Profile, audio, and notification preferences
- `/dashboard/notifications` — Notification feed
- `/room/[roomId]` — The room experience (video/music player, chat, voice, queue)
- `/room/[roomId]/lobby` — Pre-join lobby with room info and participant preview

Every page under `/dashboard` is protected by `useAuthGuard`, which redirects unauthenticated users to `/auth`.

### Provider Stack

The root layout wraps the entire app in three providers:

1. **ChakraProvider** — UI theme system with custom dark tokens
2. **QueryProvider** — TanStack React Query with 30s stale time and single retry
3. **AuthProvider** — Context-based auth state with token refresh logic

### Data Flow

API communication follows a consistent pattern:

1. **API client** (`lib/api.ts`) — Centralized fetch wrapper with automatic token refresh. On 401, it attempts a refresh and retries the request once. On refresh failure, it clears tokens and redirects to `/auth`.
2. **Adapters** (`lib/adapters.ts`) — Transform raw API responses into frontend-friendly TypeScript interfaces. Handles field renaming, default values, and avatar fallbacks via DiceBear.
3. **React Query hooks** (`hooks/useApi.ts`) — Typed query/mutation hooks that components consume directly. Keeps server state cached, deduplicated, and automatically refreshed.

### Real-time Layer

Socket.io handles real-time features: playback sync, voice state, chat messages, and presence updates. The room components connect to the socket on mount and clean up on unmount.

### Component Architecture

Components are organized by domain rather than type:

- **`components/dashboard/`** — 13 components composing the dashboard view
- **`components/room/`** — 15 components for the room experience
- **`components/landing/`** — 4 components for the public landing page
- **`components/friends/`** — Friend cards and search results
- **`components/settings/`** — Settings sections with sidebar navigation
- **`components/notifications/`** — Notification cards and feed
- **`components/errors/`** — Redirect interstitial for 3xx scenarios
- **`components/ui/`** — 9 reusable primitives (GlassPanel, Logo, TabBar, AvatarGroup, StatusDot, ToggleSwitch, AnimatedNumber, CommandPalette, MoreMenu)

All components are client components using `"use client"` since they rely on interactivity, animations, or browser APIs.

## Error Handling Strategy

### HTTP Error Pages

The app provides custom branded error pages for every major HTTP error class:

**404 — Not Found** (`app/not-found.tsx`)
Triggered by Next.js `notFound()` or when no route matches. Shows a "Lost signal" message with a search icon animation. Offers navigation back or to the home page.

**403 — Forbidden** (`app/forbidden.tsx`)
Triggered by Next.js `forbidden()`. Shows an "Access denied" message with a lock icon and a yellow-tinted warning panel suggesting the user contact the room host. Uses yellow accent to differentiate from other errors.

**500 — Server Error** (`app/error.tsx`)
A React error boundary that catches runtime errors in any route segment. Displays a "Something broke" message with a flickering lightning icon. Shows the error digest ID for support reference. The "Try again" button calls `reset()` to retry the failed render without a full page reload.

**500 — Global Error** (`app/global-error.tsx`)
Catches errors in the root layout itself. Since the layout (and therefore all providers, fonts, and theme) may have failed, this component is entirely self-contained — it renders its own `<html>` and `<body>` tags with inline styles and SVG icons. No external dependencies.

**3xx — Redirect** (`components/errors/Redirecting.tsx`)
A reusable component for user-facing redirect notices. Supports all redirect codes (301, 302, 307, 308) with appropriate labels. Features a countdown timer that auto-redirects after a configurable delay, a destination preview panel, and options to go immediately or stay.

### API Error Handling

The `ApiError` class carries HTTP status codes through the stack. React Query surfaces these to components, which display contextual error messages. Token expiration is handled transparently via the refresh mechanism — users only see a redirect to `/auth` if the refresh token itself is invalid.

## Styling Approach

The visual language is a dark glass-morphism aesthetic:

- **Black base** (`#000`) with raised surfaces at `#0a0a0a` and `#111`
- **Glass panels** — `rgba(255,255,255,0.04)` background with `backdrop-filter: blur(12px)` and thin white borders at 8% opacity
- **Brand red** (`#ff3b3b`) for primary actions, with contextual accent colors on error pages (yellow for 403, red for 500, blue for 3xx)
- **Glow shadows** — Red-tinted box shadows at varying intensities for depth
- **Typography** — Space Grotesk for headings (tight letter-spacing), Inter for body text, JetBrains Mono for code/technical content

Animations use Framer Motion with `prefers-reduced-motion` respected globally via CSS. Hover effects use 0.2s ease transitions for consistency.

## Performance Considerations

- **Dynamic imports** — Heavy components (landing background, dashboard sections, room panels) are loaded with `next/dynamic` to reduce initial bundle size
- **React Compiler** — Enabled via `babel-plugin-react-compiler` for automatic memoization
- **Virtual scrolling** — `react-virtuoso` handles long lists (chat messages, notification feeds)
- **Image optimization** — Next.js Image component with WebP/AVIF format support
- **Query deduplication** — React Query prevents duplicate network requests for the same data
