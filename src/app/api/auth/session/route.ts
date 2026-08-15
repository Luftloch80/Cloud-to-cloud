import { NextResponse } from "next/server";
import { dropboxConfigured } from "@/lib/dropbox";
import { readSession } from "@/lib/session";

export async function GET() {
  const session = await readSession();
  return NextResponse.json({
    authenticated: Boolean(session?.apple),
    apple: session?.apple
      ? {
          id: session.apple.id,
          email: session.apple.email,
          name: session.apple.name,
        }
      : null,
    dropbox: session?.dropbox
      ? {
          connected: true,
          email: session.dropbox.email,
          displayName: session.dropbox.displayName,
        }
      : { connected: false },
    folder: session?.folder || null,
    dropboxConfigured: dropboxConfigured(),
  });
}
