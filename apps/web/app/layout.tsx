import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "MangaFlux",
  description: "A modular manga reader and source-adapter platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
