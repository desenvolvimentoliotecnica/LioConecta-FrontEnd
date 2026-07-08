import { isAdminUser } from "../api/auth";
import type { MeDto } from "../api/types";
import { PERSONA_LABELS } from "../config/compass/constants";
import { COMPASS_MOCK_DATA } from "../config/compass/mockData";
import type { CompassMetaDto } from "../api/types";
import type { CompassPersonaContext } from "../config/compass/types";

const EMAIL_TO_DIRETORIA: Record<string, string> = {
  "leonardo.mendes@liotecnica.com.br": "Corporativo",
  "marcos.vieira@liotecnica.com.br": "Industrial",
  "natalia.rocha@liotecnica.com.br": "Serviços",
  "vicente.lima@liotecnica.com.br": "Industrial",
};

const SLUG_TO_DIRETORIA: Record<string, string> = {
  "leonardo-mendes": "Corporativo",
  "marcos-vieira": "Industrial",
  "natalia-rocha": "Serviços",
  "vicente-lima": "Industrial",
};

const PLANNER_EMAILS = new Set([
  "marcos.vieira@liotecnica.com.br",
  "natalia.rocha@liotecnica.com.br",
  "vicente.lima@liotecnica.com.br",
]);

function resolvePersonId(me?: MeDto | null): string {
  if (!me) return "p-leonardo";
  const person = COMPASS_MOCK_DATA.people.find(
    (p) => me.email && p.name.toLowerCase().includes(me.name.split(" ")[0]?.toLowerCase() ?? ""),
  );
  return person?.id ?? "p-leonardo";
}

function resolveDiretoria(me?: MeDto | null, meta?: CompassMetaDto): string {
  if (me?.email && EMAIL_TO_DIRETORIA[me.email.toLowerCase()]) {
    return EMAIL_TO_DIRETORIA[me.email.toLowerCase()];
  }
  if (me?.slug && SLUG_TO_DIRETORIA[me.slug]) {
    return SLUG_TO_DIRETORIA[me.slug];
  }
  return meta?.directorias[0]?.label ?? "Industrial";
}

export function resolveCompassPersona(me?: MeDto | null, meta?: CompassMetaDto): CompassPersonaContext {
  const personId = resolvePersonId(me);
  const allDiretorias = meta?.directorias.map((d) => d.label) ?? [
    "Industrial",
    "Serviços",
    "Comercial",
    "Corporativo",
  ];
  const diretoria = resolveDiretoria(me, meta);

  if (isAdminUser(me ?? undefined) || me?.email?.toLowerCase() === "leonardo.mendes@liotecnica.com.br") {
    return {
      persona: "executive",
      personId,
      visibleDiretorias: allDiretorias,
      readOnly: false,
      label: PERSONA_LABELS.executive,
    };
  }

  if (me?.email && PLANNER_EMAILS.has(me.email.toLowerCase())) {
    return {
      persona: "planner",
      personId,
      diretoria,
      visibleDiretorias: [diretoria],
      readOnly: false,
      label: PERSONA_LABELS.planner,
    };
  }

  return {
    persona: "contributor",
    personId,
    diretoria,
    visibleDiretorias: [diretoria],
    readOnly: true,
    label: PERSONA_LABELS.contributor,
  };
}

export function formatCompassDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr));
}

export function formatCompassCurrency(amount: number, currency = "BRL"): string {
  if (currency === "UN") {
    return `${amount.toLocaleString("pt-BR")} un`;
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function formatCompassPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatCompassVariation(atual: number, anterior: number): { abs: number; pct: number } {
  const abs = atual - anterior;
  const pct = anterior !== 0 ? (abs / anterior) * 100 : 0;
  return { abs, pct: Math.round(pct * 10) / 10 };
}

export function countCriticalVariations(variacaoPct: number, threshold = 8): boolean {
  return Math.abs(variacaoPct) >= threshold;
}
