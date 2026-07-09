type Props = {
  show: boolean;
};

export function UniLioFallbackBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className="unilio-fallback-banner" role="status">
      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
      <span>
        Exibindo dados locais — API UniLio indisponível. Progresso e matrículas podem não refletir o servidor em tempo
        real.
      </span>
    </div>
  );
}
