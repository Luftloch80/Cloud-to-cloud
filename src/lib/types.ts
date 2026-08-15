export type AppleUser = {
  id: string;
  email?: string;
  name?: string;
};

export type DropboxConnection = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  accountId?: string;
  email?: string;
  displayName?: string;
};

export type SelectedFolder = {
  path: string;
  name: string;
  id?: string;
};

export type SessionData = {
  apple?: AppleUser;
  dropbox?: DropboxConnection;
  folder?: SelectedFolder;
  createdAt: number;
};

export type DropboxFolderEntry = {
  id: string;
  name: string;
  path: string;
  tag: "folder" | "file";
};
