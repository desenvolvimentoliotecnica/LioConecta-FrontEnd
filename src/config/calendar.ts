export type CalendarEventKind =
  | "all"
  | "reuniao"
  | "evento"
  | "rh"
  | "comunicado"
  | "aniversario"
  | "reserva"
  | "grupo";

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

export const CALENDAR_FILTERS: { id: CalendarEventKind; label: string; icon: string }[] = [
  { id: "all", label: "Todos", icon: "fa-calendar-days" },
  { id: "reuniao", label: "Reuniões", icon: "fa-handshake" },
  { id: "evento", label: "Eventos", icon: "fa-champagne-glasses" },
  { id: "rh", label: "RH", icon: "fa-user-group" },
  { id: "comunicado", label: "Comunicados", icon: "fa-bullhorn" },
  { id: "aniversario", label: "Aniversários", icon: "fa-cake-candles" },
  { id: "reserva", label: "Reservas", icon: "fa-door-open" },
  { id: "grupo", label: "Grupos", icon: "fa-people-group" },
];

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

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "ev-alinhamento-semanal",
    kind: "reuniao",
    title: "Alinhamento semanal — Marketing",
    date: "2026-07-04",
    startTime: "10:00",
    endTime: "11:00",
    location: "Sala Orion · 3º andar",
    description: "Status de campanhas, calendário editorial e prioridades da semana.",
    href: "/servicos/reservas-salas",
  },
  {
    id: "ev-prazo-estrategia",
    kind: "comunicado",
    title: "Prazo: socializar estratégia 2026",
    date: "2026-07-04",
    description: "Gestores devem repassar o comunicado oficial às equipes até hoje.",
    href: "/comunicados/leitura?id=estrategia-2026",
  },
  {
    id: "ev-treinamento-seguranca",
    kind: "rh",
    title: "Treinamento de segurança da informação",
    date: "2026-07-07",
    startTime: "14:00",
    endTime: "15:30",
    location: "Online · Teams",
    description: "Módulo obrigatório para todos os colaboradores.",
    href: "/comunicados/leitura?id=seguranca-informacao",
  },
  {
    id: "ev-grupo-data-analytics",
    kind: "grupo",
    title: "Data & Analytics — Office Hour",
    date: "2026-07-08",
    startTime: "16:00",
    endTime: "17:00",
    location: "Grupo interno",
    description: "Sessão aberta de dúvidas sobre dashboards e métricas.",
    href: "/grupos/explorar",
  },
  {
    id: "ev-reserva-sala-orion",
    kind: "reserva",
    title: "Reserva Sala Orion",
    date: "2026-07-08",
    startTime: "14:00",
    endTime: "16:00",
    location: "Facilities",
    href: "/servicos/reservas-salas",
  },
  {
    id: "ev-happy-hour",
    kind: "evento",
    title: "Happy Hour de meio de ano",
    date: "2026-07-10",
    startTime: "18:00",
    endTime: "20:00",
    location: "Área externa · Sede SP",
    description: "Confraternização entre áreas. Confirme presença no feed.",
    href: "/",
  },
  {
    id: "ev-ferias-coletivas",
    kind: "rh",
    title: "Prazo preferência férias coletivas",
    date: "2026-07-11",
    description: "Último dia para registrar preferências de férias coletivas 2026.",
    href: "/comunicados/leitura?id=ferias-coletivas-2026",
  },
  {
    id: "ev-reuniao-diretoria",
    kind: "reuniao",
    title: "Reunião de diretoria",
    date: "2026-07-14",
    startTime: "09:00",
    endTime: "12:00",
    location: "Sala Board · Sede SP",
    href: "/servicos/reservas-salas",
  },
  {
    id: "ev-workshop-inovacao",
    kind: "evento",
    title: "Workshop de inovação aberta",
    date: "2026-07-17",
    startTime: "09:30",
    endTime: "12:00",
    location: "Auditório principal",
    description: "Apresentação de projetos internos e pitch de ideias.",
    href: "/grupos/meus-grupos",
  },
  {
    id: "ev-comunicado-departamental",
    kind: "comunicado",
    title: "Publicação comunicados departamentais",
    date: "2026-07-18",
    description: "Nova rodada de comunicados departamentais disponível no portal.",
    href: "/comunicados/departamentais",
  },
  {
    id: "ev-grupo-rh",
    kind: "grupo",
    title: "RH & Inovação — Town Hall",
    date: "2026-07-22",
    startTime: "11:00",
    endTime: "12:00",
    location: "Online",
    href: "/grupos/meus-grupos",
  },
  {
    id: "ev-reserva-veiculo",
    kind: "reserva",
    title: "Reserva veículo corporativo",
    date: "2026-07-23",
    startTime: "08:00",
    endTime: "18:00",
    location: "Visita cliente — Campinas",
    href: "/servicos/reserva-veiculos",
  },
  {
    id: "ev-1on1-gestor",
    kind: "reuniao",
    title: "1:1 com gestor",
    date: "2026-07-25",
    startTime: "15:00",
    endTime: "15:45",
    location: "Teams",
  },
  {
    id: "ev-fechar-ponto",
    kind: "rh",
    title: "Fechamento ponto eletrônico",
    date: "2026-07-28",
    description: "Revise marcações pendentes antes do fechamento mensal.",
    href: "/servicos/ponto-eletronico",
  },
  {
    id: "ev-evento-marketing",
    kind: "evento",
    title: "Lançamento campanha Q3",
    date: "2026-07-30",
    startTime: "10:00",
    endTime: "11:30",
    location: "Sala Criativa",
    href: "/",
  },
  {
    id: "ev-reuniao-ti",
    kind: "reuniao",
    title: "Review sprint TI",
    date: "2026-06-30",
    startTime: "16:00",
    endTime: "17:00",
    location: "Sala Dev",
  },
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

export function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function filterEvents(
  events: CalendarEvent[],
  kind: CalendarEventKind,
  monthKey: string,
): CalendarEvent[] {
  const [year, month] = monthKey.split("-").map(Number);
  return events.filter((event) => {
    const eventDate = parseDateKey(event.date);
    if (eventDate.year !== year || eventDate.month !== month - 1) return false;
    if (kind !== "all" && event.kind !== kind) return false;
    return true;
  });
}

export function eventsForDay(events: CalendarEvent[], dateKey: string): CalendarEvent[] {
  return events
    .filter((event) => event.date === dateKey)
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
}

export function upcomingEvents(events: CalendarEvent[], fromDateKey: string, limit = 5): CalendarEvent[] {
  return events
    .filter((event) => event.date >= fromDateKey)
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    })
    .slice(0, limit);
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.startTime && event.endTime) return `${event.startTime} – ${event.endTime}`;
  if (event.startTime) return event.startTime;
  return "Dia inteiro";
}

export function formatLongDate(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return `${day} de ${MONTH_NAMES[month].toLowerCase()} de ${year}`;
}

export type DailyMenuItem = {
  category: string;
  name: string;
  detail?: string;
  vegetarian?: boolean;
};

export type DailyMenu = {
  date: string;
  location: string;
  hours: string;
  items: DailyMenuItem[];
};

const WEEKDAY_MENUS: DailyMenuItem[][] = [
  [
    { category: "Prato principal", name: "Frango grelhado com ervas", detail: "Arroz integral e feijão" },
    { category: "Salada", name: "Mix de folhas com tomate cereja" },
    { category: "Sobremesa", name: "Gelatina de frutas vermelhas" },
    { category: "Bebida", name: "Suco de laranja natural" },
  ],
  [
    { category: "Prato principal", name: "Picadinho de carne", detail: "Purê de batata" },
    { category: "Opção veg", name: "Grão-de-bico com legumes", vegetarian: true },
    { category: "Salada", name: "Beterraba ralada com cenoura" },
    { category: "Sobremesa", name: "Fruta da estação" },
  ],
  [
    { category: "Prato principal", name: "Peixe assado com limão", detail: "Legumes no vapor" },
    { category: "Salada", name: "Tabule com hortelã" },
    { category: "Sobremesa", name: "Pudim de leite" },
    { category: "Bebida", name: "Água saborizada" },
  ],
  [
    { category: "Prato principal", name: "Estrogonofe de frango", detail: "Arroz branco e batata palha" },
    { category: "Opção veg", name: "Risoto de cogumelos", vegetarian: true },
    { category: "Salada", name: "Alface americana com pepino" },
    { category: "Sobremesa", name: "Mousse de maracujá" },
  ],
  [
    { category: "Prato principal", name: "Feijoada light", detail: "Couve refogada e farofa" },
    { category: "Salada", name: "Vinagrete especial" },
    { category: "Sobremesa", name: "Doce de leite" },
    { category: "Bebida", name: "Caipirinha zero (sem álcool)" },
  ],
  [
    { category: "Prato principal", name: "Massa ao molho pesto", detail: "Salada verde inclusa" },
    { category: "Opção veg", name: "Lasanha de berinjela", vegetarian: true },
    { category: "Sobremesa", name: "Brownie com calda" },
  ],
  [
    { category: "Prato principal", name: "Churrasco de equipe", detail: "Pão de alho e mandioca" },
    { category: "Salada", name: "Maionese de batata" },
    { category: "Sobremesa", name: "Salada de frutas" },
    { category: "Bebida", name: "Refrigerante e água" },
  ],
];

const SPECIAL_MENUS: Record<string, DailyMenuItem[]> = {
  "2026-07-04": [
    { category: "Prato principal", name: "Picanha na brasa", detail: "Farofa, vinagrete e mandioca" },
    { category: "Opção veg", name: "Escondidinho de palmito", vegetarian: true },
    { category: "Salada", name: "Salpicão de frango" },
    { category: "Sobremesa", name: "Brigadeiro gourmet" },
    { category: "Bebida", name: "Suco de abacaxi com hortelã" },
  ],
  "2026-07-10": [
    { category: "Especial", name: "Menu happy hour", detail: "Petiscos variados para o evento" },
    { category: "Prato principal", name: "Mini burgers e coxinhas" },
    { category: "Opção veg", name: "Bruschetta de tomate seco", vegetarian: true },
    { category: "Sobremesa", name: "Petit gateau" },
    { category: "Bebida", name: "Refrigerantes e sucos" },
  ],
};

export function getDailyMenu(dateKey: string): DailyMenu {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(year, month, day);
  const weekdayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const items = SPECIAL_MENUS[dateKey] ?? WEEKDAY_MENUS[weekdayIndex];

  return {
    date: dateKey,
    location: "Refeitório · Sede SP",
    hours: "Almoço 11h30 – 14h30",
    items,
  };
}
