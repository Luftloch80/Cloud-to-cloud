# Meridian

Mobile web app that moves **Apple Photos → Dropbox** (cloud to cloud).

## Flow

1. **Sign in with Apple** — Apple Account or Apple Passkey (Face ID / Touch ID)
2. **Authorize Dropbox** — user logs into your Dropbox app and grants access
3. **Choose folder** — browse Dropbox and pick (or create) the upload destination
4. **Transfer** — select from the Apple Photos library (including iCloud items on iPhone) and upload into that folder

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open on an iPhone, or use the desktop phone preview at [http://localhost:3000](http://localhost:3000).

### Sign in with Apple

1. In [Apple Developer](https://developer.apple.com) create a **Services ID**
2. Enable Sign in with Apple; set the return URL to  
   `https://your-domain/api/auth/apple` (popup mode uses the JS SDK)
3. Set in `.env.local`:

```
APPLE_CLIENT_ID=com.example.meridian.service
NEXT_PUBLIC_APPLE_CLIENT_ID=com.example.meridian.service
NEXT_PUBLIC_APPLE_REDIRECT_URI=https://your-domain
SESSION_SECRET=long-random-string
```

Without Apple credentials, demo mode (`ALLOW_DEMO_MODE=true`) simulates Apple Account / Passkey sign-in for local testing.

### Dropbox app

1. Create an app at [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Permission: **Full Dropbox**
3. Scopes: `account_info.read`, `files.metadata.read`, `files.content.write`
4. Add OAuth redirect: `https://your-domain/api/dropbox/callback`
5. Set:

```
DROPBOX_APP_KEY=...
DROPBOX_APP_SECRET=...
NEXT_PUBLIC_DROPBOX_APP_KEY=...
NEXT_PUBLIC_APP_URL=https://your-domain
```

Without Dropbox credentials, use **Continue with demo Dropbox** after Apple sign-in.

## Notes

- UI is **mobile-only** (phone frame preview on larger screens).
- Apple does not offer a public iCloud Photos REST API for third-party servers. On iPhone, Meridian uses the system Photos picker (iCloud-backed library) and streams files to Dropbox via the Dropbox API after OAuth.
- Production: set `ALLOW_DEMO_MODE=false` and configure real Apple + Dropbox credentials.
