import { NextResponse } from "next/server";
import { appleConfigured, verifyAppleIdToken } from "@/lib/apple";
import { isDemoModeAllowed, updateSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { idToken, fullName, demo, passkey } = body as {
    idToken?: string;
    fullName?: string;
    demo?: boolean;
    passkey?: boolean;
  };

  if (demo || (!idToken && isDemoModeAllowed())) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json({ error: "Demo mode is disabled" }, { status: 403 });
    }

    const session = await updateSession({
      apple: {
        id: `demo.${passkey ? "passkey" : "account"}.${Date.now()}`,
        email: passkey ? "passkey@privaterelay.appleid.com" : "you@privaterelay.appleid.com",
        name: fullName || (passkey ? "Apple Passkey" : "Apple Account"),
      },
    });

    return NextResponse.json({
      ok: true,
      mode: "demo",
      user: session.apple,
    });
  }

  if (!idToken) {
    return NextResponse.json(
      {
        error: appleConfigured()
          ? "Missing Apple identity token"
          : "Apple Sign In is not configured. Enable demo mode or set APPLE_CLIENT_ID.",
      },
      { status: 400 },
    );
  }

  try {
    const claims = await verifyAppleIdToken(idToken);
    const session = await updateSession({
      apple: {
        id: claims.sub,
        email: claims.email,
        name: fullName,
      },
    });

    return NextResponse.json({ ok: true, mode: "apple", user: session.apple });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Apple verification failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: appleConfigured(),
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || process.env.APPLE_CLIENT_ID || null,
    redirectUri:
      process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/auth/apple/callback`,
    demoAllowed: isDemoModeAllowed(),
  });
}
