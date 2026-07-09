import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  PortalConfirmModal,
  type PortalConfirmVariant,
} from "../components/ui/PortalConfirmModal";

export type PortalConfirmOptions = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: PortalConfirmVariant;
};

export function usePortalConfirm() {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [state, setState] = useState<(PortalConfirmOptions & { open: boolean }) | null>(null);

  const ask = useCallback((options: PortalConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const handleClose = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setState(null);
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setState(null);
  }, []);

  const confirmModal = state ? (
    <PortalConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { ask, confirmModal };
}
