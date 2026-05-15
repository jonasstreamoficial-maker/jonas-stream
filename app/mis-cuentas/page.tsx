"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./mis-cuentas.module.css";

type UsuarioLocal = {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  estado?: string;
};

type CuentaProducto = {
  id: string;
  producto_id: string;
  correo: string;
  clave: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cliente_inicio?: string | null;
  cliente_fin?: string | null;
  estado: string;
  pedido_id?: string | null;
  usuario_id?: string | null;
  notas?: string | null;
  created_at?: string | null;
  productos?: {
    nombre?: string | null;
    imagen?: string | null;
    categoria?: string | null;
    tipo_venta?: string | null;
  } | null;
};

function leerUsuarioLocal(): UsuarioLocal | null {
  if (typeof window === "undefined") return null;

  try {
    const data = window.localStorage.getItem("usuario");
    if (!data) return null;
    return JSON.parse(data) as UsuarioLocal;
  } catch {
    return null;
  }
}

function fechaCorta(fecha?: string | null) {
  if (!fecha) return "Sin fecha";
  const date = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MisCuentasPage() {
  const [cuentas, setCuentas] = useState<CuentaProducto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<UsuarioLocal | null>(null);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    const usuarioLocal = leerUsuarioLocal();
    setUsuario(usuarioLocal);

    if (!usuarioLocal) {
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from("cuentas_producto")
      .select(
        "id,producto_id,correo,clave,fecha_inicio,fecha_fin,cliente_inicio,cliente_fin,estado,pedido_id,usuario_id,notas,created_at,productos(nombre,imagen,categoria,tipo_venta)",
      )
      .eq("usuario_id", usuarioLocal.id)
      .eq("estado", "entregada")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("No se pudieron cargar tus cuentas");
      setCuentas([]);
    } else {
      setCuentas((data || []) as CuentaProducto[]);
    }

    setCargando(false);
  };

  const copiarCuenta = async (cuenta: CuentaProducto) => {
    const texto = [
      `Producto: ${cuenta.productos?.nombre || "Producto Jonas Stream"}`,
      `Correo: ${cuenta.correo}`,
      `Contraseña: ${cuenta.clave}`,
      `Inicio: ${fechaCorta(cuenta.cliente_inicio || cuenta.fecha_inicio)}`,
      `Fin: ${fechaCorta(cuenta.cliente_fin || cuenta.fecha_fin)}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Datos copiados");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>
        JONAS STREAM
      </div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link
            href="/"
            className={styles.brandBlock}
            aria-label="Ir al inicio"
          >
            <strong>JONAS STREAM</strong>
            <span>MIS CUENTAS</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>
            <Link href="/tienda" className={styles.topLink}>
              TIENDA
            </Link>
            <Link href="/carrito" className={styles.topLink}>
              CARRITO
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>ACCESOS ENTREGADOS</div>
        <h1 className={styles.heroTitle}>
          MIS CUENTAS<span> JONAS STREAM</span>
        </h1>
        <p className={styles.heroText}>
          Aquí aparecen las cuentas entregadas automáticamente por créditos y
          también las que el admin te asigne al aprobar pedidos normales.
        </p>
      </section>

      <section className={styles.accountsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>CUENTAS ACTIVAS</span>
          <h2 className={styles.sectionTitle}>Tus accesos disponibles</h2>
        </div>

        {!usuario ? (
          <div className={styles.emptyState}>
            <h3>Inicia sesión</h3>
            <p>Necesitas iniciar sesión para ver tus cuentas entregadas.</p>
            <Link href="/login" className={styles.primaryButton}>
              Ir al login
            </Link>
          </div>
        ) : cargando ? (
          <div className={styles.emptyState}>
            <h3>Cargando cuentas...</h3>
            <p>Estamos buscando tus accesos entregados.</p>
          </div>
        ) : cuentas.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>Aún no tienes cuentas entregadas</h3>
            <p>
              Compra con créditos o espera que el admin apruebe tu pedido
              normal.
            </p>
            <Link href="/tienda" className={styles.primaryButton}>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className={styles.accountsGrid}>
            {cuentas.map((cuenta) => (
              <article key={cuenta.id} className={styles.accountCard}>
                <div className={styles.accountImage}>
                  {cuenta.productos?.imagen ? (
                    <img
                      src={cuenta.productos.imagen}
                      alt={cuenta.productos?.nombre || "Cuenta"}
                    />
                  ) : (
                    <span>JS</span>
                  )}
                </div>

                <div className={styles.accountBody}>
                  <div className={styles.badgeRow}>
                    <span>{cuenta.productos?.categoria || "Streaming"}</span>
                    <strong>{cuenta.productos?.tipo_venta || "Cuenta"}</strong>
                  </div>

                  <h3>{cuenta.productos?.nombre || "Cuenta Jonas Stream"}</h3>

                  <div className={styles.credentialsGrid}>
                    <div>
                      <small>Correo</small>
                      <strong>{cuenta.correo}</strong>
                    </div>
                    <div>
                      <small>Contraseña</small>
                      <strong>{cuenta.clave}</strong>
                    </div>
                  </div>

                  <div className={styles.dateGrid}>
                    <div>
                      <small>Inicio</small>
                      <strong>
                        {fechaCorta(
                          cuenta.cliente_inicio || cuenta.fecha_inicio,
                        )}
                      </strong>
                    </div>
                    <div>
                      <small>Vence</small>
                      <strong>
                        {fechaCorta(cuenta.cliente_fin || cuenta.fecha_fin)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copiarCuenta(cuenta)}
                    className={styles.copyButton}
                  >
                    Copiar datos
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
