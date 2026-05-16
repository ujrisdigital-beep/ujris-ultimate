import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: { default: "UJRIS — Justice Platform", template: "%s | UJRIS" },
  description: "AI-powered legal companion. Case management, research, form generation, and court filing for everyone.",
  keywords: ["legal tech", "justice", "AI lawyer", "court forms", "legal research", "case management"],
  authors: [{ name: "UJRIS" }],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "UJRIS" },
  openGraph: {
    type: "website",
    siteName: "UJRIS",
    title: "UJRIS — Justice for Everyone",
    description: "The world's most complete AI-powered justice tech platform.",
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/ujris-logo.png" />
        <link rel="apple-touch-icon" href="/ujris-3d-logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#1E3A5F", color: "#EEF2F7", border: "1px solid rgba(255,255,255,0.1)" },
            success: { iconTheme: { primary: "#22C55E", secondary: "#0D1B2A" } },
            error:   { iconTheme: { primary: "#E53E3E", secondary: "#0D1B2A" } },
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
          }}
        />
      </body>
    </html>
  );
}
