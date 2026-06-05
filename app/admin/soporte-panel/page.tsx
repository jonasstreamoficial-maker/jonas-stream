import styles from "./soporte-panel.module.css";

export default function SoportePanelPage() {
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

            <form className={styles.form}>
              <label>
                Usuario
                <input
                  type="text"
                  placeholder="admin@jonasstream.xyz"
                  autoComplete="username"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </label>

              <button type="button">Ingresar al soporte panel</button>
            </form>

            <div className={styles.securityNotice}>
              <strong>Seguridad activa:</strong> los clientes vencidos o
              suspendidos no podrán visualizar mensajes ni recibir alertas.
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
  );
}