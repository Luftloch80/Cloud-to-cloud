function appBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const url = new URL(request.url);
  if (url.hostname === "0.0.0.0" || url.hostname === "::") {
    url.hostname = "localhost";
  }
  return url.origin;
}

export function appUrl(request: Request, path: string) {
  return new URL(path, `${appBaseUrl(request)}/`);
}
