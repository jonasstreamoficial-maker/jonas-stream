import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jonas Stream | Oficial",
  description:
    "Tu proveedor de confianza en plataformas de streaming, música y accesos digitales premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}