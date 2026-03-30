"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Usuario = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

export default function ProveedorPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const guardado = localStorage.getItem("usuario")

    if (!guardado) {
      router.push("/login")
      return
    }

    const usuarioParseado: Usuario = JSON.parse(guardado)

    if (usuarioParseado.rol !== "proveedor") {
      router.push("/login")
      return
    }

    setUsuario(usuarioParseado)
  }, [router])

  const cerrarSesion = () => {
    localStorage.removeItem("usuario")
    router.push("/login")
  }

  return (
    <main style={{ minHeight: "100vh", background: "#030507", color: "white", padding: "40px" }}>
      <h1>Panel Proveedor</h1>
      <p style={{ marginTop: "10px" }}>Bienvenido: {usuario?.nombre}</p>
      <p>Correo: {usuario?.correo}</p>

      <button
        onClick={cerrarSesion}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "none",
          background: "#00e5ff",
          color: "#001018",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </main>
  )
}