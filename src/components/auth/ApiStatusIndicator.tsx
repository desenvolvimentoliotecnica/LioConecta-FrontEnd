import { useApiHealth } from "../../api/hooks/useApiHealth";

const LABELS = {
  checking: "Verificando API…",
  online: "API online",
  offline: "API offline",
} as const;

export function ApiStatusIndicator() {
  const { status } = useApiHealth();

  return (
    <span
      className={`login-page__api-status login-page__api-status--${status}`}
      role="status"
      aria-live="polite"
      title={LABELS[status]}
    >
      <span className="login-page__api-status-dot" aria-hidden="true" />
      <span className="login-page__api-status-label">{LABELS[status]}</span>
    </span>
  );
}
