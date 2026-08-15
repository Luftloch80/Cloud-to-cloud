"use client";

import { useEffect, useState } from "react";

export function DesktopGate({ children }: { children: React.ReactNode }) {
  const [wide, setWide] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 520px)");
    const update = () => setWide(mq.matches);
    update();
    setReady(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!ready) {
    return <div className="min-h-dvh bg-[var(--ink)]" />;
  }

  if (wide) {
    return (
      <div className="desktop-gate">
        <div className="desktop-gate__phone" aria-hidden>
          <div className="desktop-gate__notch" />
          <div className="desktop-gate__screen">{children}</div>
        </div>
        <p className="desktop-gate__hint">
          Meridian is built for iPhone. Scan or open this page on your phone —
          or use the preview above.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
