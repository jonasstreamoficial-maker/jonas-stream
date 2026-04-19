// app/layout.tsx

import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "JONAS STREAM",
  description: "Plataforma premium oficial",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#081018",
              color: "#00e5ff",
              border: "1px solid rgba(0,229,255,0.25)",
            },
          }}
        />
      </body>
    </html>
  )
}