import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useApiHealth } from "../../api/hooks/useApiHealth";
import { useLogin } from "../../api/hooks/useAuth";
import { clearReturnUrl, resolvePostLoginRedirect } from "../../utils/authRedirect";
import { ApiStatusIndicator } from "./ApiStatusIndicator";
import "../../styles/login-page.css";

const STEPS = [
  {
    title: "Informe suas credenciais",
    text: "Use seu e-mail @liotecnica.com.br e senha corporativa (Active Directory).",
  },
  {
    title: "Autenticação segura",
    text: "Validação via LDAP corporativo com políticas de senha do domínio.",
  },
  {
    title: "Acesse o portal",
    text: "Feed, RH, documentos e demais áreas do LioConecta.",
  },
  {
    title: "Personalize",
    text: "Configure atalhos, favoritos e notificações.",
  },
] as const;

const QUICK_FACTS = [
  { icon: "fa-shield-halved", label: "Acesso seguro", value: "LDAP corporativo" },
  { icon: "fa-clock", label: "Disponibilidade", value: "24 horas" },
  { icon: "fa-headset", label: "Suporte", value: "Help Desk TI" },
] as const;

function loginErrorMessage(error: unknown, apiOnline: boolean): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      if (error.body && typeof error.body === "object") {
        const message = (error.body as Record<string, unknown>).message;
        if (typeof message === "string" && message.trim()) {
          return apiOnline
            ? `${message} Verifique e-mail e senha — conta local de bootstrap ou credencial LDAP.`
            : message;
        }
      }
      return apiOnline
        ? "E-mail ou senha inválidos. Use a conta local de bootstrap ou credencial LDAP corporativa."
        : "E-mail ou senha inválidos.";
    }
    if (error.status === 0) {
      return "Não foi possível conectar à API. Verifique se o backend está em execução.";
    }
    return "Falha ao autenticar. Tente novamente.";
  }

  return "Falha ao autenticar. Tente novamente.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { isOnline, isOffline } = useApiHealth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    if (isOffline) {
      setError("A API está offline. Aguarde o indicador ficar verde ou reinicie o backend.");
      return;
    }

    try {
      await login.mutateAsync({ email: email.trim(), password });
      const redirectTo = resolvePostLoginRedirect(location, { includeStored: true });
      clearReturnUrl();
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(loginErrorMessage(submitError, isOnline));
    }
  };

  return (
    <div className="login-page">
      <header className="login-page__header">
        <div className="login-page__brand">
          <img src="/logo-lioconecta.png" alt="LioConecta" className="login-page__logo" />
          <span className="login-page__brand-text">LioConecta</span>
        </div>
        <a className="login-page__help-link" href="/ajuda">
          <i className="fa-regular fa-circle-question" aria-hidden="true" />
          Precisa de ajuda?
        </a>
      </header>

      <main className="login-page__main">
        <section className="login-page__intro">
          <h1 className="login-page__title">
            Bem-vindo(a) ao <span className="login-page__title-accent">LioConecta!</span>
          </h1>
          <p className="login-page__subtitle">
            Portal corporativo da Liotécnica — comunicados, RH, documentos e serviços em um só lugar.
          </p>

          <div className="login-page__security">
            <div className="login-page__security-icon" aria-hidden="true">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <p className="login-page__security-text">
              <strong>Seus dados estão protegidos.</strong> Autenticação LDAP corporativa com criptografia em
              trânsito.
            </p>
          </div>

          <div className="login-page__card login-page__card--form">
            <h2 className="login-page__card-title">
              <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
              Acesso ao portal
            </h2>

            <form className="login-page__form" onSubmit={(event) => void handleSubmit(event)} noValidate>
              {error ? (
                <div className="login-page__error" role="alert">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              <label className="login-page__field">
                <span>E-mail corporativo</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="seu.nome@liotecnica.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={login.isPending}
                  required
                />
              </label>

              <label className="login-page__field">
                <span>Senha</span>
                <div className="login-page__password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={login.isPending}
                    required
                  />
                  <button
                    type="button"
                    className="login-page__password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    disabled={login.isPending}
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} aria-hidden="true" />
                  </button>
                </div>
              </label>

              <div className="login-page__form-actions">
                <div className="login-page__form-links">
                  <a className="login-page__forgot" href="/ajuda">
                    Esqueci minha senha
                  </a>
                  <ApiStatusIndicator />
                </div>
                <button type="submit" className="login-page__submit" disabled={login.isPending || isOffline}>
                  {login.isPending ? "Entrando…" : "Entrar"}
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>

          <div className="login-page__facts">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.label} className="login-page__fact">
                <i className={`fa-solid ${fact.icon}`} aria-hidden="true" />
                <div>
                  <span className="login-page__fact-label">{fact.label}</span>
                  <strong className="login-page__fact-value">{fact.value}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="login-page__aside">
          <div className="login-page__card login-page__card--steps">
            <h2 className="login-page__steps-title">Como funciona?</h2>
            <ol className="login-page__steps">
              {STEPS.map((step, index) => (
                <li key={step.title} className="login-page__step">
                  <span className="login-page__step-number">{index + 1}</span>
                  <div>
                    <p className="login-page__step-title">{step.title}</p>
                    <p className="login-page__step-text">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </main>

      <footer className="login-page__footer">
        <span>© {new Date().getFullYear()} Liotécnica — Todos os direitos reservados</span>
        <span className="login-page__footer-sep" aria-hidden="true">
          ·
        </span>
        <a href="#">Política de privacidade</a>
      </footer>
    </div>
  );
}
