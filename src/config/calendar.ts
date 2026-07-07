export type CalendarEventKind = "aniversario";

export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  href?: string;
};

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getTodayDateKey(reference = new Date()): string {
  return toDateKey(reference.getFullYear(), reference.getMonth(), reference.getDate());
}

export function birthdayToNextDateKey(birthDate: string, reference = new Date()): string {
  const parts = birthDate.split("-");
  if (parts.length !== 3) return birthDate;

  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const year = reference.getFullYear();
  const today = new Date(reference);
  today.setHours(0, 0, 0, 0);

  let next = new Date(year, month - 1, day);
  if (next < today) {
    next = new Date(year + 1, month - 1, day);
  }

  return toDateKey(next.getFullYear(), next.getMonth(), next.getDate());
}

export function mapBirthdaysToCalendarEvents(
  people: { slug: string; name: string; title?: string | null; departmentName?: string | null; birthDate: string }[],
): CalendarEvent[] {
  return people
    .filter((person) => person.birthDate)
    .map((person) => {
      const date = birthdayToNextDateKey(person.birthDate);
      const role = person.title ? ` — ${person.title}` : "";
      const dept = person.departmentName ? ` · ${person.departmentName}` : "";

      return {
        id: `aniv-${person.slug}-${date}`,
        kind: "aniversario",
        title: `Aniversário — ${person.name}`,
        date,
        description: `Parabenize ${person.name}${role}${dept}.`,
        href: `/pessoas/perfil?id=${encodeURIComponent(person.slug)}`,
      };
    });
}

export function toDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function parseDateKey(key: string): { year: number; month: number; day: number } {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month: month - 1, day };
}

export function formatLongDate(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return `${day} de ${MONTH_NAMES[month].toLowerCase()} de ${year}`;
}
