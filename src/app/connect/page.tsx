"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppleSignIn } from "@/components/AppleSignIn";
import { StepRail } from "@/components/StepRail";
import { useSession } from "@/components/useSession";

function ConnectInner() {
  const params = useSearchParams();
  const stepParam = params.get("step");
  const error = params.get("error");
  const { session, loading } = useSession();

  const step =
    stepParam === "dropbox" || session?.apple
      ? "dropbox"
      : "apple";

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden />
      <div className="page">
        <header className="topbar">
          <Link href="/" className="topbar__brand">
            Meridian
          </Link>
          <span className="topbar__meta">Cloud → cloud</span>
        </header>

        <StepRail current={step} />

        {step === "apple" ? (
          <>
            <h1 className="panel-title">Sign in with Apple</h1>
            <p className="panel-copy">
              Use your Apple Account or Passkey. Meridian never sees your Apple
              password.
            </p>
            <AppleSignIn />
          </>
        ) : (
          <>
            <h1 className="panel-title">Connect Dropbox</h1>
            <p className="panel-copy">
              Authorize the Meridian Dropbox app. You only log in and approve
              access — then pick where photos land.
            </p>

            {!loading && session?.apple ? (
              <div className="account-chip">
                <div className="account-chip__avatar">
                  {(session.apple.name || session.apple.email || "A")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="account-chip__name">
                    {session.apple.name || "Apple user"}
                  </p>
                  <p className="account-chip__email">
                    {session.apple.email || "Signed in with Apple"}
                  </p>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="form-error">Dropbox authorization failed: {error}</p>
            ) : null}

            <div className="dropbox-panel">
              <a href="/api/dropbox/authorize" className="btn btn--dropbox">
                <DropboxMark />
                Log in &amp; authorize Dropbox
              </a>
              {!session?.dropboxConfigured ? (
                <a
                  href="/api/dropbox/authorize?demo=1"
                  className="btn btn--ghost btn--block"
                >
                  Continue with demo Dropbox
                </a>
              ) : null}
              <p className="muted">
                After you authorize, you&apos;ll choose the folder for photo
                uploads.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DropboxMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M6 2.5 0 6.3l6 3.8 6-3.8L6 2.5zm12 0-6 3.8 6 3.8 6-3.8-6-3.8zM0 13.9l6 3.8 6-3.8-6-3.8-6 3.8zm18-3.8-6 3.8 6 3.8 6-3.8-6-3.8zm-6 5.2-6 3.8 6 3.4 6-3.4-6-3.8z" />
    </svg>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<div className="shell"><div className="atmosphere" /></div>}>
      <ConnectInner />
    </Suspense>
  );
}
