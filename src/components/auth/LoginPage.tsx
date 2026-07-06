import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login-page.css";

const STEPS = [
  {
    title: "Informe suas credenciais",
    text: "Use seu e-mail @liotecnica.com.br e senha Microsoft 365.",
  },
  {
    title: "Autenticação segura",
    text: "Validação via Microsoft Entra ID com MFA quando habilitado.",
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
  { icon: "fa-shield-halved", label: "Acesso seguro", value: "Microsoft 365" },
  { icon: "fa-clock", label: "Disponibilidade", value: "24 horas" },
  { icon: "fa-headset", label: "Suporte", value: "Help Desk TI" },
] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <div className="login-page">
      <header className="login-page__header">
        <div className="login-page__brand">
          <img src="/logo-lioconecta.png" alt="LioConecta" className="login-page__logo" />
          <span className="login-page__brand-text">LioConecta</span>
        </div>
        <a className="login-page__help-link" href="#">
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
              <strong>Seus dados estão protegidos.</strong> Autenticação Microsoft 365 com criptografia
              corporativa.
            </p>
          </div>

          <div className="login-page__card login-page__card--form">
            <h2 className="login-page__card-title">
              <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />
              Acesso ao portal
            </h2>

            <form className="login-page__form" onSubmit={handleSubmit} noValidate>
              <label className="login-page__field">
                <span>E-mail corporativo</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="seu.nome@liotecnica.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  />
                  <button
                    type="button"
                    className="login-page__password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} aria-hidden="true" />
                  </button>
                </div>
              </label>

              <div className="login-page__form-actions">
                <a className="login-page__forgot" href="#">
                  Esqueci minha senha
                </a>
                <button type="submit" className="login-page__submit">
                  Entrar
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
