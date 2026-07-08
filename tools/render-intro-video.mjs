/**
 * Renderiza o vídeo de introdução PRO do LioConecta.
 * Pipeline: screenshots reais + animação 30fps + narração + trilha corporativa.
 *
 * Uso: npm run render:intro-video
 */
import { composeIntroVideo } from "./intro-video/compose.mjs";

composeIntroVideo().catch((err) => {
  console.error(err);
  process.exit(1);
});
