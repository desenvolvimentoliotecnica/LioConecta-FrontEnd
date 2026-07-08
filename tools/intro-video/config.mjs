import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, "..", "..");
export const INTRO_DIR = join(ROOT, "docs", "intro-video");
export const WORK_DIR = join(INTRO_DIR, "build");
export const SCREENSHOTS_DIR = join(WORK_DIR, "screenshots");
export const AUDIO_DIR = join(WORK_DIR, "audio");
export const FRAMES_DIR = join(WORK_DIR, "frames");
export const CLIPS_DIR = join(WORK_DIR, "clips");
export const OUTPUT_MP4 = join(ROOT, "public", "videos", "lioconecta-intro.mp4");

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DEV_PORT = 5175;
export const STATIC_PORT = 4178;

export const INTRO_SECONDS = 4;
export const OUTRO_SECONDS = 5;
export const MODULE_PADDING = 0.6;

export const MODULES = [
  {
    id: "feed",
    path: "/",
    title: "Feed Corporativo",
    tag: "Publicações · Enquetes · Parabenizações",
    narration:
      "No Feed corporativo, você acompanha publicações, enquetes, parabenizações e as novidades da empresa em tempo real.",
    zoom: "in",
  },
  {
    id: "comunicados",
    path: "/comunicados",
    title: "Comunicados",
    tag: "Oficiais · Urgentes · Departamentais",
    narration:
      "Comunicados concentra avisos oficiais, alertas urgentes e informações departamentais com leitura rastreável.",
    zoom: "left",
  },
  {
    id: "pessoas",
    path: "/pessoas",
    title: "Pessoas",
    tag: "Diretório · Perfis · Organograma",
    narration:
      "Em Pessoas, encontre colegas, explore perfis e navegue pelo organograma da organização.",
    zoom: "right",
  },
  {
    id: "documentos",
    path: "/documentos",
    title: "Documentos",
    tag: "Políticas · Formulários · Biblioteca",
    narration:
      "Documentos centraliza políticas, formulários, manuais e toda a biblioteca institucional.",
    zoom: "in",
  },
  {
    id: "grupos",
    path: "/grupos",
    title: "Grupos",
    tag: "Comunidades · Colaboração · Projetos",
    narration:
      "Grupos reúnem comunidades por tema, projeto ou área para colaboração contínua.",
    zoom: "left",
  },
  {
    id: "calendario",
    path: "/calendario",
    title: "Calendário",
    tag: "Agenda · Reuniões · Aniversários",
    narration:
      "O Calendário integra sua agenda com reuniões, compromissos e aniversários corporativos.",
    zoom: "right",
  },
  {
    id: "help-desk",
    path: "/servicos/help-desk",
    title: "Help Desk",
    tag: "TI · Chamados · Serviços",
    narration:
      "E no Help Desk, abra chamados de TI e demais serviços em poucos cliques.",
    zoom: "in",
  },
];

export const NARRATION_HOOK = {
  id: "hook",
  text: "Bem-vindo ao LioConecta. O portal que conecta toda a Lio Técnica em um só lugar.",
};

export const NARRATION_OUTRO = {
  id: "outro",
  text: "LioConecta. Conectando pessoas, processos e conhecimento. Acesse agora com suas credenciais corporativas.",
};
