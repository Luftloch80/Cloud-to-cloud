import { NextResponse } from "next/server";
import { ensureFolder } from "@/lib/dropbox";
import { readSession, updateSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session?.apple) {
    return NextResponse.json({ error: "Sign in with Apple first" }, { status: 401 });
  }
  if (!session.dropbox?.accessToken) {
    return NextResponse.json({ error: "Connect Dropbox first" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { path, name, create } = body as {
    path?: string;
    name?: string;
    create?: boolean;
  };

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Folder path is required" }, { status: 400 });
  }

  const folderName = name || path.split("/").filter(Boolean).pop() || "Dropbox";

  if (create && session.dropbox.accessToken !== "demo-token") {
    try {
      await ensureFolder(session.dropbox.accessToken, path);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create folder";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  await updateSession({
    folder: { path, name: folderName },
  });

  return NextResponse.json({ ok: true, folder: { path, name: folderName } });
}
