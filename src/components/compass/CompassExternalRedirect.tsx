import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CompassAccessGate } from "./CompassAccessGate";
import { buildCompassLaunchUrl, isCompassExternalEnabled } from "../../config/compassApp";

/**
 * Quando VITE_COMPASS_APP_URL está definido, redireciona /compass/* para a app própria
 * com handoff do JWT. Caso contrário, não deve ser montado (rotas embutidas permanecem).
 */
export function CompassExternalRedirect() {
  const location = useLocation();

  useEffect(() => {
    if (!isCompassExternalEnabled()) {
      return;
    }

    const path = location.pathname.startsWith("/compass")
      ? location.pathname
      : "/compass";
    window.location.assign(buildCompassLaunchUrl(path));
  }, [location.pathname]);

  return (
    <CompassAccessGate>
      <div className="compass-external-redirect" style={{ padding: "2rem", textAlign: "center" }}>
        <p>Abrindo Compass…</p>
        <p>
          <a href={buildCompassLaunchUrl(location.pathname)}>Clique aqui se não redirecionar</a>
        </p>
      </div>
    </CompassAccessGate>
  );
}
