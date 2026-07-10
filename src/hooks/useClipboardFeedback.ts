import { useCallback, useState } from "react";

export function useClipboardFeedback() {
  const [message, setMessage] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, label = "Copiado para a área de transferência") => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setMessage(label);
      window.setTimeout(() => setMessage(null), 3000);
      return true;
    } catch {
      setMessage("Não foi possível copiar");
      window.setTimeout(() => setMessage(null), 3000);
      return false;
    }
  }, []);

  return { message, copyText };
}
