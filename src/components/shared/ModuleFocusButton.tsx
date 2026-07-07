import { useModuleFocus } from "../../context/ModuleFocusContext";

type ModuleFocusButtonProps = {
  className?: string;
};

export function ModuleFocusButton({ className = "" }: ModuleFocusButtonProps) {
  const { focusMode, toggleFocusMode, isModuleRoute } = useModuleFocus();

  if (!isModuleRoute) return null;

  return (
    <button
      type="button"
      className={`module-focus-btn${focusMode ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggleFocusMode}
      aria-pressed={focusMode}
      title={focusMode ? "Sair do modo foco" : "Modo foco - ocultar menus e maximizar conteudo"}
    >
      <i className={`fa-solid ${focusMode ? "fa-compress" : "fa-expand"}`} aria-hidden="true" />
      <span className="module-focus-btn__label">{focusMode ? "Sair do foco" : "Modo foco"}</span>
    </button>
  );
}
