import { useEffect, useId, useRef, useState } from "react";

type Props = {
  onEdit: () => void;
  onDeactivate?: () => void;
  disabled?: boolean;
};

export function SystemCardActionsMenu({ onEdit, onDeactivate, disabled = false }: Props) {
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

  return (
    <div className="card__actions systems-hub__card-menu" ref={rootRef}>
      <button
        type="button"
        className="card__actions-trigger"
        aria-label="Ações do sistema"
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
            className="card__actions-item"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <i className="fa-regular fa-pen-to-square" aria-hidden="true" />
            Editar
          </button>
          {onDeactivate ? (
            <button
              type="button"
              className="card__actions-item card__actions-item--danger"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onDeactivate();
              }}
            >
              <i className="fa-regular fa-circle-xmark" aria-hidden="true" />
              Desativar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
