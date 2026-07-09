import type { BenefitDependentDto, BenefitDetailLineDto } from "../../api/types";

type LinesEditorProps = {
  lines: BenefitDetailLineDto[];
  onChange: (lines: BenefitDetailLineDto[]) => void;
};

type DependentsEditorProps = {
  dependents: BenefitDependentDto[];
  onChange: (dependents: BenefitDependentDto[]) => void;
};

type NotesEditorProps = {
  notes: string[];
  onChange: (notes: string[]) => void;
};

function emptyLine(): BenefitDetailLineDto {
  return { label: "", amount: null, note: null };
}

function emptyDependent(): BenefitDependentDto {
  return { name: "", relation: "", monthlyValue: null };
}

export function BenefitCatalogLinesEditor({ lines, onChange }: LinesEditorProps) {
  const updateLine = (index: number, patch: Partial<BenefitDetailLineDto>) => {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="beneficios-gestao__detail-editor">
      <div className="beneficios-gestao__detail-editor-head">
        <span>Itens do detalhamento</span>
        <button
          type="button"
          className="beneficios-gestao-btn beneficios-gestao-btn--ghost beneficios-gestao-btn--sm"
          onClick={() => onChange([...lines, emptyLine()])}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar linha
        </button>
      </div>

      {lines.length === 0 ? (
        <p className="beneficios-gestao__detail-empty">
          Nenhum item. Use valor, texto informativo ou ambos — como na view do colaborador.
        </p>
      ) : (
        <div className="beneficios-gestao__detail-list">
          {lines.map((line, index) => (
            <div key={`line-${index}`} className="beneficios-gestao__detail-row">
              <label>
                Rótulo
                <input
                  value={line.label}
                  placeholder="Ex: Mensalidade titular"
                  onChange={(event) => updateLine(index, { label: event.target.value })}
                />
              </label>
              <label>
                Valor (R$)
                <input
                  type="number"
                  step="0.01"
                  value={line.amount ?? ""}
                  placeholder="Opcional"
                  onChange={(event) =>
                    updateLine(index, {
                      amount: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                />
              </label>
              <label className="beneficios-gestao__detail-row-note">
                Observação
                <input
                  value={line.note ?? ""}
                  placeholder="Exibida quando não há valor ou como complemento"
                  onChange={(event) =>
                    updateLine(index, { note: event.target.value || null })
                  }
                />
              </label>
              <button
                type="button"
                className="beneficios-gestao__detail-remove"
                aria-label="Remover linha"
                onClick={() => removeLine(index)}
              >
                <i className="fa-solid fa-trash-can" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BenefitCatalogDependentsEditor({ dependents, onChange }: DependentsEditorProps) {
  const updateDependent = (index: number, patch: Partial<BenefitDependentDto>) => {
    onChange(dependents.map((dep, i) => (i === index ? { ...dep, ...patch } : dep)));
  };

  const removeDependent = (index: number) => {
    onChange(dependents.filter((_, i) => i !== index));
  };

  return (
    <div className="beneficios-gestao__detail-editor">
      <div className="beneficios-gestao__detail-editor-head">
        <span>Dependentes (modelo)</span>
        <button
          type="button"
          className="beneficios-gestao-btn beneficios-gestao-btn--ghost beneficios-gestao-btn--sm"
          onClick={() => onChange([...dependents, emptyDependent()])}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar dependente
        </button>
      </div>

      <p className="beneficios-gestao__wizard-hint">
        Modelo copiado para novos vínculos. Ajuste nomes e valores por colaborador na atribuição
        individual, se necessário.
      </p>

      {dependents.length === 0 ? (
        <p className="beneficios-gestao__detail-empty">Sem dependentes no modelo (comum em VR, VT, etc.).</p>
      ) : (
        <div className="beneficios-gestao__detail-list">
          {dependents.map((dep, index) => (
            <div key={`dep-${index}`} className="beneficios-gestao__detail-row">
              <label>
                Nome
                <input
                  value={dep.name}
                  placeholder="Nome do dependente"
                  onChange={(event) => updateDependent(index, { name: event.target.value })}
                />
              </label>
              <label>
                Vínculo
                <input
                  value={dep.relation}
                  placeholder="Ex: Cônjuge, Filha"
                  onChange={(event) => updateDependent(index, { relation: event.target.value })}
                />
              </label>
              <label>
                Mensalidade (R$)
                <input
                  type="number"
                  step="0.01"
                  value={dep.monthlyValue ?? ""}
                  placeholder="Opcional"
                  onChange={(event) =>
                    updateDependent(index, {
                      monthlyValue: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                />
              </label>
              <button
                type="button"
                className="beneficios-gestao__detail-remove"
                aria-label="Remover dependente"
                onClick={() => removeDependent(index)}
              >
                <i className="fa-solid fa-trash-can" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BenefitCatalogNotesEditor({ notes, onChange }: NotesEditorProps) {
  const updateNote = (index: number, value: string) => {
    onChange(notes.map((note, i) => (i === index ? value : note)));
  };

  const removeNote = (index: number) => {
    onChange(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="beneficios-gestao__detail-editor">
      <div className="beneficios-gestao__detail-editor-head">
        <span>Observações</span>
        <button
          type="button"
          className="beneficios-gestao-btn beneficios-gestao-btn--ghost beneficios-gestao-btn--sm"
          onClick={() => onChange([...notes, ""])}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar observação
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="beneficios-gestao__detail-empty">Nenhuma observação adicional.</p>
      ) : (
        <div className="beneficios-gestao__detail-list beneficios-gestao__detail-list--notes">
          {notes.map((note, index) => (
            <div key={`note-${index}`} className="beneficios-gestao__detail-row beneficios-gestao__detail-row--note">
              <label>
                Texto
                <input
                  value={note}
                  placeholder="Informação exibida ao colaborador"
                  onChange={(event) => updateNote(index, event.target.value)}
                />
              </label>
              <button
                type="button"
                className="beneficios-gestao__detail-remove"
                aria-label="Remover observação"
                onClick={() => removeNote(index)}
              >
                <i className="fa-solid fa-trash-can" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
