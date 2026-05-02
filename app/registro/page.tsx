"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const WHATSAPP_NUMBER = "51900557949";

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  const registrarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    const nombreLimpio = nombre.trim();
    const correoNormalizado = correo.trim().toLowerCase();

    if (nombreLimpio.length < 3) {
      toast.error("Ingresa tu nombre completo");
      return;
    }

    if (contrasena.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    const { data: usuarioExistente } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", correoNormalizado)
      .maybeSingle();

    if (usuarioExistente) {
      toast.error("Este correo ya está registrado");
      setCargando(false);
      return;
    }

    const { error } = await supabase.from("usuarios").insert({
      nombre: nombreLimpio,
      correo: correoNormalizado,
      contrasena,
      rol: "cliente",
      estado: "pendiente",
    });

    if (error) {
      toast.error("No se pudo registrar la cuenta");
      setCargando(false);
      return;
    }

    toast.success("Registro enviado. Espera la aprobación del administrador.");
    router.push("/login");

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
            <span>REGISTRO OFICIAL</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/login" className={styles.topLink}>
              LOGIN
            </Link>

            <a
              href={buildWhatsAppLink("Hola Jonas Stream, necesito ayuda con mi registro.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.registerShell}>
        <div className={styles.brandPanel}>
          <div className={styles.heroBadge}>NUEVA CUENTA</div>

          <h1 className={styles.heroTitle}>
            CREA TU
            <span> ACCESO</span>
          </h1>

          <p className={styles.heroText}>
            Regístrate para solicitar acceso a Jonas Stream. Tu cuenta quedará pendiente hasta que
            el administrador revise y apruebe tu solicitud.
          </p>

          <div className={styles.accessGrid}>
            <div className={styles.accessCard}>
              <span>01</span>
              <strong>Envías tu solicitud</strong>
            </div>

            <div className={styles.accessCard}>
              <span>02</span>
              <strong>Admin revisa</strong>
            </div>

            <div className={styles.accessCard}>
              <span>03</span>
              <strong>Acceso aprobado</strong>
            </div>
          </div>

          <p className={styles.panelNote}>
            Después de registrarte, espera la aprobación. Cuando tu cuenta sea aprobada, podrás
            iniciar sesión normalmente.
          </p>
        </div>

        <form onSubmit={registrarUsuario} className={styles.registerCard}>
          <div className={styles.cardGlow} />

          <div className={styles.formHeader}>
            <span className={styles.formKicker}>SOLICITUD DE ACCESO</span>
            <h2>Registro</h2>
            <p>Completa tus datos para crear tu cuenta.</p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nombre">Nombre completo</label>

            <div className={styles.inputWrap}>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
            </div>
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

            <div className={`${styles.inputWrap} ${styles.passwordWrap}`}>
              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>

            <div className={styles.inputWrap}>
              <input
                id="confirmarContrasena"
                type={mostrarContrasena ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={cargando} className={styles.submitButton}>
            {cargando ? "Enviando solicitud..." : "Crear cuenta"}
          </button>

          <div className={styles.formFooter}>
            <Link href="/login" className={styles.secondaryLink}>
              Ya tengo cuenta
            </Link>

            <span>Tu cuenta se creará como cliente y quedará pendiente de aprobación.</span>
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
