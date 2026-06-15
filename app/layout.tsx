import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jonasstream.xyz"),

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
      <body suppressHydrationWarning>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              background: "rgba(3, 19, 22, 0.96)",
              color: "#ECFFFF",
              border: "1px solid rgba(1,231,239,0.35)",
              borderRadius: "18px",
              padding: "14px 18px",
              backdropFilter: "blur(18px)",
              boxShadow: "0 0 30px rgba(0,251,255,0.18)",
              fontWeight: "700",
              fontSize: "14px",
            },

            success: {
              iconTheme: {
                primary: "#00FBFF",
                secondary: "#031316",
              },
            },

            error: {
              iconTheme: {
                primary: "#ff4d6d",
                secondary: "#031316",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
