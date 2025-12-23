# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Add required environment variables for build time
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VwZXJiLWh1c2t5LTEwLmNsZXJrLmFjY291bnRzLmRldiQ
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_WS_URL=ws://localhost:8000
ENV AUTH_SECRET=KZNHm8tJIY112+oGMaZPpccmsJ420KGSsZxApG6ZONM=
ENV CLERK_SECRET_KEY=sk_test_w8mS3rquLYYP3OGai3MqNHnMmqKKySTL9Ed3VXl2bz

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Add runtime environment variables for Clerk and API
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VwZXJiLWh1c2t5LTEwLmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_w8mS3rquLYYP3OGai3MqNHnMmqKKySTL9Ed3VXl2bz
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_WS_URL=ws://localhost:8000
ENV AUTH_SECRET=KZNHm8tJIY112+oGMaZPpccmsJ420KGSsZxApG6ZONM=

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 7650

ENV PORT=7650

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
