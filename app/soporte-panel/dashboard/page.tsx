"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type UsuarioAdmin = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

export default function SoporteDashboardPage() {
  const router = useRouter()

  const [verificando, setVerificando] = useState(true)
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null)

  useEffect(() => {
    const validarAcceso = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace("/soporte-panel")
        return
      }

      const { data: usuarioDB, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado")
        .eq("id", user.id)
        .single()

      if (
        errorUsuario ||
        !usuarioDB ||
        usuarioDB.rol !== "admin" ||
        (usuarioDB.estado !== "aprobado" && usuarioDB.estado !== "activo")
      ) {
        await supabase.auth.signOut()
        router.replace("/soporte-panel")
        return
      }

      setUsuario(usuarioDB as UsuarioAdmin)
      setVerificando(false)
    }

    validarAcceso()
  }, [router])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace("/soporte-panel")
  }

  if (verificando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
          color: "#ECFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(1, 231, 239, 0.18)",
            background: "rgba(3, 19, 22, 0.78)",
            borderRadius: "22px",
            padding: "28px",
            boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#01E7EF",
              fontWeight: 900,
              letterSpacing: "0.14em",
              margin: 0,
            }}
          >
            JONAS STREAM
          </p>

          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>

          <p style={{ color: "#9BC8CB", margin: 0 }}>
            Validando sesión administrativa.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(0, 251, 255, 0.14), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
        color: "#ECFFFF",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "center",
            marginBottom: "34px",
          }}
        >
          <div>
            <p
              style={{
                color: "#01E7EF",
                letterSpacing: "0.16em",
                fontWeight: 900,
                fontSize: "13px",
                margin: 0,
              }}
            >
              JONAS STREAM · SOPORTE PANEL
            </p>

            <h1
              style={{
                fontSize: "52px",
                margin: "12px 0",
                lineHeight: 1,
              }}
            >
              Dashboard de soporte
            </h1>

            <p
              style={{
                color: "#9BC8CB",
                maxWidth: "620px",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Aquí se administrarán clientes, correos asignados, mensajes
              recibidos, renovaciones, vencimientos y alertas de Telegram.
            </p>
          </div>

          <div
            style={{
              border: "1px solid rgba(1, 231, 239, 0.18)",
              background: "rgba(3, 19, 22, 0.78)",
              borderRadius: "20px",
              padding: "16px",
              minWidth: "260px",
              boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
            }}
          >
            <p style={{ color: "#9BC8CB", margin: "0 0 6px", fontSize: "13px" }}>
              Administrador
            </p>

            <strong style={{ display: "block", color: "#ECFFFF" }}>
              {usuario?.nombre || "Admin"}
            </strong>

            <span
              style={{
                display: "block",
                color: "#9BC8CB",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {usuario?.correo}
            </span>

            <button
              type="button"
              onClick={cerrarSesion}
              style={{
                width: "100%",
                marginTop: "14px",
                border: "1px solid rgba(1, 231, 239, 0.18)",
                background: "rgba(1, 231, 239, 0.08)",
                color: "#01E7EF",
                borderRadius: "14px",
                padding: "12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "18px",
            marginTop: "36px",
          }}
        >
          {[
            ["Clientes activos", "0"],
            ["Clientes vencidos", "0"],
            ["Correos asignados", "0"],
            ["Mensajes recibidos", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                border: "1px solid rgba(1, 231, 239, 0.18)",
                background: "rgba(3, 19, 22, 0.78)",
                borderRadius: "22px",
                padding: "24px",
                boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
              }}
            >
              <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>

              <strong
                style={{
                  display: "block",
                  color: "#01E7EF",
                  fontSize: "38px",
                  marginTop: "12px",
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>

        <section
          style={{
            marginTop: "30px",
            border: "1px solid rgba(1, 231, 239, 0.18)",
            background: "rgba(3, 19, 22, 0.78)",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
          }}
        >
          <p
            style={{
              color: "#01E7EF",
              fontWeight: 900,
              letterSpacing: "0.12em",
              fontSize: "13px",
              margin: 0,
            }}
          >
            SIGUIENTE MÓDULO
          </p>

          <h2 style={{ margin: "12px 0" }}>Gestión de clientes</h2>

          <p style={{ color: "#9BC8CB", lineHeight: 1.7, margin: 0 }}>
            El próximo paso será crear la tabla de clientes con nombre, correo
            asignado, plataforma, fecha de inicio, fecha de vencimiento y estado:
            activo, vencido o suspendido.
          </p>
        </section>
      </section>
    </main>
  )
}