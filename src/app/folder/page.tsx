"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderPicker } from "@/components/FolderPicker";
import { StepRail } from "@/components/StepRail";
import { useSession } from "@/components/useSession";

export default function FolderPage() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!session?.apple) router.replace("/connect");
    else if (!session.dropbox.connected) router.replace("/connect?step=dropbox");
  }, [loading, session, router]);

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden />
      <div className="page">
        <header className="topbar">
          <Link href="/" className="topbar__brand">
            Meridian
          </Link>
          <span className="topbar__meta">
            {session?.dropbox.displayName || session?.dropbox.email || "Dropbox"}
          </span>
        </header>

        <StepRail current="folder" />

        <h1 className="panel-title">Choose upload folder</h1>
        <p className="panel-copy">
          Pick where Meridian should put photos from Apple Photos.
        </p>

        <FolderPicker />
      </div>
    </div>
  );
}
