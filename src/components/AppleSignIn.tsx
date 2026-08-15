"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code?: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}

type AppleConfig = {
  configured: boolean;
  clientId: string | null;
  redirectUri: string;
  demoAllowed: boolean;
};

export function AppleSignIn() {
  const router = useRouter();
  const [config, setConfig] = useState<AppleConfig | null>(null);
  const [busy, setBusy] = useState<"account" | "passkey" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    fetch("/api/auth/apple")
      .then((r) => r.json())
      .then((data: AppleConfig) => setConfig(data))
      .catch(() =>
        setConfig({
          configured: false,
          clientId: null,
          redirectUri: "",
          demoAllowed: true,
        }),
      );
  }, []);

  const loadAppleScript = useCallback(async (clientId: string, redirectURI: string) => {
    if (scriptLoaded.current && window.AppleID) {
      window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI,
        usePopup: true,
      });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-apple-auth="1"]');
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.dataset.appleAuth = "1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Apple Sign In"));
      document.head.appendChild(script);
    });

    scriptLoaded.current = true;
    window.AppleID?.auth.init({
      clientId,
      scope: "name email",
      redirectURI,
      usePopup: true,
    });
  }, []);

  async function completeSession(payload: Record<string, unknown>) {
    const res = await fetch("/api/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Sign in failed");
    router.push("/connect?step=dropbox");
  }

  async function signInWithAppleAccount() {
    setError(null);
    setBusy("account");
    try {
      if (config?.configured && config.clientId) {
        await loadAppleScript(config.clientId, config.redirectUri);
        const response = await window.AppleID!.auth.signIn();
        const nameParts = [
          response.user?.name?.firstName,
          response.user?.name?.lastName,
        ].filter(Boolean);
        await completeSession({
          idToken: response.authorization.id_token,
          fullName: nameParts.length ? nameParts.join(" ") : undefined,
        });
        return;
      }

      if (!config?.demoAllowed) {
        throw new Error("Add APPLE_CLIENT_ID to enable Sign in with Apple.");
      }

      await completeSession({ demo: true, fullName: "Apple Account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple sign in failed");
    } finally {
      setBusy(null);
    }
  }

  async function signInWithPasskey() {
    setError(null);
    setBusy("passkey");
    try {
      if (typeof window.PublicKeyCredential !== "undefined") {
        // Prefer platform authenticator (Face ID / Touch ID / Apple Passkey)
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (available) {
          // Soft challenge for UX presence; session is established via Apple ID or demo.
          // Real production pairs this with Sign in with Apple + passkey on the Apple ID.
          try {
            await navigator.credentials.get({
              publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                timeout: 60000,
                userVerification: "required",
                rpId: window.location.hostname,
              },
            });
          } catch {
            // User may cancel or have no resident key yet — fall through to Apple/demo.
          }
        }
      }

      if (config?.configured && config.clientId) {
        await loadAppleScript(config.clientId, config.redirectUri);
        const response = await window.AppleID!.auth.signIn();
        await completeSession({
          idToken: response.authorization.id_token,
          fullName: "Apple Passkey",
        });
        return;
      }

      if (!config?.demoAllowed) {
        throw new Error("Add APPLE_CLIENT_ID to enable Apple Passkey sign-in.");
      }

      await completeSession({
        demo: true,
        passkey: true,
        fullName: "Apple Passkey",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey sign in failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="auth-panel">
      <button
        type="button"
        className="btn btn--apple"
        onClick={signInWithAppleAccount}
        disabled={!!busy}
      >
        <AppleLogo />
        <span>{busy === "account" ? "Signing in…" : "Continue with Apple"}</span>
      </button>

      <button
        type="button"
        className="btn btn--passkey"
        onClick={signInWithPasskey}
        disabled={!!busy}
      >
        <PasskeyIcon />
        <span>
          {busy === "passkey" ? "Waiting for Passkey…" : "Sign in with Apple Passkey"}
        </span>
      </button>

      <p className="auth-panel__note">
        Uses your Apple Account. Face&nbsp;ID, Touch&nbsp;ID, or a passkey when
        available.
      </p>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.7 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.8.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.2-.8-2.2-3.4zM14.3 5.5c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.7 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.7-1.4z" />
    </svg>
  );
}

function PasskeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 10h7.5a2 2 0 0 1 0 4H18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.5 14v2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
