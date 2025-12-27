# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for SharePlay.

## Quick Start (Demo Mode)

For testing without Google OAuth, the app includes a **Demo Mode**:
1. Click "Try Demo Mode" on the login page
2. Enter any email address
3. You'll be logged in with a mock user account

---

## Production Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it "SharePlay" and click **Create**

### Step 2: Enable Google+ API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity Toolkit API"

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in:
   - **App name**: SharePlay
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue** through the remaining steps

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: SharePlay Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 5: Generate AUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 6: Update Environment Variables

Edit `.env.local` in the project root:

```env
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"

# From Google Cloud Console
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret-from-google-console"
```

### Step 7: Restart the Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`

### "MissingSecret" Error
- Make sure `AUTH_SECRET` is set in `.env.local`
- Restart the dev server after changing `.env.local`

### OAuth Not Working in Production
- Add your production domain to both "Authorized origins" and "Redirect URIs"
- Make sure you're using HTTPS in production

---

## File Reference

| File | Purpose |
|------|---------|
| `src/auth.ts` | NextAuth configuration |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth API handlers |
| `.env.local` | Secret credentials (gitignored) |
