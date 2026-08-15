# Meridian — deploy keys checklist

## Live temporary deploy (claim within ~60 min)

- **App:** https://temporary-swift-poplar-7ke38xy.vercel.app
- **Claim to your Vercel account:** https://vercel.com/claim-deployment?code=6c2a61c4-4fe4-4926-a203-459ec759312f

Until you claim it, this URL expires. After claiming, open **Settings → Environment Variables** and paste the block below (update `YOUR-APP` to your permanent `*.vercel.app` host).

---

## Generated for you

| Key | Value |
|-----|--------|
| `SESSION_SECRET` | `4b5610262fd6b9176d7eede182e50aeebba5b64e698aa723d27df24c08f6147a` |

---

## Full Vercel env block (copy/paste)

Replace `YOUR-APP` after you claim / get a permanent URL.

```bash
NEXT_PUBLIC_APP_URL=https://YOUR-APP.vercel.app
SESSION_SECRET=4b5610262fd6b9176d7eede182e50aeebba5b64e698aa723d27df24c08f6147a
ALLOW_DEMO_MODE=false

APPLE_CLIENT_ID=
NEXT_PUBLIC_APPLE_CLIENT_ID=
NEXT_PUBLIC_APPLE_REDIRECT_URI=https://YOUR-APP.vercel.app

DROPBOX_APP_KEY=
DROPBOX_APP_SECRET=
NEXT_PUBLIC_DROPBOX_APP_KEY=
```

You still must fill Apple + Dropbox (those can only be created in your accounts).

---

## Dropbox — get these keys

1. https://www.dropbox.com/developers/apps → Create app → Scoped → **Full Dropbox**
2. Permissions: `account_info.read`, `files.metadata.read`, `files.content.write` → Submit
3. Redirect URI:

```
https://YOUR-APP.vercel.app/api/dropbox/callback
```

4. Copy **App key** → `DROPBOX_APP_KEY` and `NEXT_PUBLIC_DROPBOX_APP_KEY`
5. Copy **App secret** → `DROPBOX_APP_SECRET`

---

## Apple — get these keys

1. https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Create **Services ID**, enable Sign in with Apple
3. Domain: `YOUR-APP.vercel.app`
4. Return URL: `https://YOUR-APP.vercel.app`
5. Services ID string → `APPLE_CLIENT_ID` and `NEXT_PUBLIC_APPLE_CLIENT_ID`

---

## Let the agent deploy permanently

Add Cloud Agent secrets: `VERCEL_TOKEN` (+ Apple/Dropbox keys), then ask to deploy again.

- Token: https://vercel.com/account/tokens
