import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ApiError } from "../../api/client";
import { config } from "../../api/client";
import { getStoredToken, setStoredToken } from "../../api/hooks/useAuth";
import { useMe } from "../../api/hooks/useMe";

const DEV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "dev";

function isAuthBypassed() {
  return DEV_AUTH_MODE || config.useMock;
}

export function RequireAuth() {
  const location = useLocation();
  const token = getStoredToken();
  const { data: me, isLoading, isError, error } = useMe();

  useEffect(() => {
    if (isAuthBypassed()) {
      return;
    }

    if (isError && error instanceof ApiError && error.status === 401) {
      setStoredToken(null);
    }
  }, [isError, error]);

  if (isAuthBypassed()) {
    return <Outlet />;
  }

  if (!token) {
    return <Navigate to="/acesso" replace state={{ from: location.pathname }} />;
  }

  if (isLoading) {
    return (
      <div className="auth-gate" role="status" aria-live="polite">
        <p>Verificando sessão…</p>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/acesso" replace state={{ from: location.pathname }} />;
  }

  if (!me) {
    return <Navigate to="/acesso" replace />;
  }

  return <Outlet />;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const token = getStoredToken();
  const { data: me, isLoading } = useMe();

  if (isAuthBypassed()) {
    return <>{children}</>;
  }

  if (token && (isLoading || me)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
