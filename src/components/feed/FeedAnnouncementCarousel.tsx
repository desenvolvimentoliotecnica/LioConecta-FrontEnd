import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { resolveBackendAssetUrl } from "../../api/assetUrl";
import { useComunicadosList } from "../../api/hooks/useComunicados";
import { config } from "../../api/client";
import type { ComunicadoKind, ComunicadoListItemDto } from "../../api/types";
import {
  COMUNICADO_KIND_ARQUIVO,
  COMUNICADO_KIND_DEPARTAMENTAL,
  COMUNICADO_KIND_OFICIAL,
  COMUNICADO_KIND_URGENTE,
} from "../../api/types";
import { comunicadosCatalog, comunicadoReaderPath } from "../../config/comunicados";
import { comunicadoReaderId } from "../../config/comunicados-pages";
import "./feed-announcement-carousel.css";

const AUTO_INTERVAL_MS = 5000;
const DEFAULT_HERO = "/bg-announcement.png";

const KIND_TAG: Record<ComunicadoKind, { label: string; className: string }> = {
  [COMUNICADO_KIND_OFICIAL]: { label: "Comunicado oficial", className: "" },
  [COMUNICADO_KIND_DEPARTAMENTAL]: { label: "Departamental", className: "tag--dept" },
  [COMUNICADO_KIND_URGENTE]: { label: "Urgente", className: "tag--urgent" },
  [COMUNICADO_KIND_ARQUIVO]: { label: "Arquivo", className: "tag--archive" },
};

type CarouselSlide = {
  key: string;
  title: string;
  excerpt: string;
  tagLabel: string;
  tagClassName: string;
  heroImage: string;
  href: string;
};

function catalogSlides(readerBase: "default" | "kiosk"): CarouselSlide[] {
  return comunicadosCatalog
    .filter((item) => item.kind === "oficial" || item.kind === "urgente" || item.kind === "departamental")
    .map((item) => ({
      key: item.id,
      title: item.title,
      excerpt: item.excerpt,
      tagLabel: item.tag,
      tagClassName: item.tagClass,
      heroImage: item.heroImage || DEFAULT_HERO,
      href: readerHref(item.id, readerBase),
    }));
}

function readerHref(id: string, readerBase: "default" | "kiosk"): string {
  const path = comunicadoReaderPath(id);
  if (readerBase === "kiosk") {
    return path.replace("/comunicados/leitura", "/quiosque/comunicados/leitura");
  }
  return path;
}

function toSlide(item: ComunicadoListItemDto, readerBase: "default" | "kiosk"): CarouselSlide {
  const readerId = comunicadoReaderId(item);
  const tag = KIND_TAG[item.kind] ?? KIND_TAG[COMUNICADO_KIND_OFICIAL];
  const resolvedHero = resolveBackendAssetUrl(item.heroImageUrl) || DEFAULT_HERO;
  return {
    key: item.id,
    title: item.title,
    excerpt: item.excerpt?.trim() || "Leia o comunicado completo para mais detalhes.",
    tagLabel: tag.label,
    tagClassName: tag.className,
    heroImage: resolvedHero,
    href: readerHref(readerId, readerBase),
  };
}

function mergeActiveSlides(
  oficiais: ComunicadoListItemDto[] | undefined,
  departamentais: ComunicadoListItemDto[] | undefined,
  urgentes: ComunicadoListItemDto[] | undefined,
  readerBase: "default" | "kiosk",
): CarouselSlide[] {
  const byId = new Map<string, ComunicadoListItemDto>();
  for (const item of [...(urgentes ?? []), ...(oficiais ?? []), ...(departamentais ?? [])]) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }

  return [...byId.values()]
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    })
    .map((item) => toSlide(item, readerBase));
}

export function FeedAnnouncementCarousel({ variant = "default" }: { variant?: "default" | "kiosk" }) {
  const oficiais = useComunicadosList(COMUNICADO_KIND_OFICIAL, 50);
  const departamentais = useComunicadosList(COMUNICADO_KIND_DEPARTAMENTAL, 50);
  const urgentes = useComunicadosList(COMUNICADO_KIND_URGENTE, 50);

  const slides = useMemo(() => {
    if (config.useMock) return catalogSlides(variant);

    const fromApi = mergeActiveSlides(
      oficiais.data?.items,
      departamentais.data?.items,
      urgentes.data?.items,
      variant,
    );

    if (fromApi.length > 0) return fromApi;

    const stillLoading = oficiais.isLoading || departamentais.isLoading || urgentes.isLoading;
    if (stillLoading) return [];

    return catalogSlides(variant);
  }, [
    variant,
    oficiais.data?.items,
    departamentais.data?.items,
    urgentes.data?.items,
    oficiais.isLoading,
    departamentais.isLoading,
    urgentes.isLoading,
  ]);

  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const count = slides.length;

  useEffect(() => {
    setIndex(0);
  }, [count]);

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((current) => (current + 1) % count);
    }, AUTO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) {
    return (
      <section className="announcement announcement--loading" aria-label="Comunicados" aria-busy="true">
        <div className="announcement__hero">
          <div className="announcement__content">
            <span className="tag">Comunicados</span>
            <h2>Carregando comunicados…</h2>
          </div>
        </div>
      </section>
    );
  }

  const safeIndex = ((index % count) + count) % count;
  const slide = slides[safeIndex]!;
  const tagClass = slide.tagClassName ? ` ${slide.tagClassName}` : "";
  const showControls = count > 1;

  return (
    <section
      className="announcement announcement--carousel"
      aria-label="Comunicados ativos"
      aria-roledescription="carrossel"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
    >
      <Link
        className="announcement__hero announcement__hero--link"
        to={slide.href}
        style={{ backgroundImage: `url("${slide.heroImage}")` }}
        aria-label={`${slide.tagLabel}: ${slide.title}. Abrir leitura`}
      >
        <div className="announcement__content">
          <span className={`tag${tagClass}`}>{slide.tagLabel}</span>
          <h2>{slide.title}</h2>
          <p>{slide.excerpt}</p>
          <span className="announcement__cta">
            Ler comunicado completo <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </div>
      </Link>

      {showControls ? (
        <>
          <button
            type="button"
            className="announcement__nav announcement__nav--prev"
            aria-label="Comunicado anterior"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(-1);
            }}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="announcement__nav announcement__nav--next"
            aria-label="Próximo comunicado"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(1);
            }}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
          <div className="announcement__dots" role="tablist" aria-label="Posição do carrossel">
            {slides.map((item, i) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Comunicado ${i + 1} de ${count}`}
                className={`announcement__dot${i === safeIndex ? " is-active" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
