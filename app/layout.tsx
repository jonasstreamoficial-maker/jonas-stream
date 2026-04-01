import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "JONAS STREAM",
  description: "Panel profesional con Next.js y Supabase",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <body className="body-root">
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(8, 16, 24, 0.96)",
              color: "#00fff7",
              border: "1px solid rgba(0,255,247,0.25)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 20px rgba(0,255,247,0.12)",
              borderRadius: "16px",
            },
            success: {
              style: {
                background: "rgba(8, 16, 24, 0.96)",
                color: "#00fff7",
                border: "1px solid rgba(0,255,247,0.25)",
              },
            },
            error: {
              style: {
                background: "rgba(8, 16, 24, 0.96)",
                color: "#ff9d9d",
                border: "1px solid rgba(255,120,120,0.25)",
              },
            },
          }}
        />
      </body>
    </html>
  )
}