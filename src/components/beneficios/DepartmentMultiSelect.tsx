import type { BenefitDepartmentOptionDto } from "../../api/types";

type DepartmentMultiSelectProps = {
  label: string;
  departments: BenefitDepartmentOptionDto[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function DepartmentMultiSelect({
  label,
  departments,
  selectedIds,
  onChange,
}: DepartmentMultiSelectProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <div className="beneficios-gestao__multiselect">
      <span className="beneficios-gestao__field-label">{label}</span>
      <div className="beneficios-gestao__dept-grid">
        {departments.map((dept) => (
          <label key={dept.id} className="beneficios-gestao__dept-option">
            <input
              type="checkbox"
              checked={selectedIds.includes(dept.id)}
              onChange={() => toggle(dept.id)}
            />
            <span>
              {dept.name} <em>({dept.count})</em>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
