import { spawnSync } from "node:child_process";

export function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    "ffmpeg",
    "D:\\Leonardo\\Labs\\MediaLibrary\\tools\\ffmpeg\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe",
  ].filter(Boolean);

  for (const cmd of candidates) {
    const probe = spawnSync(cmd, ["-version"], { encoding: "utf8" });
    if (probe.status === 0) return cmd;
  }
  throw new Error("ffmpeg não encontrado.");
}

export function findFfprobe() {
  const ffmpeg = findFfmpeg();
  const ffprobe = ffmpeg.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
  const probe = spawnSync(ffprobe, ["-version"], { encoding: "utf8" });
  if (probe.status === 0) return ffprobe;
  throw new Error("ffprobe não encontrado.");
}

export function runFfmpeg(args, label = "ffmpeg") {
  const ffmpeg = findFfmpeg();
  const result = spawnSync(ffmpeg, args, { encoding: "utf8", stdio: "pipe", maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) {
    console.error(result.stderr);
    throw new Error(`Falha em ${label}`);
  }
  return result;
}

export function probeDuration(filePath) {
  const ffprobe = findFfprobe();
  const result = spawnSync(
    ffprobe,
    ["-v", "quiet", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(`ffprobe falhou: ${filePath}`);
  return Number.parseFloat(result.stdout.trim());
}

export function escapeDrawtext(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%");
}
