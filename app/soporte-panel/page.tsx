"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import styles from "./soporte-panel.module.css"

export default function SoportePanelPage() {
  const router = useRouter()

  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const ingresarSoporte = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje("")

    if (!correo.trim() || !password.trim()) {
      setMensaje("Completa usuario y contraseña.")
      return
    }

    setCargando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: password.trim(),
    })

    if (error || !data.user) {
      setMensaje("Usuario o contraseña incorrectos.")
      setCargando(false)
      return
    }

    const { data: usuario, error: errorUsuario } = await supabase
      .from("usuarios")
      .select("id,nombre,correo,rol,estado")
      .eq("id", data.user.id)
      .single()

    if (
      errorUsuario ||
      !usuario ||
      usuario.rol !== "admin" ||
      (usuario.estado !== "aprobado" && usuario.estado !== "activo")
    ) {
      await supabase.auth.signOut()
      setMensaje("No tienes permiso para ingresar al soporte panel.")
      setCargando(false)
      return
    }

    router.push("/soporte-panel/dashboard")
  }

  return (
    <main className={styles.page}>
      <div className={styles.gridBackground}></div>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <section className={styles.wrapper}>
        <div className={styles.leftSection}>
          <div className={styles.badge}>
            <span></span>
            Sistema interno JONAS STREAM
          </div>

          <h1>
            Soporte <br />
            <strong>Panel</strong>
          </h1>

          <p className={styles.description}>
            Administra clientes, correos asignados, mensajes recibidos,
            renovaciones, vencimientos y alertas privadas conectadas a Telegram.
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p>Clientes activos</p>
              <h3>128</h3>
              <span>Gestión mensual</span>
            </div>

            <div className={styles.statCard}>
              <p>Correos asignados</p>
              <h3>246</h3>
              <span>Por plataforma</span>
            </div>

            <div className={styles.statCard}>
              <p>Mensajes recibidos</p>
              <h3>1,842</h3>
              <span>Historial seguro</span>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <div className={styles.logoBox}>JS</div>

              <div>
                <h2>Acceso administrativo</h2>
                <p>Panel privado de soporte y gestión.</p>
              </div>
            </div>

            <form className={styles.form} onSubmit={ingresarSoporte}>
              <label>
                Usuario
                <input
                  type="email"
                  placeholder="admin@jonasstream.xyz"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {mensaje && (
                <div
                  style={{
                    border: "1px solid rgba(255, 67, 67, 0.36)",
                    background: "rgba(255, 67, 67, 0.12)",
                    color: "#ECFFFF",
                    borderRadius: "14px",
                    padding: "12px",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  {mensaje}
                </div>
              )}

              <button type="submit" disabled={cargando}>
                {cargando ? "Validando acceso..." : "Ingresar al soporte panel"}
              </button>
            </form>

            <div className={styles.securityNotice}>
              <strong>Seguridad activa:</strong> solo administradores autorizados
              podrán ingresar al soporte panel.
            </div>

            <div className={styles.quickPreview}>
              <div className={styles.previewHeader}>
                <span></span>
                Vista rápida del sistema
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>Cris</p>
                  <small>Netflix · cris01@jonasstream.xyz</small>
                </div>
                <span className={styles.active}>Activo</span>
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>Luis</p>
                  <small>Disney · luis02@jonasstream.xyz</small>
                </div>
                <span className={styles.expired}>Vencido</span>
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>María</p>
                  <small>Prime Video · maria03@jonasstream.xyz</small>
                </div>
                <span className={styles.paused}>Suspendido</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}