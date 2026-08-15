import { NextResponse } from "next/server";
import { dropboxConfigured, getDropboxAuthUrl } from "@/lib/dropbox";
import { isDemoModeAllowed, readSession, updateSession } from "@/lib/session";
import { appUrl } from "@/lib/url";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session?.apple) {
    return NextResponse.redirect(appUrl(request, "/connect?step=apple"));
  }

  const url = new URL(request.url);
  const demo = url.searchParams.get("demo") === "1";

  if (demo || !dropboxConfigured()) {
    if (!isDemoModeAllowed() && !dropboxConfigured()) {
      return NextResponse.json(
        { error: "Dropbox app credentials are not configured" },
        { status: 503 },
      );
    }

    await updateSession({
      dropbox: {
        accessToken: "demo-token",
        accountId: "demo-account",
        email: "you@dropbox.com",
        displayName: "Dropbox Demo",
      },
    });

    return NextResponse.redirect(appUrl(request, "/folder"));
  }

  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("dropbox_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(getDropboxAuthUrl(state));
}
