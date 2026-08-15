import { Dropbox } from "dropbox";
import type { DropboxFolderEntry } from "./types";

export function dropboxConfigured() {
  return Boolean(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);
}

export function getDropboxAuthUrl(state: string) {
  const clientId = process.env.DROPBOX_APP_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/dropbox/callback`;
  if (!clientId) throw new Error("DROPBOX_APP_KEY is not set");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    token_access_type: "offline",
    redirect_uri: redirectUri,
    state,
  });

  return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDropboxCode(code: string) {
  const clientId = process.env.DROPBOX_APP_KEY;
  const clientSecret = process.env.DROPBOX_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/dropbox/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Dropbox app credentials are not configured");
  }

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox token exchange failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    account_id?: string;
    uid?: string;
  }>;
}

export async function refreshDropboxToken(refreshToken: string) {
  const clientId = process.env.DROPBOX_APP_KEY;
  const clientSecret = process.env.DROPBOX_APP_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Dropbox app credentials are not configured");
  }

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropbox refresh failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in?: number;
  }>;
}

export function createDropboxClient(accessToken: string) {
  return new Dropbox({ accessToken, fetch: fetch.bind(globalThis) });
}

export async function getDropboxAccount(accessToken: string) {
  const dbx = createDropboxClient(accessToken);
  const account = await dbx.usersGetCurrentAccount();
  return {
    accountId: account.result.account_id,
    email: account.result.email,
    displayName: account.result.name.display_name,
  };
}

export async function listFolders(
  accessToken: string,
  path: string,
): Promise<DropboxFolderEntry[]> {
  const dbx = createDropboxClient(accessToken);
  const normalized = path === "/" ? "" : path;
  const response = await dbx.filesListFolder({ path: normalized });

  return response.result.entries
    .filter((entry) => entry[".tag"] === "folder")
    .map((entry) => ({
      id: (entry as { id?: string }).id || entry.path_lower || entry.name,
      name: entry.name,
      path: entry.path_display || entry.path_lower || `/${entry.name}`,
      tag: "folder" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function ensureFolder(accessToken: string, path: string) {
  if (!path || path === "/") return;
  const dbx = createDropboxClient(accessToken);
  try {
    await dbx.filesCreateFolderV2({ path, autorename: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("path/conflict") && !/conflict/i.test(message)) {
      // Dropbox SDK throws with status; ignore existing folder
      const status = (error as { status?: number }).status;
      if (status !== 409) throw error;
    }
  }
}

export async function uploadFile(
  accessToken: string,
  folderPath: string,
  fileName: string,
  contents: ArrayBuffer,
) {
  const dbx = createDropboxClient(accessToken);
  const base = folderPath === "/" ? "" : folderPath.replace(/\/$/, "");
  const path = `${base}/${fileName}`;

  const result = await dbx.filesUpload({
    path,
    contents,
    mode: { ".tag": "add" },
    autorename: true,
    mute: false,
  });

  return {
    path: result.result.path_display || path,
    id: result.result.id,
    size: result.result.size,
  };
}
