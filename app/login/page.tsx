"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

type Usuario = {
  id: string
  nombre: string
  correo: string
  contrasena: string
  rol: string
  estado: string
}

export default function LoginPage() {
  const router = useRouter()

  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [cargando, setCargando] = useState(false)

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correo)
      .eq("contrasena", contrasena)
      .single()

    if (error || !data) {
      toast.error("Correo o contraseña incorrectos")
      setCargando(false)
      return
    }

    const usuario = data as Usuario

    if (usuario.estado === "pendiente") {
      toast("Tu cuenta está pendiente de aprobación")
      setCargando(false)
      return
    }

    if (usuario.estado === "rechazado") {
      toast.error("Tu cuenta fue rechazada")
      setCargando(false)
      return
    }

    localStorage.setItem("usuario", JSON.stringify(usuario))

    toast.success("Bienvenido 🚀")

    if (usuario.rol === "admin") {
      router.push("/admin")
    } else if (usuario.rol === "proveedor") {
      router.push("/proveedor")
    } else {
      router.push("/cliente")
    }

    setCargando(false)
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030507",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <form
        onSubmit={iniciarSesion}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#0b1118",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 0 30px rgba(0,255,255,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "10px", fontSize: "28px" }}>JONAS STREAM</h1>
        <p style={{ marginBottom: "24px", color: "#9fb0c0" }}>Iniciar sesión</p>

        <div style={{ marginBottom: "16px" }}>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #1f2b38",
              background: "#081018",
              color: "white",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #1f2b38",
              background: "#081018",
              color: "white",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "#00e5ff",
            color: "#001018",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {cargando ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </main>
  )
}