import { NextResponse } from "next/server";
import {
  exchangeDropboxCode,
  getDropboxAccount,
} from "@/lib/dropbox";
import { updateSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/connect?step=dropbox&error=${encodeURIComponent(error)}`, request.url),
    );
  }

  const jar = await cookies();
  const expected = jar.get("dropbox_oauth_state")?.value;
  jar.delete("dropbox_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL("/connect?step=dropbox&error=invalid_state", request.url),
    );
  }

  try {
    const token = await exchangeDropboxCode(code);
    const account = await getDropboxAccount(token.access_token);

    await updateSession({
      dropbox: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: token.expires_in
          ? Date.now() + token.expires_in * 1000
          : undefined,
        accountId: account.accountId,
        email: account.email,
        displayName: account.displayName,
      },
    });

    return NextResponse.redirect(new URL("/folder", request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed";
    return NextResponse.redirect(
      new URL(`/connect?step=dropbox&error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
