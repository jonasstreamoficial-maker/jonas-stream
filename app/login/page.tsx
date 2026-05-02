"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

const WHATSAPP_NUMBER = "51900557949";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
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

  const iniciarSesion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);

    const correoNormalizado = correo.trim().toLowerCase();

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correoNormalizado)
      .eq("contrasena", contrasena)
      .single();

    if (error || !data) {
      toast.error("Correo o contraseña incorrectos");
      setCargando(false);
      return;
    }

    const usuario = data as Usuario;

    if (usuario.estado === "pendiente") {
      toast("Tu cuenta está pendiente de aprobación");
      setCargando(false);
      return;
    }

    if (usuario.estado === "rechazado") {
      toast.error("Tu cuenta fue rechazada");
      setCargando(false);
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(usuario));

    toast.success("Bienvenido 🚀");

    if (usuario.rol === "admin") {
      router.push("/admin");
    } else if (usuario.rol === "proveedor") {
      router.push("/proveedor");
    } else {
      router.push("/cliente");
    }

    setCargando(false);
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
              CONTÁCTANOS
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
            Inicia sesión para acceder a tu panel de Jonas Stream según tu tipo de cuenta.
          </p>

          <div className={styles.featureGrid} aria-label="Tipos de acceso">
            <div className={styles.featureCard}>
              <span>01</span>
              <strong>Cliente</strong>
            </div>

            <div className={styles.featureCard}>
              <span>02</span>
              <strong>Proveedor</strong>
            </div>

            <div className={styles.featureCard}>
              <span>03</span>
              <strong>Administrador</strong>
            </div>
          </div>
        </div>

        <form onSubmit={iniciarSesion} className={styles.loginCard}>
          <div className={styles.cardGlow} />

          <div className={styles.formHeader}>
            <span className={styles.formKicker}>CUENTA JONAS STREAM</span>
            <h2>Iniciar sesión</h2>
            <p>Ingresa con tu correo y contraseña registrados.</p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="correo">Correo electrónico</label>

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
            <label htmlFor="contrasena">Contraseña</label>

            <div className={styles.inputWrap}>
              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setMostrarContrasena((prev) => !prev)}
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarContrasena ? "OCULTAR" : "VER"}
              </button>
            </div>
          </div>

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
            <Link href="/terminos">Términos y Condiciones</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="/privacidad">Política de Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
