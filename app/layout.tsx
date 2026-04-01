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
            style: {
              background: "#081018",
              color: "#00fff7",
              border: "1px solid rgba(0,255,247,0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 15px rgba(0,255,247,0.25)",
            },
            success: {
              style: {
                background: "#081018",
                color: "#00fff7",
                border: "1px solid rgba(0,255,247,0.3)",
              },
            },
            error: {
              style: {
                background: "#081018",
                color: "#ff8a8a",
                border: "1px solid rgba(255,120,120,0.3)",
              },
            },
          }}
        />
      </body>
    </html>
  )
}