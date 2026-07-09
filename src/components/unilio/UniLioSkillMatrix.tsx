import type { UniLioSkillLevel } from "../../config/unilio/types";
import "../../styles/unilio-skills.css";

type Props = {
  skills: UniLioSkillLevel[];
};

export function UniLioSkillMatrix({ skills }: Props) {
  if (skills.length === 0) {
    return <p className="unilio-panel__empty">Nenhuma competência mapeada.</p>;
  }

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="unilio-skill-matrix">
      {categories.map((category) => (
        <section key={category} className="unilio-skill-matrix__group">
          <h3 className="unilio-skill-matrix__category">{category}</h3>
          <div className="unilio-skill-matrix__grid">
            {skills
              .filter((s) => s.category === category)
              .map((skill) => (
                <article key={skill.skillId} className="unilio-skill-card">
                  <h4 className="unilio-skill-card__name">{skill.name}</h4>
                  <div className="unilio-skill-card__levels">
                    <div className="unilio-skill-card__level">
                      <span>Atual</span>
                      <div className="unilio-skill-card__dots">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`unilio-skill-card__dot${n <= skill.currentLevel ? " is-filled" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="unilio-skill-card__level">
                      <span>Meta</span>
                      <div className="unilio-skill-card__dots">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`unilio-skill-card__dot unilio-skill-card__dot--target${n <= skill.targetLevel ? " is-filled" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {skill.relatedCourseTitles.length > 0 ? (
                    <ul className="unilio-skill-card__courses">
                      {skill.relatedCourseTitles.map((title) => (
                        <li key={title}>{title}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
