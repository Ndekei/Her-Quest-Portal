import type { Metadata, Viewport } from "next";
import { PREFS_BOOT_SCRIPT } from "@/lib/storage";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Study Notes", template: "%s · Study Notes" },
  description: "A calm, readable home for Dr. Constable’s expository notes on every book of the Bible.",
  appleWebApp: { capable: true, title: "Study Notes", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
