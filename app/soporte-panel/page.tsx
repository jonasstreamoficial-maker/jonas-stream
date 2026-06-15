"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import styles from "./soporte-panel.module.css"

export default function SoportePanelPage() {
  const router = useRouter()

  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const ingresarSoporte = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje("")

    const correoLimpio = correo.trim().toLowerCase()
    const passwordLimpio = password.trim()

    if (!correoLimpio || !passwordLimpio) {
      setMensaje("Completa usuario y contraseña.")
      return
    }

    setCargando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correoLimpio,
      password: passwordLimpio,
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

    const autorizado =
      !errorUsuario &&
      usuario &&
      usuario.rol === "admin" &&
      (usuario.estado === "aprobado" || usuario.estado === "activo")

    if (!autorizado) {
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
      <div className={styles.sideTextLeft}>JONAS STREAM</div>
      <div className={styles.sideTextRight}>SOPORTE</div>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <section className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span>JONAS STREAM</span>
            <small>SOPORTE INTERNO</small>
          </div>

          <nav className={styles.navActions}>
            <button type="button" onClick={() => router.push("/")}>
              INICIO
            </button>
            <button type="button" onClick={() => router.push("/codigos")}>
              CÓDIGOS
            </button>
          </nav>
        </header>

        <section className={styles.heroPanel}>
          <div className={styles.leftSection}>
            <div className={styles.badge}>
              <span></span>
              Sistema interno JONAS STREAM
            </div>

            <h1>
              SOPORTE <br />
              <strong>PANEL</strong>
            </h1>

            <p className={styles.description}>
              Gestiona correos asignados, PIN públicos, mensajes recibidos y
              consultas de códigos desde un panel privado para administradores.
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p>Consulta pública</p>
                <h3>/codigos</h3>
                <span>Correo asignado + PIN</span>
              </div>

              <div className={styles.statCard}>
                <p>Buzón central</p>
                <h3>Activo</h3>
                <span>Recepción automática</span>
              </div>

              <div className={styles.statCard}>
                <p>Panel privado</p>
                <h3>Admin</h3>
                <span>Correos, PIN y mensajes</span>
              </div>
            </div>

            <div className={styles.quickPreview}>
              <div className={styles.previewHeader}>
                <span></span>
                Flujo del sistema
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>Correo recibido</p>
                  <small>El mensaje entra por el buzón central.</small>
                </div>
                <span className={styles.active}>Recibido</span>
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>Panel procesa</p>
                  <small>Se guarda en bandeja y se notifica al administrador.</small>
                </div>
                <span className={styles.paused}>Panel</span>
              </div>

              <div className={styles.previewItem}>
                <div>
                  <p>Cliente consulta</p>
                  <small>Solo ve mensajes de su correo asignado.</small>
                </div>
                <span className={styles.active}>Seguro</span>
              </div>
            </div>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.loginCard}>
              <div className={styles.cardHeader}>
                <div className={styles.logoBox}>JS</div>

                <div>
                  <p className={styles.cardKicker}>ACCESO ADMIN</p>
                  <h2>Iniciar sesión</h2>
                  <span>Cuenta autorizada para gestionar soporte.</span>
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
                    disabled={cargando}
                  />
                </label>

                <label>
                  Contraseña
                  <div className={styles.passwordRow}>
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={cargando}
                    />

                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setMostrarPassword((actual) => !actual)}
                      disabled={cargando}
                    >
                      {mostrarPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                </label>

                {mensaje && <div className={styles.errorBox}>{mensaje}</div>}

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={cargando}
                >
                  {cargando ? "VALIDANDO ACCESO..." : "ENTRAR AL PANEL"}
                </button>
              </form>

              <div className={styles.securityNotice}>
                <strong>Seguridad activa:</strong> solo administradores aprobados
                pueden ingresar al panel interno.
              </div>

              <div className={styles.quickActions}>
                <button
                  type="button"
                  className={styles.publicButton}
                  onClick={() => router.push("/codigos")}
                >
                  PÁGINA PÚBLICA
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => router.push("/")}
                >
                  INICIO
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          © 2026 Jonas Stream. Panel interno de soporte.
        </footer>
      </section>
    </main>
  )
}
