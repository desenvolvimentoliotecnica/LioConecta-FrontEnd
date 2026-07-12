import type { WikiCategoryDto } from "../../api/types";

const FALLBACK_CATEGORIES: WikiCategoryDto[] = [
  { id: "acesso", label: "Acesso", count: 0 },
  { id: "hardware", label: "Hardware", count: 0 },
  { id: "software", label: "Software", count: 0 },
];

type Props = {
  categories?: WikiCategoryDto[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  totalCount?: number;
};

export function WikiSidebarTree({
  categories,
  selectedCategory,
  onSelect,
  totalCount,
}: Props) {
  const items =
    categories && categories.length > 0
      ? categories
      : FALLBACK_CATEGORIES.map((c) => ({
          ...c,
          count: categories?.find((x) => x.id === c.id)?.count ?? 0,
        }));

  const allCount =
    totalCount ?? items.reduce((sum, item) => sum + (item.count ?? 0), 0);

  return (
    <nav className="wiki-shell__sidebar" aria-label="Categorias da Wiki">
      <div className="wiki-shell__sidebar-title">Categorias</div>
      <ul className="wiki-tree">
        <li className="wiki-tree__item">
          <button
            type="button"
            className={`wiki-tree__btn${selectedCategory === null ? " is-active" : ""}`}
            onClick={() => onSelect(null)}
          >
            <i className="fa-solid fa-layer-group" aria-hidden="true" />
            <span>Todos</span>
            <span className="wiki-tree__count">{allCount}</span>
          </button>
        </li>
        {items.map((cat) => (
          <li key={cat.id} className="wiki-tree__item">
            <button
              type="button"
              className={`wiki-tree__btn${selectedCategory === cat.id ? " is-active" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <i className="fa-regular fa-folder" aria-hidden="true" />
              <span>{cat.label}</span>
              <span className="wiki-tree__count">{cat.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
