import { CompassInfoButton } from "./help/CompassInfoButton";

type Props = {
  show: boolean;
};

export function CompassFallbackBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className="compass-fallback-banner" role="status">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
      <span>
        Exibindo dados locais — API Compass indisponível. Valores podem não refletir o snapshot Oracle Hyperion
        EPBCS em tempo real.
      </span>
      <CompassInfoButton infoId="fallback-banner" label="Saiba mais sobre o fallback" />
    </div>
  );
}

type BadgeProps = {
  label: string;
  snapshotName?: string;
  periodLabel?: string;
};

export function CompassHyperionBadge({ label, snapshotName, periodLabel }: BadgeProps) {
  return (
    <span className="compass-hyperion-badge" title={[snapshotName, periodLabel].filter(Boolean).join(" · ")}>
      <i className="fa-solid fa-database" aria-hidden="true" />
      {label}
    </span>
  );
}
