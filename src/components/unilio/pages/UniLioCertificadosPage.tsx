import { useUniLioCertificates } from "../../../api/hooks/useUniLioCertificates";
import { formatUniLioDate } from "../../../utils/unilioView";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";

export function UniLioCertificadosPage() {
  const { data, isLoading, isFallback } = useUniLioCertificates();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando certificados…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Certificados</h1>
        <p className="unilio-page__desc">{data.items.length} certificado{data.items.length !== 1 ? "s" : ""} emitido{data.items.length !== 1 ? "s" : ""}.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />

      {data.items.length === 0 ? (
        <p className="unilio-panel__empty">Complete cursos para receber certificados.</p>
      ) : (
        <div className="unilio-cert-grid">
          {data.items.map((cert) => (
            <article key={cert.id} className="unilio-cert-card">
              <i className="fa-solid fa-award unilio-cert-card__icon" aria-hidden="true" />
              <h3>{cert.courseTitle}</h3>
              <p className="unilio-cert-card__code">{cert.certificateCode}</p>
              <p>{cert.area} · {formatUniLioDate(cert.issuedAt)}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
