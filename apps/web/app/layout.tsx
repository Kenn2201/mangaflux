import type {
  Metadata,
  Viewport
} from "next";
import AppChrome from "./AppChrome";
import PwaRuntime from "./PwaRuntime";
import "./styles.css";
import "./v060.css";
import "./v070.css";
import "./v071.css";
import "./v072.css";
import "./v073.css";
import "./v080.css";
import "./v081.css";
import "./v082.css";
import "./v090.css";
import "./v091.css";
import "./v110.css";
import "./v112.css";
import "./v113.css";
import "./v114.css";
import "./v115.css";
import "./v120.css";
import "./v121.css";
import "./v122.css";
import "./v123.css";
import "./v124.css";
import "./v125.css";
import "./v130.css";
import "./v131.css";
import "./v134.css";
import "./v140.css";
import "./v137.css";
import "./v142.css";
import "./v143.css";
import "./v144.css";
import "./v145.css";
import "./v146.css";
import "./v147.css";
import "./v150.css";

export const metadata: Metadata = {
  title: {
    default: "MangaFlux",
    template: "%s · MangaFlux"
  },
  description:
    "A mobile-first manga discovery and reading platform powered by source adapters.",
  applicationName: "MangaFlux",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MangaFlux",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090909"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaRuntime />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
