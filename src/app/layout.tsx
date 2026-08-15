import type { Metadata, Viewport } from "next";
import { Figtree, Syne } from "next/font/google";
import { DesktopGate } from "@/components/DesktopGate";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Meridian — Apple Photos to Dropbox",
  description:
    "Cloud-to-cloud photo transfer from Apple Photos to Dropbox. Sign in with Apple, authorize Dropbox, choose a folder, and upload.",
  appleWebApp: {
    capable: true,
    title: "Meridian",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07131a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full">
        <DesktopGate>{children}</DesktopGate>
      </body>
    </html>
  );
}
