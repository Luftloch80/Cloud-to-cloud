"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DoneInner() {
  const params = useSearchParams();
  const count = Number(params.get("count") || "0");

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden />
      <div className="page" style={{ justifyContent: "center" }}>
        <div className="done-mark" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="var(--foam)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="panel-title">In Dropbox</h1>
        <p className="panel-copy">
          {count > 0
            ? `${count} photo${count === 1 ? "" : "s"} transferred from Apple Photos to your Dropbox folder.`
            : "Your transfer finished."}
        </p>
        <div className="cta-row">
          <Link href="/transfer" className="btn btn--primary">
            Transfer more
          </Link>
          <Link href="/" className="btn btn--ghost btn--block">
            Back to Meridian
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={<div className="shell"><div className="atmosphere" /></div>}>
      <DoneInner />
    </Suspense>
  );
}
