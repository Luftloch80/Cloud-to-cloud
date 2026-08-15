import { NextResponse } from "next/server";
import { listFolders } from "@/lib/dropbox";
import { readSession } from "@/lib/session";

const DEMO_FOLDERS: Record<string, { id: string; name: string; path: string; tag: "folder" }[]> = {
  "/": [
    { id: "id:photos", name: "Photos", path: "/Photos", tag: "folder" },
    { id: "id:camera", name: "Camera Uploads", path: "/Camera Uploads", tag: "folder" },
    { id: "id:apps", name: "Apps", path: "/Apps", tag: "folder" },
    { id: "id:meridian", name: "Meridian", path: "/Meridian", tag: "folder" },
  ],
  "/Photos": [
    { id: "id:2024", name: "2024", path: "/Photos/2024", tag: "folder" },
    { id: "id:2025", name: "2025", path: "/Photos/2025", tag: "folder" },
    { id: "id:family", name: "Family", path: "/Photos/Family", tag: "folder" },
  ],
  "/Meridian": [
    { id: "id:apple-photos", name: "Apple Photos", path: "/Meridian/Apple Photos", tag: "folder" },
  ],
  "/Apps": [
    { id: "id:meridian-app", name: "Meridian", path: "/Apps/Meridian", tag: "folder" },
  ],
};

export async function GET(request: Request) {
  const session = await readSession();
  if (!session?.apple) {
    return NextResponse.json({ error: "Sign in with Apple first" }, { status: 401 });
  }
  if (!session.dropbox?.accessToken) {
    return NextResponse.json({ error: "Connect Dropbox first" }, { status: 401 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";

  if (session.dropbox.accessToken === "demo-token") {
    return NextResponse.json({
      path,
      entries: DEMO_FOLDERS[path] || [],
      demo: true,
    });
  }

  try {
    const entries = await listFolders(session.dropbox.accessToken, path);
    return NextResponse.json({ path, entries, demo: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list folders";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
