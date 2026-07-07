type PayslipToastPayload = {
  title: string;
  message: string;
  variant?: "success" | "error";
};

let container: HTMLDivElement | null = null;

function ensureContainer() {
  if (container && document.body.contains(container)) {
    return container;
  }

  container = document.createElement("div");
  container.className = "pay-toast-stack";
  container.setAttribute("aria-live", "polite");
  document.body.appendChild(container);
  return container;
}

export function showPayslipToast({ title, message, variant = "success" }: PayslipToastPayload) {
  const host = ensureContainer();
  const toast = document.createElement("div");
  toast.className = `pay-toast pay-toast--${variant}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <strong class="pay-toast__title">${title}</strong>
    <p class="pay-toast__message">${message}</p>
  `;

  host.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

export async function downloadBlobWithToast(
  blobPromise: Promise<Blob>,
  filename: string,
  successMessage: string,
) {
  try {
    const blob = await blobPromise;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);

    showPayslipToast({
      title: "Download concluído",
      message: successMessage,
      variant: "success",
    });
  } catch {
    showPayslipToast({
      title: "Falha no download",
      message: "Não foi possível baixar o arquivo. Tente novamente.",
      variant: "error",
    });
    throw new Error("download_failed");
  }
}
