import { createRemoteJWKSet, jwtVerify } from "jose";

const APPLE_ISSUER = "https://appleid.apple.com";
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type AppleIdTokenClaims = {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  is_private_email?: boolean | string;
  nonce?: string;
};

export async function verifyAppleIdToken(idToken: string): Promise<AppleIdTokenClaims> {
  const clientId =
    process.env.APPLE_CLIENT_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Apple Sign In is not configured (APPLE_CLIENT_ID missing).");
  }

  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: APPLE_ISSUER,
    audience: clientId,
  });

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid Apple identity token: missing subject.");
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    email_verified: payload.email_verified as boolean | string | undefined,
    is_private_email: payload.is_private_email as boolean | string | undefined,
  };
}

export function appleConfigured() {
  return Boolean(
    process.env.APPLE_CLIENT_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
  );
}
