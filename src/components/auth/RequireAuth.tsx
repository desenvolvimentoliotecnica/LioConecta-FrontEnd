import { useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ApiError } from "../../api/client";
import { config } from "../../api/client";
import { getStoredToken, setStoredToken } from "../../api/hooks/useAuth";
import { useMe } from "../../api/hooks/useMe";
import { buildLoginRedirect, buildReturnUrl, resolvePostLoginRedirect } from "../../utils/authRedirect";

const DEV_AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "dev";

function isAuthBypassed() {
  return DEV_AUTH_MODE || config.useMock;
}

function LoginNavigate({ loginRedirect }: { loginRedirect: ReturnType<typeof buildLoginRedirect> }) {
  return (
    <Navigate
      to={{
        pathname: loginRedirect.pathname,
        search: loginRedirect.search,
      }}
      replace
      state={loginRedirect.state}
    />
  );
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
    return <LoginNavigate loginRedirect={buildLoginRedirect(buildReturnUrl(location))} />;
  }

  if (isLoading) {
    return (
      <div className="auth-gate" role="status" aria-live="polite">
        <p>Verificando sessão…</p>
      </div>
    );
  }

  if (isError) {
    return <LoginNavigate loginRedirect={buildLoginRedirect(buildReturnUrl(location))} />;
  }

  if (!me) {
    return <LoginNavigate loginRedirect={buildLoginRedirect(buildReturnUrl(location))} />;
  }

  return <Outlet />;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = getStoredToken();
  const { data: me, isLoading } = useMe();

  if (isAuthBypassed()) {
    return <>{children}</>;
  }

  if (token && (isLoading || me)) {
    const redirectTo = resolvePostLoginRedirect(location);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
