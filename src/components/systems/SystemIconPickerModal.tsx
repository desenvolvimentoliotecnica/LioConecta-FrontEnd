import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SYSTEM_ICON_OPTIONS } from "../../config/systems/iconCatalog";
import { resolveBackendAssetUrl } from "../../api/assetUrl";
import "../../styles/systems-hub-page.css";

type Props = {
  open: boolean;
  stacked?: boolean;
  initialFaClass?: string | null;
  initialAssetUrl?: string | null;
  initialPreviewUrl?: string | null;
  initialKind?: string;
  onClose: () => void;
  onSelectFontAwesome: (iconFaClass: string) => void;
  onPickImageFile: (file: File) => void;
};

export function SystemIconPickerModal({
  open,
  stacked = true,
  initialFaClass,
  initialAssetUrl,
  initialPreviewUrl,
  initialKind,
  onClose,
  onSelectFontAwesome,
  onPickImageFile,
}: Props) {
  const [tab, setTab] = useState<"fontawesome" | "upload">("fontawesome");
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTab(initialKind === "Upload" ? "upload" : "fontawesome");
    setQuery("");
  }, [open, initialKind]);

  const filteredIcons = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SYSTEM_ICON_OPTIONS;
    return SYSTEM_ICON_OPTIONS.filter(
      (item) =>
        item.label.toLowerCase().includes(term) || item.value.toLowerCase().includes(term),
    );
  }, [query]);

  if (!open) return null;

  const previewUploadUrl =
    initialPreviewUrl ??
    (initialAssetUrl ? resolveBackendAssetUrl(initialAssetUrl) : "");

  return createPortal(
    <div
      className={`systems-modal${stacked ? " systems-modal--stacked" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="systems-modal__dialog systems-modal__dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-icon-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="systems-modal__header">
          <h2 id="system-icon-picker-title">Selecionar ícone</h2>
          <button type="button" className="systems-modal__close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="systems-icon-picker__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`filter-chip${tab === "fontawesome" ? " is-active" : ""}`}
            onClick={() => setTab("fontawesome")}
          >
            Font Awesome
          </button>
          <button
            type="button"
            role="tab"
            className={`filter-chip${tab === "upload" ? " is-active" : ""}`}
            onClick={() => setTab("upload")}
          >
            Upload de imagem
          </button>
        </div>

        <div className="systems-modal__body">
          {tab === "fontawesome" ? (
            <div className="systems-icon-picker__panel">
              <label className="page-search systems-icon-picker__search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar ícone..."
                  aria-label="Buscar ícone"
                />
              </label>
              <div className="systems-icon-picker__grid">
                {filteredIcons.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`systems-icon-picker__option${
                      initialFaClass === item.value ? " is-selected" : ""
                    }`}
                    onClick={() => onSelectFontAwesome(item.value)}
                  >
                    <i className={`fa-solid ${item.value}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="systems-icon-picker__panel">
              {previewUploadUrl ? (
                <div className="systems-icon-picker__preview">
                  <img src={previewUploadUrl} alt="Pré-visualização do ícone" />
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="systems-icon-picker__file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onPickImageFile(file);
                  event.target.value = "";
                }}
              />
              <button type="button" className="btn btn--primary" onClick={() => fileInputRef.current?.click()}>
                Escolher imagem
              </button>
              <p className="systems-icon-picker__hint">JPEG, PNG, WebP, GIF ou SVG — máximo 2 MB.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
