"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  estado: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const iniciarSesion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

      <section className={styles.loginShell}>
        <div className={styles.brandPanel}>
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
            <strong>JONAS STREAM</strong>
            <span>ACCESO OFICIAL</span>
          </Link>

          <div className={styles.heroBadge}>LOGIN SEGURO</div>

          <h1 className={styles.heroTitle}>
            ENTRA A TU
            <span> PANEL DIGITAL</span>
          </h1>

          <p className={styles.heroText}>
            Accede a tu cuenta Jonas Stream para gestionar tus pedidos, clientes, productos o
            panel de administración con una experiencia rápida y segura.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span>01</span>
              <strong>Acceso privado</strong>
            </div>

            <div className={styles.featureCard}>
              <span>02</span>
              <strong>Panel responsive</strong>
            </div>

            <div className={styles.featureCard}>
              <span>03</span>
              <strong>Estilo neon</strong>
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

            <span>Acceso para clientes, proveedores y administración.</span>
          </div>
        </form>
      </section>
    </main>
  );
}
