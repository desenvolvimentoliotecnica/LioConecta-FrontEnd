import { Component, type ErrorInfo, type ReactNode } from "react";
import { resolveRouteMeta, trackApplicationError } from "../../telemetry";
import "../../styles/telemetry-error-boundary.css";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Ocorreu um erro inesperado.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    trackApplicationError({
      message: error.message,
      componentStack: info.componentStack ?? undefined,
      routeTemplate: resolveRouteMeta(window.location.pathname).routeTemplate,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="telemetry-error-boundary" role="alert">
        <div className="telemetry-error-boundary__card">
          <div className="telemetry-error-boundary__icon" aria-hidden="true">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <h1 className="telemetry-error-boundary__title">Algo deu errado</h1>
          <p className="telemetry-error-boundary__text">
            Registramos o erro para investigação. Você pode recarregar a página e tentar novamente.
          </p>
          {this.state.message ? (
            <p className="telemetry-error-boundary__detail">{this.state.message}</p>
          ) : null}
          <button type="button" className="telemetry-error-boundary__button" onClick={this.handleReload}>
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
