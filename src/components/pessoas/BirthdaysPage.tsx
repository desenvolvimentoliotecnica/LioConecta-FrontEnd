import { useState } from "react";
import { Link } from "react-router-dom";
import { useBirthdays } from "../../api/hooks/useBirthdays";
import { useCreateTypedPost } from "../../api/hooks/useFeed";
import { POST_TYPE_CELEBRATION } from "../../api/types";

const periods = [{ label: "Hoje", days: 1 }, { label: "Semana", days: 7 }, { label: "Mês", days: 31 }];

export function BirthdaysPage() {
  const [days, setDays] = useState(1);
  const birthdays = useBirthdays(days);
  const celebrate = useCreateTypedPost(POST_TYPE_CELEBRATION);
  return <main className="main">
    <header className="page-header"><nav className="breadcrumb"><Link to="/">Início</Link><span className="breadcrumb__sep">/</span><Link to="/pessoas">Pessoas</Link><span className="breadcrumb__sep">/</span><span className="breadcrumb__current">Aniversariantes</span></nav><h1 className="page-header__title">Aniversariantes</h1><p className="page-header__desc">Celebre os colegas que fazem aniversário.</p></header>
    <div className="page-filters">{periods.map((period) => <button type="button" key={period.days} className={`filter-chip${days === period.days ? " is-active" : ""}`} onClick={() => setDays(period.days)}>{period.label}</button>)}</div>
    {birthdays.isLoading ? <p className="page-empty-note">Carregando aniversariantes...</p> : birthdays.data?.length ? <section className="official-list">{birthdays.data.map((person) => <article className="official-card" key={person.id ?? person.slug}><div className="official-card__body"><h2 className="official-card__title">{person.name}</h2><p className="official-card__excerpt">{person.title ?? person.departmentName ?? "Colaborador"} · {new Date(person.birthDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</p><button className="official-card__cta" type="button" disabled={celebrate.isPending} onClick={() => void celebrate.mutateAsync({ content: `Parabéns, ${person.name}! 🎉`, metadata: { personId: person.id, personSlug: person.slug } })}>Parabenizar</button></div></article>)}</section> : <p className="page-empty-note">Nenhum aniversariante neste período.</p>}
  </main>;
}
