"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ItemState = {
  id: string;
  name: string;
  size: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

export function TransferPanel({ folderPath }: { folderPath: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ItemState[]>([]);
  const [running, setRunning] = useState(false);

  function onPick(files: FileList | null) {
    if (!files?.length) return;
    const next: ItemState[] = Array.from(files).map((file, i) => ({
      id: `${file.name}-${file.size}-${i}-${Date.now()}`,
      name: file.name,
      size: file.size,
      status: "queued",
    }));
    setItems(next);
    void startTransfer(Array.from(files), next);
  }

  async function startTransfer(files: File[], snapshot: ItemState[]) {
    setRunning(true);
    const updated = [...snapshot];

    for (let i = 0; i < files.length; i++) {
      updated[i] = { ...updated[i], status: "uploading" };
      setItems([...updated]);

      try {
        const form = new FormData();
        form.append("file", files[i]);
        const res = await fetch("/api/transfer/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        updated[i] = { ...updated[i], status: "done" };
      } catch (err) {
        updated[i] = {
          ...updated[i],
          status: "error",
          error: err instanceof Error ? err.message : "Failed",
        };
      }
      setItems([...updated]);
    }

    setRunning(false);
    const allOk = updated.every((item) => item.status === "done");
    if (allOk && updated.length > 0) {
      router.push(`/done?count=${updated.length}`);
    }
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="transfer-panel">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,.heic,.heif,.dng"
        multiple
        className="sr-only"
        onChange={(e) => onPick(e.target.files)}
      />

      <button
        type="button"
        className="photo-drop"
        onClick={() => inputRef.current?.click()}
        disabled={running}
      >
        <span className="photo-drop__glyph" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="var(--ink)" strokeWidth="1.8" />
            <circle cx="9" cy="11" r="2" stroke="var(--ink)" strokeWidth="1.8" />
            <path
              d="M3 16l5-4 3 2 4-5 6 7"
              stroke="var(--ink)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="photo-drop__title">Choose from Apple Photos</span>
        <span className="photo-drop__sub">
          Opens your Photos library, including iCloud. Files upload straight to{" "}
          <strong>{folderPath}</strong>.
        </span>
      </button>

      {items.length > 0 ? (
        <ul className="transfer-list">
          {items.map((item) => (
            <li key={item.id} className={`transfer-list__item transfer-list__item--${item.status}`}>
              <div>
                <p className="transfer-list__name">{item.name}</p>
                <p className="transfer-list__meta">
                  {formatBytes(item.size)} · {labelFor(item.status)}
                </p>
              </div>
              <StatusDot status={item.status} />
            </li>
          ))}
        </ul>
      ) : null}

      {running ? (
        <p className="muted pulse">
          Transferring {doneCount}/{items.length} to Dropbox…
        </p>
      ) : null}
    </div>
  );
}

function labelFor(status: ItemState["status"]) {
  switch (status) {
    case "queued":
      return "Queued";
    case "uploading":
      return "Uploading";
    case "done":
      return "In Dropbox";
    case "error":
      return "Failed";
  }
}

function StatusDot({ status }: { status: ItemState["status"] }) {
  return <span className={`status-dot status-dot--${status}`} aria-hidden />;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
