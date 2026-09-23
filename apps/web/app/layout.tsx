import type {
  Metadata,
  Viewport
} from "next";
import AppChrome from "./AppChrome";
import "./styles.css";
import "./v060.css";

export const metadata: Metadata = {
  title: {
    default: "MangaFlux",
    template: "%s · MangaFlux"
  },
  description: "A mobile-first modular manga reader and source-adapter platform."
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
