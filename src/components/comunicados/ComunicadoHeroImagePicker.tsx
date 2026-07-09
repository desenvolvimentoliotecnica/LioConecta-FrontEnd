import { useState } from "react";
import { ComunicadoHeroImageModal } from "./ComunicadoHeroImageModal";
import "../../styles/comunicado-hero-image-modal.css";

type Props = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function ComunicadoHeroImagePicker({ value, onChange, disabled = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const trimmed = value.trim();

  return (
    <>
      <div className="hero-image-picker__preview">
        {trimmed ? (
          <img src={trimmed} alt="Pré-visualização da imagem de destaque" />
        ) : (
          <div className="hero-image-picker__empty">
            <i className="fa-regular fa-image" aria-hidden="true" />
            <span>Nenhuma imagem selecionada</span>
          </div>
        )}
      </div>

      <div className="hero-image-picker__actions">
        <button
          type="button"
          className="hero-image-picker__choose"
          disabled={disabled}
          onClick={() => setModalOpen(true)}
        >
          <i className="fa-solid fa-images" aria-hidden="true" />
          Escolher imagem
        </button>
        {trimmed && !disabled ? (
          <button
            type="button"
            className="hero-image-picker__remove"
            onClick={() => onChange("")}
          >
            <i className="fa-solid fa-trash-can" aria-hidden="true" />
            Remover imagem
          </button>
        ) : null}
      </div>

      <ComunicadoHeroImageModal
        open={modalOpen && !disabled}
        initialUrl={value}
        onClose={() => setModalOpen(false)}
        onConfirm={onChange}
      />
    </>
  );
}
