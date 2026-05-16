"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

const WHATSAPP_NUMBER = "51900557949";

type Usuario = {
  id: string;
  nombre: string | null;
  correo: string;
  contrasena?: string | null;
  rol: string | null;
  estado: string | null;
  pais?: string | null;
  codigo_pais?: string | null;
  celular?: string | null;
  celular_completo?: string | null;
  telefono?: string | null;
};

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function normalizarCorreo(value: string) {
  return value.trim().toLowerCase();
}

function nombreDesdeCorreo(email: string) {
  const base = email.split("@")[0] || "cliente";
  return base.replace(/[._-]+/g, " ").trim() || "cliente";
}

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensajeDebug, setMensajeDebug] = useState<string | null>(null);

  const iniciarSesion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);
    setMensajeDebug(null);

    const correoNormalizado = normalizarCorreo(correo);
    const contrasenaLimpia = contrasena.trim();

    if (!correoNormalizado || !contrasenaLimpia) {
      toast.error("Ingresa correo y contraseña");
      setCargando(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .ilike("correo", correoNormalizado)
        .maybeSingle();

      if (error) {
        setMensajeDebug(`ERROR USUARIOS: ${error.message}`);
        toast.error("Error consultando usuario");
        setCargando(false);
        return;
      }

      if (!data) {
        setMensajeDebug("USUARIO NO ENCONTRADO EN TABLA usuarios");
        toast.error("Usuario no encontrado");
        setCargando(false);
        return;
      }

      const usuarioData = data as Usuario;
      const passwordGuardado = String(usuarioData.contrasena || "").trim();

      if (passwordGuardado !== contrasenaLimpia) {
        setMensajeDebug("CONTRASEÑA INCORRECTA");
        toast.error("Contraseña incorrecta");
        setCargando(false);
        return;
      }

      const estado = String(usuarioData.estado || "").toLowerCase().trim();
      const rol = String(usuarioData.rol || "cliente").toLowerCase().trim();

      if (estado === "pendiente") {
        setMensajeDebug("CUENTA PENDIENTE: espera aprobación del admin.");
        toast("Tu cuenta está pendiente de aprobación");
        setCargando(false);
        return;
      }

      if (estado === "rechazado") {
        setMensajeDebug("CUENTA RECHAZADA: comunícate con soporte.");
        toast.error("Tu cuenta fue rechazada");
        setCargando(false);
        return;
      }

      if (estado !== "aprobado" && estado !== "activo") {
        setMensajeDebug(`CUENTA NO HABILITADA: estado actual ${usuarioData.estado}`);
        toast.error("Tu cuenta no está habilitada");
        setCargando(false);
        return;
      }

      const usuarioSesion = {
        ...usuarioData,
        rol,
        estado,
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioSesion));
      localStorage.setItem("jonas_login_ok", new Date().toISOString());

      toast.success("Bienvenido 🚀");

      const destino =
        rol === "admin"
          ? "/admin"
          : rol === "proveedor"
            ? "/proveedor"
            : "/cliente";

      router.replace(destino);
      router.refresh();

      window.setTimeout(() => {
        window.location.assign(destino);
      }, 250);
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Error desconocido";
      console.error(error);
      setMensajeDebug(`ERROR GENERAL: ${detalle}`);
      toast.error("Error al iniciar sesión");
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
              rel="noreferrer"
              className={`${styles.topLink} ${styles.topLinkPrimary}`}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.accessGrid}>
        <article className={styles.heroPanel}>
          <span className={styles.heroBadge}>ACCESO OFICIAL</span>

          <h1 className={styles.heroTitle}>
            ENTRA A TU <strong>CUENTA</strong>
          </h1>

          <p className={styles.heroText}>
            Inicia sesión para acceder a tu panel de Jonas Stream según tu tipo de cuenta.
          </p>

          <div className={styles.accessGrid}>
            <div className={styles.accessCard}>
              <span>CLIENTE</span>
              <p>Consulta tus pedidos y servicios activos.</p>
            </div>

            <div className={styles.accessCard}>
              <span>PROVEEDOR</span>
              <p>Gestiona productos y disponibilidad.</p>
            </div>

            <div className={styles.accessCard}>
              <span>ADMIN</span>
              <p>Administra usuarios, ventas y configuración.</p>
            </div>
          </div>

          <div className={styles.panelNote}>
            Si tu cuenta está pendiente, espera la aprobación o comunícate con soporte.
          </div>
        </article>

        <article className={styles.registerCard}>
          <div className={styles.formHeader}>
            <span className={styles.formKicker}>CUENTA JONAS STREAM</span>
            <h2>INICIAR SESIÓN</h2>
            <p>Ingresa con tu correo y contraseña registrados.</p>
          </div>

          <form onSubmit={iniciarSesion} className={styles.formSection}>
            <label className={styles.inputGroup}>
              <span>CORREO ELECTRÓNICO</span>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="cliente@test.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className={styles.inputGroup}>
              <span>CONTRASEÑA</span>
              <div className={`${styles.inputWrap} ${styles.passwordWrap}`}>
                <input
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setMostrarContrasena((prev) => !prev)}
                  className={styles.passwordToggle}
                >
                  {mostrarContrasena ? "OCULTAR" : "VER"}
                </button>
              </div>
            </label>

            {mensajeDebug && <div className={styles.panelNote}>{mensajeDebug}</div>}

            <button type="submit" disabled={cargando} className={styles.submitButton}>
              {cargando ? "INGRESANDO..." : "ENTRAR AL PANEL"}
            </button>

            <Link href="/" className={styles.secondaryLink}>
              VOLVER AL INICIO
            </Link>

            <p className={styles.formFooter}>Acceso exclusivo para usuarios registrados.</p>
          </form>
        </article>
      </section>

      <footer className={styles.footerWrap}>
        <div className={styles.footerLegal}>
          © 2026 Jonas Stream. Todos los derechos reservados.
        </div>

        <div className={styles.footerLinks}>
          <Link href="/terminos">Términos y Condiciones</Link>
          <span className={styles.footerSeparator}>•</span>
          <Link href="/privacidad">Política de Privacidad</Link>
        </div>
      </footer>
    </main>
  );
}
