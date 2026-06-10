import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | Jonas Stream",
  description:
    "Política de privacidad y tratamiento de datos personales de Jonas Stream.",
};

export default function PoliticasDePrivacidadPage() {
  return (
    <main className="js-legal-page">
      <section className="js-legal-card" aria-labelledby="privacy-title">
        <div className="js-legal-top">
          <div>
            <p className="js-legal-eyebrow">Documento legal</p>
            <h1 className="js-legal-title" id="privacy-title">
              Política de Privacidad
            </h1>
          </div>

          <div className="js-legal-badge">JONAS STREAM</div>
        </div>

        <div className="js-legal-meta" aria-label="Información del documento">
          <span className="js-chip">Última actualización: 2026</span>
          <span className="js-chip">Protección de datos</span>
        </div>

        <p className="js-legal-lead">
          En Jonas Stream respetamos la privacidad de nuestros clientes y
          protegemos sus datos personales.
        </p>

        <hr className="js-legal-hr" />

        <h2>1. Información que recopilamos</h2>
        <p>Podemos recopilar:</p>
        <ul className="js-legal-list">
          <li>Nombre.</li>
          <li>Número de WhatsApp.</li>
          <li>Usuario de redes sociales.</li>
          <li>Datos necesarios para activar servicios.</li>
          <li>Información de contacto.</li>
        </ul>

        <h2>2. Uso de la información</h2>
        <p>Usamos la información únicamente para:</p>
        <ul className="js-legal-list">
          <li>Activación de servicios.</li>
          <li>Soporte técnico.</li>
          <li>Comunicación con el cliente.</li>
          <li>Validación de pagos.</li>
          <li>Atención de consultas.</li>
        </ul>

        <h2>3. Protección de datos</h2>
        <p>
          Aplicamos medidas razonables de seguridad para proteger la información
          del cliente y evitar accesos no autorizados.
        </p>

        <h2>4. No venta de datos</h2>
        <p>
          No vendemos, alquilamos ni compartimos datos personales con terceros.
        </p>

        <h2>5. Comunicaciones</h2>
        <p>Podemos contactar al cliente para:</p>
        <ul className="js-legal-list">
          <li>Entrega de accesos.</li>
          <li>Soporte.</li>
          <li>Avisos de servicio.</li>
          <li>Renovaciones.</li>
        </ul>
        <p>No enviamos publicidad masiva no solicitada.</p>

        <h2>6. Solicitud de eliminación</h2>
        <p>
          El cliente puede solicitar la eliminación de sus datos contactándonos
          por los canales oficiales.
        </p>

        <h2>7. Cambios en la política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad cuando sea necesario.
          Los cambios entran en vigencia al publicarse.
        </p>

        <div className="js-legal-actions">
          <Link href="/" className="js-legal-button primary">
            Volver al inicio
          </Link>
          <Link href="/terminos-y-condiciones" className="js-legal-button">
            Ver términos y condiciones
          </Link>
        </div>

        <div className="js-legal-footer">
          Para consultas sobre privacidad, contáctanos por nuestros canales
          oficiales.
        </div>
      </section>
    </main>
  );
}
