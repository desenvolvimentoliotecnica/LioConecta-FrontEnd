import { Outlet, useNavigate } from "react-router-dom";

export function KioskShell() {
  const navigate = useNavigate();

  return (
    <div className="kiosk-shell">
      <button
        className="kiosk-shell__exit"
        type="button"
        onClick={() => navigate("/")}
        aria-label="Sair do quiosque e voltar ao início"
      >
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        Sair do quiosque
      </button>
      <Outlet />
    </div>
  );
}
