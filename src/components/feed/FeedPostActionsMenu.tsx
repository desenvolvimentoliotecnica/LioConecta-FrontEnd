import { useEffect, useId, useRef, useState } from "react";

type Props = {
  onDelete: () => void;
  disabled?: boolean;
};

export function FeedPostActionsMenu({ onDelete, disabled = false }: Props) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleDelete() {
    setOpen(false);
    const confirmed = window.confirm(
      "Excluir esta publicação? Ela deixará de aparecer no feed para todos os colaboradores.",
    );
    if (!confirmed) return;
    onDelete();
  }

  return (
    <div className="card__actions" ref={rootRef}>
      <button
        type="button"
        className="card__actions-trigger"
        aria-label="Ações da publicação"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        <i className="fa-solid fa-ellipsis" aria-hidden="true" />
      </button>
      {open ? (
        <div className="card__actions-menu" id={menuId} role="menu">
          <button
            type="button"
            className="card__actions-item card__actions-item--danger"
            role="menuitem"
            disabled={disabled}
            onClick={handleDelete}
          >
            <i className="fa-regular fa-trash-can" aria-hidden="true" />
            Excluir publicação
          </button>
        </div>
      ) : null}
    </div>
  );
}
