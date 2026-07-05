import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./image-lightbox.css";

type Props = {
  open: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
};

export function ImageLightbox({ open, src, alt = "", onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="image-lightbox__backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Visualizar imagem"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="image-lightbox__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <img className="image-lightbox__img" src={src} alt={alt} />
      </div>
    </div>,
    document.body,
  );
}
