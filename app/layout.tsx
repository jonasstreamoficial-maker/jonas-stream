import "./globals.css"
import { Toaster } from "react-hot-toast"

export const metadata = {
  title: "JONAS STREAM",
  description: "Plataforma digital premium",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
              border: "1px solid rgba(0,229,255,0.3)",
            },
          }}
        />
      </body>
    </html>
  )
}