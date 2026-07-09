import { useUniLioSkills } from "../../../api/hooks/useUniLioSkills";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioSkillMatrix } from "../UniLioSkillMatrix";
import "../../../styles/unilio-skills.css";

export function UniLioCompetenciasPage() {
  const { data, isLoading, isFallback } = useUniLioSkills();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando competências…</p>
      </main>
    );
  }

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Competências</h1>
        <p className="unilio-page__desc">Mapa de habilidades — nível atual vs. meta de desenvolvimento.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioSkillMatrix skills={data.items} />
    </main>
  );
}
