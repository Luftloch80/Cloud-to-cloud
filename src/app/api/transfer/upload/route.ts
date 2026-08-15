import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/dropbox";
import { readSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session?.apple) {
    return NextResponse.json({ error: "Sign in with Apple first" }, { status: 401 });
  }
  if (!session.dropbox?.accessToken) {
    return NextResponse.json({ error: "Connect Dropbox first" }, { status: 401 });
  }
  if (!session.folder?.path) {
    return NextResponse.json({ error: "Choose a Dropbox folder first" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const safeName = file.name.replace(/[^\w.\- ()[\]]+/g, "_") || `photo-${Date.now()}.jpg`;

  if (session.dropbox.accessToken === "demo-token") {
    // Simulate cloud transfer latency
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    return NextResponse.json({
      ok: true,
      demo: true,
      path: `${session.folder.path}/${safeName}`,
      size: buffer.byteLength,
    });
  }

  try {
    const result = await uploadFile(
      session.dropbox.accessToken,
      session.folder.path,
      safeName,
      buffer,
    );
    return NextResponse.json({ ok: true, demo: false, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
