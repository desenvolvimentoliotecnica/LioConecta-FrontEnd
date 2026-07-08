import { useState } from "react";
import { getCompassHelp } from "../../../config/compass/help-content";
import { CompassHelpModal } from "./CompassHelpModal";
import "../../../styles/compass-help.css";

type Props = {
  infoId: string;
  className?: string;
  label?: string;
};

export function CompassInfoButton({ infoId, className, label = "Informações sobre este painel" }: Props) {
  const [open, setOpen] = useState(false);
  const help = getCompassHelp(infoId);

  if (!help) return null;

  return (
    <>
      <button
        type="button"
        className={`compass-info-btn${className ? ` ${className}` : ""}`}
        aria-label={label}
        title={label}
        onClick={() => setOpen(true)}
      >
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
      </button>
      <CompassHelpModal open={open} infoId={infoId} onClose={() => setOpen(false)} />
    </>
  );
}
