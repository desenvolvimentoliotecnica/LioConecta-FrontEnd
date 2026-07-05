import { useEffect, useId, useRef, useState } from "react";
import {
  extractUploadErrorMessage,
  useComunicadoHeroTemplates,
  useComunicadoHeroUploads,
  useUploadComunicadoHeroImage,
} from "../../api/hooks/useComunicadoHeroImages";
import "../../styles/comunicado-hero-image-modal.css";

type Tab = "templates" | "upload";

type Props = {
  open: boolean;
  initialUrl: string;
  onClose: () => void;
  onConfirm: (url: string) => void;
  stacked?: boolean;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ComunicadoHeroImageModal({ open, initialUrl, onClose, onConfirm, stacked = false }: Props) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: templates = [], isLoading: templatesLoading } = useComunicadoHeroTemplates();
  const { data: recentUploads = [] } = useComunicadoHeroUploads();
  const uploadImage = useUploadComunicadoHeroImage();

  const [tab, setTab] = useState<Tab>("templates");
  const [selectedUrl, setSelectedUrl] = useState(initialUrl);
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [localFileSize, setLocalFileSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedUrl(initialUrl);
    setManualUrl(initialUrl);
    setUploadError(null);
    setLocalPreview(null);
    setLocalFileName(null);
    setLocalFileSize(null);
    setTab("templates");
  }, [open, initialUrl]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  if (!open) return null;

  function handleSelectTemplate(url: string) {
    setSelectedUrl(url);
    setManualUrl(url);
    setUploadError(null);
  }

  function handleSelectUpload(url: string) {
    setSelectedUrl(url);
    setManualUrl(url);
    setUploadError(null);
    setLocalPreview(null);
    setLocalFileName(null);
    setLocalFileSize(null);
  }

  function resetLocalPreview() {
    if (localPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    setLocalFileName(null);
    setLocalFileSize(null);
  }

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Use JPEG, PNG ou WebP.";
    }
    return null;
  }

  async function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    resetLocalPreview();
    setUploadError(null);
    setLocalPreview(URL.createObjectURL(file));
    setLocalFileName(file.name);
    setLocalFileSize(file.size);

    try {
      const result = await uploadImage.mutateAsync({ file });
      setSelectedUrl(result.url);
      setManualUrl(result.url);
      resetLocalPreview();
    } catch (error) {
      setUploadError(extractUploadErrorMessage(error));
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  }

  function handleConfirm() {
    const url = manualUrl.trim() || selectedUrl.trim();
    if (!url) return;
    onConfirm(url);
    onClose();
  }

  const canConfirm = Boolean((manualUrl.trim() || selectedUrl.trim()) && !uploadImage.isPending);

  return (
    <div
      className={`hero-image-modal__backdrop${stacked ? " hero-image-modal__backdrop--stacked" : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="hero-image-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hero-image-modal__header">
          <h2 id={titleId}>Imagem de destaque</h2>
          <button
            type="button"
            className="hero-image-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="hero-image-modal__tabs" role="tablist" aria-label="Origem da imagem">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "templates"}
            className={`hero-image-modal__tab${tab === "templates" ? " is-active" : ""}`}
            onClick={() => setTab("templates")}
          >
            Modelos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "upload"}
            className={`hero-image-modal__tab${tab === "upload" ? " is-active" : ""}`}
            onClick={() => setTab("upload")}
          >
            Enviar arquivo
          </button>
        </div>

        <div className="hero-image-modal__body">
          {tab === "templates" ? (
            templatesLoading ? (
              <p className="hero-image-modal__status">Carregando modelos…</p>
            ) : (
              <div className="hero-image-modal__grid">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`hero-image-modal__card${
                      selectedUrl === template.url ? " is-selected" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template.url)}
                  >
                    <img src={template.url} alt="" />
                    <span className="hero-image-modal__card-meta">
                      <span className="hero-image-modal__card-label">{template.label}</span>
                      {template.category ? (
                        <span className="hero-image-modal__card-category">{template.category}</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <>
              <div
                className={`hero-image-modal__dropzone${isDragging ? " is-dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div>
                  <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />
                  <p>Arraste uma imagem ou selecione do computador</p>
                  <label className="hero-image-modal__file-btn">
                    Selecionar arquivo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFile(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadImage.isPending ? (
                <div className="hero-image-modal__progress" aria-hidden="true">
                  <div className="hero-image-modal__progress-bar" style={{ width: "70%" }} />
                </div>
              ) : null}

              {uploadError ? <div className="hero-image-modal__error">{uploadError}</div> : null}

              {localPreview ? (
                <div className="hero-image-modal__preview-block">
                  <img src={localPreview} alt="" />
                  <div className="hero-image-modal__preview-meta">
                    {localFileName}
                    {localFileSize ? ` · ${formatFileSize(localFileSize)}` : ""}
                  </div>
                </div>
              ) : null}

              {recentUploads.length > 0 ? (
                <>
                  <h3 className="hero-image-modal__section-title">Enviadas recentemente</h3>
                  <div className="hero-image-modal__grid">
                    {recentUploads.map((upload) => (
                      <button
                        key={upload.id}
                        type="button"
                        className={`hero-image-modal__card${
                          selectedUrl === upload.url ? " is-selected" : ""
                        }`}
                        onClick={() => handleSelectUpload(upload.url)}
                        title={`${upload.fileName} · v${upload.version}`}
                      >
                        <img src={upload.url} alt="" />
                        <span className="hero-image-modal__card-meta">
                          <span className="hero-image-modal__card-label">{upload.fileName}</span>
                          <span className="hero-image-modal__card-category">v{upload.version}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

        <footer className="hero-image-modal__footer">
          <details className="hero-image-modal__advanced">
            <summary>URL avançada</summary>
            <input
              type="url"
              value={manualUrl}
              onChange={(event) => {
                setManualUrl(event.target.value);
                setSelectedUrl(event.target.value);
              }}
              placeholder="/bg-announcement.png ou https://..."
            />
          </details>

          <div className="hero-image-modal__footer-actions">
            <button
              type="button"
              className="hero-image-modal__cancel"
              onClick={onClose}
              disabled={uploadImage.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="hero-image-modal__confirm"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {uploadImage.isPending ? "Enviando…" : "Usar esta imagem"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
