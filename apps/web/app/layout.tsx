import type {
  Metadata,
  Viewport
} from "next";
import AppChrome from "./AppChrome";
import "./styles.css";
import "./v060.css";
import "./v070.css";

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
