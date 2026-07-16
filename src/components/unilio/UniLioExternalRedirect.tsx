import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UniLioAccessGate } from "./UniLioAccessGate";
import { buildUniLioLaunchUrl, isUniLioExternalEnabled } from "../../config/unilioApp";

/**
 * Quando VITE_UNILIO_APP_URL está definido, redireciona /unilio/* para a app própria
 * com handoff do JWT. Caso contrário, não deve ser montado (rotas embutidas permanecem).
 */
export function UniLioExternalRedirect() {
  const location = useLocation();

  useEffect(() => {
    if (!isUniLioExternalEnabled()) {
      return;
    }

    const path = location.pathname.startsWith("/unilio")
      ? location.pathname
      : "/unilio";
    window.location.assign(buildUniLioLaunchUrl(path));
  }, [location.pathname]);

  return (
    <UniLioAccessGate>
      <div className="unilio-external-redirect" style={{ padding: "2rem", textAlign: "center" }}>
        <p>Abrindo UniLio…</p>
        <p>
          <a href={buildUniLioLaunchUrl(location.pathname)}>Clique aqui se não redirecionar</a>
        </p>
      </div>
    </UniLioAccessGate>
  );
}
