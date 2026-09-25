import type {
  Metadata,
  Viewport
} from "next";
import AppChrome from "./AppChrome";
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

export const metadata: Metadata = {
  title: {
    default: "MangaFlux",
    template: "%s · MangaFlux"
  },
  description:
    "A mobile-first manga discovery and reading platform powered by source adapters."
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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
