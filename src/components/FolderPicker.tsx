"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DropboxFolderEntry } from "@/lib/types";

export function FolderPicker() {
  const router = useRouter();
  const [path, setPath] = useState("/");
  const [entries, setEntries] = useState<DropboxFolderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState("");

  const load = useCallback(async (nextPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dropbox/folders?path=${encodeURIComponent(nextPath)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load folders");
      setPath(data.path);
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("/");
  }, [load]);

  function crumbs(current: string) {
    if (current === "/" || !current) return [{ label: "Dropbox", path: "/" }];
    const parts = current.split("/").filter(Boolean);
    const items = [{ label: "Dropbox", path: "/" }];
    let acc = "";
    for (const part of parts) {
      acc += `/${part}`;
      items.push({ label: part, path: acc });
    }
    return items;
  }

  async function selectFolder(target: { path: string; name: string }, create = false) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dropbox/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, create }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save folder");
      router.push("/transfer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save folder");
      setSaving(false);
    }
  }

  async function createAndSelect() {
    const name = newFolder.trim();
    if (!name) return;
    const parent = path === "/" ? "" : path;
    const nextPath = `${parent}/${name}`;
    await selectFolder({ path: nextPath, name }, true);
  }

  const trail = crumbs(path);
  const currentName = path === "/" ? "Dropbox" : path.split("/").filter(Boolean).pop()!;

  return (
    <div className="folder-picker">
      <div className="breadcrumbs" aria-label="Current path">
        {trail.map((crumb, i) => (
          <button
            key={crumb.path}
            type="button"
            className="breadcrumbs__item"
            onClick={() => load(crumb.path)}
            disabled={loading || i === trail.length - 1}
          >
            {crumb.label}
          </button>
        ))}
      </div>

      <div className="folder-list" role="list">
        {loading ? (
          <p className="muted pulse">Loading folders…</p>
        ) : entries.length === 0 ? (
          <p className="muted">No subfolders here. You can use this folder or create one.</p>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="folder-row"
              role="listitem"
              onClick={() => load(entry.path)}
            >
              <FolderIcon />
              <span>{entry.name}</span>
              <ChevronIcon />
            </button>
          ))
        )}
      </div>

      <div className="create-folder">
        <label htmlFor="new-folder">New folder in {currentName}</label>
        <div className="create-folder__row">
          <input
            id="new-folder"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Apple Photos"
            autoComplete="off"
          />
          <button type="button" className="btn btn--ghost" onClick={createAndSelect} disabled={saving}>
            Create
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => selectFolder({ path, name: currentName })}
        disabled={saving || loading}
      >
        {saving ? "Saving…" : `Use “${currentName}”`}
      </button>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l1.5 1.8h7.5a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9z"
        fill="var(--foam)"
        stroke="var(--sky)"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="folder-row__chevron">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
