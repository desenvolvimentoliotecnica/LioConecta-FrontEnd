import { Link, Navigate, useSearchParams } from "react-router-dom";
import { isAdminUser } from "../../api/auth";
import { useMe } from "../../api/hooks/useMe";
import { OrganogramManagementSection } from "./OrganogramManagementSection";
import { OrganogramSettingsSection } from "./OrganogramSettingsSection";
import "../../styles/organogram-governance-page.css";

type OrganogramTab = "gestao" | "configuracoes";

function resolveTab(value: string | null): OrganogramTab {
  return value === "configuracoes" ? "configuracoes" : "gestao";
}

export function OrganogramGovernancePage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  if (meQuery.isLoading) {
    return (
      <main className="main">
        <p className="org-governance__empty">Carregando permissões…</p>
      </main>
    );
  }

  if (!isAdminUser(meQuery.data)) {
    return <Navigate to="/" replace />;
  }

  const setTab = (next: OrganogramTab) => {
    setSearchParams(next === "gestao" ? {} : { tab: next });
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/admin/configuracoes-backend?category=organogram">Configurações do Backend</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Governança do organograma</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Governança do organograma</h1>
            <p className="page-header__desc">
              Gerencie posições, departamentos e políticas de edição do organograma governado.
            </p>
          </div>
        </div>
      </header>

      <section className="org-governance__intro" aria-label="Resumo">
        <div className="org-governance__intro-head">
          <div className="org-governance__intro-icon" aria-hidden="true">
            <i className="fa-solid fa-sitemap" />
          </div>
          <div>
            <div className="org-governance__intro-title">Fonte de verdade do organograma</div>
            <p className="org-governance__intro-text">
              Com a governança ativa, o organograma passa a consumir posições persistidas no banco.
              O Microsoft Graph permanece como base de importação e referência somente leitura.
            </p>
          </div>
        </div>
        <div className="org-governance__intro-toolbar">
          <Link className="org-governance__link-btn" to="/admin/configuracoes-backend?category=organogram">
            <i className="fa-solid fa-server" aria-hidden="true" /> Voltar ao hub de configurações
          </Link>
        </div>
      </section>

      <nav className="org-governance__tabs" aria-label="Seções">
        <button
          type="button"
          className={`org-governance__tab${tab === "gestao" ? " is-active" : ""}`}
          onClick={() => setTab("gestao")}
        >
          Gestão
        </button>
        <button
          type="button"
          className={`org-governance__tab${tab === "configuracoes" ? " is-active" : ""}`}
          onClick={() => setTab("configuracoes")}
        >
          Configurações
        </button>
      </nav>

      {tab === "gestao" ? <OrganogramManagementSection /> : <OrganogramSettingsSection />}
    </main>
  );
}
