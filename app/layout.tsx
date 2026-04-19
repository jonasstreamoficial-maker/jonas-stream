import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JONAS STREAM | Premium",
  description:
    "Proveedor premium de plataformas de streaming, música y accesos digitales.",
  keywords: [
    "Jonas Stream",
    "Netflix Premium",
    "Spotify Premium",
    "Disney Plus",
    "Streaming",
    "Cuentas Premium",
  ],
  themeColor: "#01E7EF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}