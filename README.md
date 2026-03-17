# SharePlay

Real-time collaborative media platform — watch videos and listen to music together with friends.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **UI:** Chakra UI 3, Framer Motion, Phosphor Icons
- **State:** TanStack React Query, React Context
- **Real-time:** Socket.io
- **Media:** React Player, Howler.js
- **Language:** TypeScript 5

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/             # Login & signup
│   ├── dashboard/        # Main dashboard, friends, settings, notifications
│   ├── room/[roomId]/    # Room view & lobby
│   ├── not-found.tsx     # 404 error page
│   ├── forbidden.tsx     # 403 error page
│   ├── error.tsx         # 500 error boundary
│   └── global-error.tsx  # Root error boundary
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── room/             # Room & lobby components
│   ├── landing/          # Landing page
│   ├── friends/          # Friend management
│   ├── settings/         # User settings
│   ├── notifications/    # Notification feed
│   ├── errors/           # Redirect interstitial (3xx)
│   └── ui/               # Reusable UI kit (GlassPanel, Logo, TabBar, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # API client, types, adapters, config
├── providers/            # Chakra, Auth, React Query providers
└── theme/                # Chakra UI theme tokens
```

## Features

- **Rooms** — Create or join watch/listen rooms with friends
- **Synced Playback** — Video and music stay in sync across all participants
- **Voice Chat** — Real-time voice with mute, deafen, and speaking indicators
- **Text Chat** — In-room messaging with system events
- **Queue** — Collaborative media queue management
- **Friends** — Add friends, see who's online, send invites
- **Notifications** — Invites, mentions, role changes, system alerts
- **Command Palette** — Quick access via `Cmd+K` / `Ctrl+K`
- **Error Pages** — Custom branded pages for 404, 403, 500, and 3xx redirects

## Design System

Dark theme with glass-morphism aesthetic:

| Token | Value |
|-------|-------|
| Brand | `#ff3b3b` (crimson red) |
| Surface | `#000` / `#0a0a0a` / `#111` |
| Glass | `rgba(255,255,255,0.04)` + backdrop blur |
| Heading font | Space Grotesk |
| Body font | Inter |
| Mono font | JetBrains Mono |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## License

MIT
