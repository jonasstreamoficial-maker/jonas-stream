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
            Controla correos asignados, PIN de acceso, mensajes recibidos,
            reenviadores y consultas de códigos desde una sola plataforma.
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p>Consulta pública</p>
              <h3>/codigos</h3>
              <span>Acceso por correo + PIN</span>
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
                <p>Cliente solicita código</p>
                <small>El correo llega al buzón central</small>
              </div>
              <span className={styles.active}>Recibido</span>
            </div>

            <div className={styles.previewItem}>
              <div>
                <p>El panel procesa el mensaje</p>
                <small>Se muestra en dashboard y bandeja</small>
              </div>
              <span className={styles.paused}>Panel</span>
            </div>

            <div className={styles.previewItem}>
              <div>
                <p>Cliente consulta en /codigos</p>
                <small>Solo ve mensajes de su correo asignado</small>
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
                <h2>Acceso administrativo</h2>
                <p>Ingresa con una cuenta autorizada para gestionar soporte.</p>
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

              <button type="submit" className={styles.primaryButton} disabled={cargando}>
                {cargando ? "Validando acceso..." : "Ingresar al soporte panel"}
              </button>
            </form>

            <div className={styles.securityNotice}>
              <strong>Seguridad activa:</strong> solo administradores aprobados
              pueden entrar al panel interno.
            </div>

            <div className={styles.quickActions}>
              <button
                type="button"
                className={styles.publicButton}
                onClick={() => router.push("/codigos")}
              >
                Página pública
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/")}
              >
                Inicio
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
