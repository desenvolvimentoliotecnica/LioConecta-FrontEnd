import { useState } from "react";
import { Link } from "react-router-dom";
import { useNewHires } from "../../api/hooks/useF3";

export function NewHiresPage() {
  const [days, setDays] = useState(30);
  const hires = useNewHires(days);
  return <main className="main">
    <header className="page-header"><nav className="breadcrumb"><Link to="/">Início</Link><span className="breadcrumb__sep">/</span><Link to="/pessoas">Pessoas</Link><span className="breadcrumb__sep">/</span><span className="breadcrumb__current">Novos colaboradores</span></nav><h1 className="page-header__title">Novos colaboradores</h1><p className="page-header__desc">Conheça quem chegou recentemente à Lio.</p></header>
    <label className="page-search">Período <select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select></label>
    {hires.isLoading ? <p className="page-empty-note">Carregando colaboradores...</p> : hires.data?.length ? <section className="official-list">{hires.data.map((person) => <article className="official-card" key={person.id}><div className="official-card__body"><h2 className="official-card__title">{person.name}</h2><p className="official-card__excerpt">{person.title ?? "Colaborador"}{person.departmentName ? ` · ${person.departmentName}` : ""}</p><p className="official-card__date">Entrada: {person.hiredAt || person.hireDate ? new Date(person.hiredAt ?? person.hireDate!).toLocaleDateString("pt-BR") : "Não informada"}</p></div></article>)}</section> : <p className="page-empty-note">Nenhum novo colaborador neste período.</p>}
  </main>;
}
