"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Usuario = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

type Pedido = {
  id: string
  total: number
  estado: string
  metodo_pago: string
  created_at: string
}

export default function ClientePage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const guardado = localStorage.getItem("usuario")

    if (!guardado) {
      router.push("/login")
      return
    }

    const usuarioParseado: Usuario = JSON.parse(guardado)

    if (usuarioParseado.rol !== "cliente" && usuarioParseado.rol !== "admin") {
      router.push("/login")
      return
    }

    setUsuario(usuarioParseado)
    cargarPedidos(usuarioParseado.id)
  }, [router])

  const cargarPedidos = async (usuarioId: string) => {
    setCargando(true)

    const { data } = await supabase
      .from("pedidos")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false })

    setPedidos(data || [])
    setCargando(false)
  }

  const cerrarSesion = () => {
    localStorage.removeItem("usuario")
    router.push("/login")
  }

  if (cargando) {
    return (
      <main style={estilos.main}>
        <div style={estilos.loader}>⚡ Cargando panel cliente...</div>
      </main>
    )
  }

  return (
    <main style={estilos.main}>
      <div style={estilos.fondoGlow}></div>

      <section style={estilos.header}>
        <div>
          <p style={estilos.miniMarca}>JONAS STREAM</p>
          <h1 style={estilos.titulo}>Panel Cliente</h1>
          <p style={estilos.subtexto}>Bienvenido: {usuario?.nombre}</p>
          <p style={estilos.subtexto}>Correo: {usuario?.correo}</p>
        </div>

        <button onClick={cerrarSesion} style={estilos.botonPrincipal}>
          Cerrar sesión
        </button>
      </section>

      <section style={estilos.seccion}>
        <h2 style={estilos.sectionTitle}>Mis pedidos</h2>

        {pedidos.length === 0 ? (
          <div style={estilos.card}>
            <p style={estilos.infoTexto}>Aún no tienes pedidos registrados.</p>
          </div>
        ) : (
          <div style={estilos.grid}>
            {pedidos.map((pedido) => (
              <div key={pedido.id} style={estilos.card}>
                <h3 style={estilos.cardTitle}>Pedido #{pedido.id.slice(0, 8)}</h3>
                <p style={estilos.infoTexto}>Total: S/ {pedido.total}</p>
                <p style={estilos.infoTexto}>Método de pago: {pedido.metodo_pago}</p>
                <p style={estilos.infoTexto}>
                  Estado:{" "}
                  <span
                    style={{
                      color:
                        pedido.estado === "completado"
                          ? "#7CFFB2"
                          : pedido.estado === "cancelado"
                          ? "#FF8B8B"
                          : "#FFE082",
                      fontWeight: "bold",
                    }}
                  >
                    {pedido.estado}
                  </span>
                </p>
                <p style={estilos.infoTexto}>
                  Fecha: {new Date(pedido.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const estilos: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,229,255,0.08), transparent 25%), #030507",
    color: "white",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  fondoGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 20%, rgba(0,251,255,0.06), transparent 30%), radial-gradient(circle at 80% 10%, rgba(0,229,255,0.05), transparent 25%)",
    pointerEvents: "none",
  },
  loader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    fontSize: "20px",
    color: "#00e5ff",
  },
  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  miniMarca: {
    color: "#00e5ff",
    letterSpacing: "4px",
    fontSize: "14px",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  titulo: {
    fontSize: "38px",
    marginBottom: "10px",
    textShadow: "0 0 18px rgba(0,229,255,0.25)",
  },
  subtexto: {
    color: "#c7d7e2",
    marginBottom: "6px",
  },
  seccion: {
    position: "relative",
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: "24px",
    marginBottom: "18px",
    color: "#00e5ff",
  },
  grid: {
    display: "grid",
    gap: "18px",
  },
  card: {
    background: "rgba(11, 17, 24, 0.88)",
    border: "1px solid rgba(0,229,255,0.22)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 0 18px rgba(0,229,255,0.07)",
  },
  cardTitle: {
    fontSize: "22px",
    marginBottom: "12px",
  },
  infoTexto: {
    color: "#d4e3ee",
    marginBottom: "8px",
  },
  botonPrincipal: {
    background: "#00e5ff",
    color: "#001018",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(0,229,255,0.25)",
  },
}