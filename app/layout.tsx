import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jonas Stream | Oficial",
  description:
    "Tu proveedor de confianza en plataformas de streaming, música y accesos digitales premium.",
  keywords: [
    "Jonas Stream",
    "streaming",
    "plataformas digitales",
    "cuentas premium",
    "revendedores",
    "Netflix",
    "Spotify",
    "Disney Plus",
  ],
  authors: [{ name: "Jonas Stream" }],
  creator: "Jonas Stream",
  openGraph: {
    title: "Jonas Stream | Oficial",
    description:
      "Plataformas de streaming, música y accesos digitales premium con atención rápida, soporte y confianza.",
    type: "website",
    locale: "es_PE",
    siteName: "Jonas Stream",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
