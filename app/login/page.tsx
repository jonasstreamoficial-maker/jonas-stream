"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

const WHATSAPP_NUMBER = "51900557949";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
};

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensajeDebug, setMensajeDebug] = useState<string | null>(null);

  const iniciarSesion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setMensajeDebug(null);

    const correoNormalizado = correo.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: correoNormalizado,
        password: contrasena,
      });

      if (authError || !authData.user) {
        setMensajeDebug(`ERROR AUTH: ${authError?.message || "No se pudo iniciar sesion"}`);
        toast.error("Correo o contrasena incorrectos");
        setCargando(false);
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (error) {
        await supabase.auth.signOut();
        setMensajeDebug(`ERROR PERFIL: ${error.message}`);
        toast.error("No se pudo leer tu perfil");
        setCargando(false);
        return;
      }

      if (!data) {
        await supabase.auth.signOut();
        setMensajeDebug("No existe perfil en public.usuarios con el mismo ID de Auth. Revisa que registro cree ambos con el mismo id.");
        toast.error("Perfil no encontrado");
        setCargando(false);
        return;
      }

      const usuario = data as Usuario;

      if (usuario.estado === "pendiente") {
        await supabase.auth.signOut();
        setMensajeDebug("CUENTA PENDIENTE: el admin aun no aprobo esta cuenta.");
        toast("Tu cuenta esta pendiente de aprobacion");
        setCargando(false);
        return;
      }

      if (usuario.estado === "rechazado") {
        await supabase.auth.signOut();
        setMensajeDebug("CUENTA RECHAZADA: el usuario esta bloqueado.");
        toast.error("Tu cuenta fue rechazada");
        setCargando(false);
        return;
      }

      if (usuario.estado !== "aprobado" && usuario.estado !== "activo") {
        await supabase.auth.signOut();
        setMensajeDebug(`CUENTA NO HABILITADA: estado actual ${usuario.estado}`);
        toast.error("Tu cuenta no esta habilitada");
        setCargando(false);
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("jonas_login_ok", new Date().toISOString());

      toast.success("Bienvenido 🚀");

      const destino =
        usuario.rol === "admin"
          ? "/admin"
          : usuario.rol === "proveedor"
            ? "/proveedor"
            : "/cliente";

      router.replace(destino);
      router.refresh();

      window.setTimeout(() => {
        window.location.assign(destino);
      }, 250);
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Error desconocido";
      setMensajeDebug(`ERROR GENERAL: ${detalle}`);
      toast.error("Error al iniciar sesion");
      setCargando(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
            <strong>JONAS STREAM</strong>
            <span>ACCESO OFICIAL</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <a
              href={buildWhatsAppLink("Hola Jonas Stream, necesito ayuda con mi acceso.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTACTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.loginShell}>
        <div className={styles.brandPanel}>
          <div className={styles.heroBadge}>ACCESO OFICIAL</div>

          <h1 className={styles.heroTitle}>
            ENTRA A TU
            <span> CUENTA</span>
          </h1>

          <p className={styles.heroText}>
            Inicia sesion para acceder a tu panel de Jonas Stream segun tu tipo de cuenta.
          </p>

          <div className={styles.accessGrid} aria-label="Accesos disponibles">
            <div className={styles.accessCard}>
              <span>CLIENTE</span>
              <strong>Consulta tus pedidos y servicios activos.</strong>
            </div>

            <div className={styles.accessCard}>
              <span>PROVEEDOR</span>
              <strong>Gestiona productos y disponibilidad.</strong>
            </div>

            <div className={styles.accessCard}>
              <span>ADMIN</span>
              <strong>Administra usuarios, ventas y configuracion.</strong>
            </div>
          </div>

          <p className={styles.panelNote}>
            Si tu cuenta esta pendiente, espera la aprobacion o comunicate con soporte.
          </p>
        </div>

        <form onSubmit={iniciarSesion} className={styles.loginCard}>
          <div className={styles.cardGlow} />

          <div className={styles.formHeader}>
            <span className={styles.formKicker}>CUENTA JONAS STREAM</span>
            <h2>Iniciar sesion</h2>
            <p>Ingresa con tu correo y contrasena registrados.</p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="correo">Correo electronico</label>

            <div className={styles.inputWrap}>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tunombre@correo.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="contrasena">Contrasena</label>

            <div className={`${styles.inputWrap} ${styles.passwordWrap}`}>
              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contrasena"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setMostrarContrasena((prev) => !prev)}
                aria-label={mostrarContrasena ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {mostrarContrasena ? "OCULTAR" : "VER"}
              </button>
            </div>
          </div>

          {mensajeDebug && (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid rgba(255, 143, 163, 0.38)",
                background: "rgba(255, 143, 163, 0.1)",
                color: "#ffd7df",
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {mensajeDebug}
            </div>
          )}

          <button type="submit" disabled={cargando} className={styles.submitButton}>
            {cargando ? "Ingresando..." : "Entrar al panel"}
          </button>

          <div className={styles.formFooter}>
            <Link href="/" className={styles.secondaryLink}>
              Volver al inicio
            </Link>

            <span>Acceso exclusivo para usuarios registrados.</span>
          </div>
        </form>
      </section>

      <footer className={styles.footerWrap}>
        <div className={styles.footerLegal}>
          © 2026 Jonas Stream. Todos los derechos reservados.
          <div className={styles.footerLinks}>
            <Link href="/terminos">Terminos y Condiciones</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="/privacidad">Politica de Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
