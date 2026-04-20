import Link from "next/link";

export default function QuieroSerSocioPage() {
  return (
    <main className="socio-page">
      <div className="socio-bg" />

      <div className="container socio-wrap">
        <section className="socio-offer-banner">
          <div className="socio-offer-badge">PROMOCIÓN ACTIVA</div>

          <div className="socio-offer-content">
            <h2>Accede hoy al grupo VIP por solo S/8</h2>
            <p>
              Oferta especial por tiempo limitado para nuevos socios que desean
              empezar a vender plataformas premium con Jonas Stream.
            </p>
          </div>

          <a
            href="https://wa.me/51900557949?text=Hola%2C%20quiero%20ser%20socio%20de%20Jonas%20Stream"
            target="_blank"
            rel="noopener noreferrer"
            className="socio-offer-btn"
          >
            APROVECHAR OFERTA
          </a>
        </section>

        <section className="socio-hero">
          <div className="socio-hero-left">
            <span className="socio-kicker">Socios VIP Jonas Stream</span>

            <h1>CONVIÉRTETE EN SOCIO Y EMPIEZA A GENERAR INGRESOS</h1>

            <p className="socio-lead">
              Únete a Jonas Stream y accede a una comunidad exclusiva,
              catálogo privado, material publicitario y precios especiales
              para vender plataformas de streaming de forma profesional.
            </p>

            <div className="socio-hero-actions">
              <a
                href="https://wa.me/51900557949?text=QUIERO%20SER%20SOCIO%20DE%20JONAS"
                target="_blank"
                rel="noopener noreferrer"
                className="socio-btn socio-btn-primary"
              >
                QUIERO SER SOCIO
              </a>

              <Link href="/" className="socio-btn socio-btn-secondary">
                VOLVER AL INICIO
              </Link>
            </div>

            <div className="socio-mini-benefits">
              <div className="socio-mini-card">
                <span>💸</span>
                <strong>Baja inversión</strong>
              </div>

              <div className="socio-mini-card">
                <span>📈</span>
                <strong>Alta ganancia</strong>
              </div>

              <div className="socio-mini-card">
                <span>🤝</span>
                <strong>Soporte real</strong>
              </div>
            </div>
          </div>

          <div className="socio-hero-right">
            <div className="socio-hero-box">
              <div className="socio-hero-box-badge">Ingreso inteligente</div>

              <h3>¿Cómo ganas dinero?</h3>
              <p>
                Compras accesos a precio socio y luego los revendes por perfil
                o cuenta con tu propia ganancia.
              </p>

              <div className="ganancia-box">
                <div className="ganancia-step">
                  <span>1</span>
                  <p>Compras Prime Video completo por S/12</p>
                </div>

                <div className="ganancia-step">
                  <span>2</span>
                  <p>Incluye 6 perfiles disponibles para vender</p>
                </div>

                <div className="ganancia-step">
                  <span>3</span>
                  <p>Vendes cada perfil a S/8</p>
                </div>

                <div className="ganancia-step">
                  <span>4</span>
                  <p>Total vendido: S/48</p>
                </div>
              </div>

              <div className="ganancia-final">
                <strong>Ganancia neta estimada: S/36</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="socio-section">
          <div className="section-head">
            <span className="section-kicker">Beneficios exclusivos</span>
            <h2>¿Qué recibes al entrar?</h2>
            <p>
              Todo lo que necesitas para comenzar más rápido, vender con mejor
              imagen y crecer dentro de la comunidad Jonas Stream.
            </p>
          </div>

          <div className="beneficios-grid">
            <article className="beneficio-card">
              <div className="beneficio-icon">🎬</div>
              <h3>Comunidad privada VIP</h3>
              <p>
                Acceso a una comunidad exclusiva para socios con información,
                promociones y apoyo constante.
              </p>
            </article>

            <article className="beneficio-card">
              <div className="beneficio-icon">💸</div>
              <h3>Catálogo exclusivo</h3>
              <p>
                Recibe precios rebajados y promociones más accesibles que las
                del público general.
              </p>
            </article>

            <article className="beneficio-card">
              <div className="beneficio-icon">📊</div>
              <h3>Plantilla de control</h3>
              <p>
                Lleva tus ventas de forma ordenada y profesional con una
                plantilla práctica para seguimiento.
              </p>
            </article>

            <article className="beneficio-card">
              <div className="beneficio-icon">🎨</div>
              <h3>Publicidad editable</h3>
              <p>
                Accede a material visual editable en Canva PRO para promocionar
                tus ventas con una imagen más profesional.
              </p>
            </article>

            <article className="beneficio-card">
              <div className="beneficio-icon">🏠</div>
              <h3>Ingresos desde casa</h3>
              <p>
                Empieza con baja inversión y aprovecha la alta demanda de
                plataformas premium sin complicarte.
              </p>
            </article>

            <article className="beneficio-card">
              <div className="beneficio-icon">🤝</div>
              <h3>Acompañamiento</h3>
              <p>
                No comienzas solo. Recibes orientación para entender cómo vender
                y avanzar más rápido.
              </p>
            </article>
          </div>
        </section>

        <section className="socio-section">
          <div className="section-head">
            <span className="section-kicker">Modelo de afiliación</span>
            <h2>Gana también recomendando socios</h2>
            <p>
              Además de vender plataformas, también puedes generar ingresos
              invitando nuevas personas a la comunidad.
            </p>
          </div>

          <div className="afiliado-box">
            <div className="afiliado-left">
              <h3>¿Cómo funciona?</h3>
              <ul className="afiliado-list">
                <li>Recomiendas la comunidad a un amigo o familiar.</li>
                <li>Tú decides cuánto cobrar por el ingreso: S/10, S/20 o S/30.</li>
                <li>Jonas Stream solo cobra S/5 por activarlo.</li>
                <li>La persona recibe los mismos beneficios que tú.</li>
              </ul>
            </div>

            <div className="afiliado-right">
              <div className="afiliado-card">
                <span className="afiliado-tag">Ejemplo</span>
                <h4>Si cobras S/20</h4>
                <p>Nosotros activamos al nuevo socio por S/5.</p>
                <strong>Tu margen sería S/15</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="socio-section">
          <div className="section-head">
            <span className="section-kicker">Activación rápida</span>
            <h2>Métodos de pago disponibles</h2>
            <p>
              Elige el método más cómodo para activar tu acceso y empezar hoy
              mismo.
            </p>
          </div>

          <div className="pagos-grid">
            <article className="pago-card">
              <h3>YAPE / PLIN</h3>
              <p>Pago rápido e inmediato desde billeteras digitales.</p>
            </article>

            <article className="pago-card">
              <h3>BINANCE</h3>
              <p>Ideal para pagos con criptomonedas o transferencias crypto.</p>
            </article>

            <article className="pago-card">
              <h3>TRANSFERENCIA</h3>
              <p>Disponible para pagos bancarios según coordinación.</p>
            </article>

            <article className="pago-card">
              <h3>ASESOR</h3>
              <p>Si necesitas ayuda personalizada, te atendemos por WhatsApp.</p>
            </article>
          </div>
        </section>

        <section className="cta-final-box">
          <div className="cta-final-content">
            <span className="section-kicker">Empieza hoy</span>
            <h2>Activa tu acceso VIP y comienza a vender</h2>
            <p>
              Únete hoy a Jonas Stream, accede a beneficios exclusivos y da el
              primer paso para construir un ingreso extra con plataformas
              premium.
            </p>
          </div>

          <div className="cta-final-actions">
            <a
              href="https://wa.me/51900557949?text=QUIERO%20SER%20SOCIO%20DE%20JONAS"
              target="_blank"
              rel="noopener noreferrer"
              className="socio-btn socio-btn-primary"
            >
              QUIERO SER SOCIO DE JONAS
            </a>

            <a
              href="https://wa.me/51900557949?text=Hola%2C%20quiero%20informaci%C3%B3n%20para%20ser%20socio"
              target="_blank"
              rel="noopener noreferrer"
              className="socio-btn socio-btn-secondary"
            >
              HABLAR CON ASESOR
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}