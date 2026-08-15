"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepRail } from "@/components/StepRail";
import { TransferPanel } from "@/components/TransferPanel";
import { useSession } from "@/components/useSession";

export default function TransferPage() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!session?.apple) router.replace("/connect");
    else if (!session.dropbox.connected) router.replace("/connect?step=dropbox");
    else if (!session.folder) router.replace("/folder");
  }, [loading, session, router]);

  const folderPath = session?.folder?.path || "/";

  return (
    <div className="shell">
      <div className="atmosphere" aria-hidden />
      <div className="page">
        <header className="topbar">
          <Link href="/" className="topbar__brand">
            Meridian
          </Link>
          <Link href="/folder" className="topbar__meta">
            Change folder
          </Link>
        </header>

        <StepRail current="transfer" />

        <h1 className="panel-title">Transfer photos</h1>
        <p className="panel-copy">
          Select from Apple Photos. Meridian streams them to{" "}
          <strong style={{ color: "var(--foam)", fontWeight: 600 }}>
            {session?.folder?.name || "your folder"}
          </strong>{" "}
          in Dropbox.
        </p>

        <TransferPanel folderPath={folderPath} />
      </div>
    </div>
  );
}
