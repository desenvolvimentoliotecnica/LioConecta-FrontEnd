import { useState } from "react";
import { ComunicadoHeroImageModal } from "./ComunicadoHeroImageModal";
import "../../styles/comunicado-hero-image-modal.css";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ComunicadoHeroImagePicker({ value, onChange }: Props) {
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
          onClick={() => setModalOpen(true)}
        >
          <i className="fa-solid fa-images" aria-hidden="true" />
          Escolher imagem
        </button>
        {trimmed ? (
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
        open={modalOpen}
        initialUrl={value}
        onClose={() => setModalOpen(false)}
        onConfirm={onChange}
      />
    </>
  );
}
