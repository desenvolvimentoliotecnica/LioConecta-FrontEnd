import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  AUDIO_DIR,
  CLIPS_DIR,
  FPS,
  FRAMES_DIR,
  INTRO_DIR,
  INTRO_SECONDS,
  MODULE_PADDING,
  MODULES,
  NARRATION_HOOK,
  NARRATION_OUTRO,
  OUTPUT_MP4,
  OUTRO_SECONDS,
  ROOT,
  WORK_DIR,
} from "./config.mjs";
import { captureScreenshots } from "./capture-screenshots.mjs";
import { escapeDrawtext, probeDuration, runFfmpeg } from "./ffmpeg-utils.mjs";
import { generateCorporateMusic } from "./generate-music.mjs";
import { renderHtmlSegment } from "./render-html-segment.mjs";

function ensureCleanDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function zoomExpr(kind) {
  if (kind === "left") {
    return "z='min(1.12,1+0.00045*on)':x='(iw-iw/zoom)*on/({frames}-1)':y='(ih-ih/zoom)/2'";
  }
  if (kind === "right") {
    return "z='min(1.12,1+0.00045*on)':x='(iw-iw/zoom)*(1-on/({frames}-1))':y='(ih-ih/zoom)/2'";
  }
  return "z='min(1.14,1+0.00055*on)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2'";
}

function buildModuleClip(mod, screenshotPath, durationSec, outputClip) {
  const frames = Math.max(2, Math.round(durationSec * FPS));
  const zoom = zoomExpr(mod.zoom).replaceAll("{frames}", String(frames));

  const title = escapeDrawtext(mod.title);
  const tag = escapeDrawtext(mod.tag);

  const filter = [
    `scale=${1920 * 1.08}:${1080 * 1.08}:force_original_aspect_ratio=increase`,
    `crop=${1920}:${1080}`,
    `zoompan=${zoom}:d=${frames}:s=1920x1080:fps=${FPS}`,
    `fade=t=in:st=0:d=0.35`,
    `fade=t=out:st=${(durationSec - 0.4).toFixed(2)}:d=0.4`,
    `drawbox=x=0:y=ih-170:w=iw:h=170:color=0x001a45@0.72:t=fill`,
    `drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='${title}':fontsize=54:fontcolor=white:x=80:y=h-130`,
    `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${tag}':fontsize=28:fontcolor=0xB8D4FF:x=80:y=h-72`,
  ].join(",");

  runFfmpeg(
    [
      "-y",
      "-loop",
      "1",
      "-i",
      screenshotPath,
      "-vf",
      filter,
      "-t",
      String(durationSec),
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "17",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputClip,
    ],
    `clip ${mod.id}`,
  );
}

function generateNarration(segments) {
  const manifestIn = join(WORK_DIR, "narration-input.json");
  writeFileSync(manifestIn, JSON.stringify(segments, null, 2), "utf8");

  const py = spawnSync("python", [join(ROOT, "tools", "intro-video", "generate-narration.py"), manifestIn], {
    encoding: "utf8",
    stdio: "pipe",
  });
  if (py.status !== 0) {
    console.error(py.stderr);
    throw new Error("Falha ao gerar narração");
  }

  const manifest = JSON.parse(readFileSync(join(WORK_DIR, "narration-manifest.json"), "utf8"));
  return manifest.segments.map((seg) => ({
    ...seg,
    duration: probeDuration(seg.file),
  }));
}

function buildNarrationTrack(timeline, outputPath) {
  const parts = [];
  const filterParts = [];
  let inputIndex = 0;

  for (const item of timeline) {
    parts.push("-i", item.file);
    const delayMs = Math.round(item.start * 1000);
    filterParts.push(`[${inputIndex}]adelay=${delayMs}|${delayMs},volume=1.0[n${inputIndex}]`);
    inputIndex++;
  }

  const labels = timeline.map((_, i) => `[n${i}]`).join("");
  const filter = `${filterParts.join(";")};${labels}amix=inputs=${timeline.length}:duration=longest:normalize=0[out]`;

  runFfmpeg(
    ["-y", ...parts, "-filter_complex", filter, "-map", "[out]", "-ar", "44100", "-ac", "2", outputPath],
    "mix narration",
  );
}

function concatVideoWithXfade(clips, outputPath) {
  if (clips.length === 1) {
    copyFileSync(clips[0], outputPath);
    return;
  }

  const xfadeDuration = 0.45;
  const durations = clips.map((clip) => probeDuration(clip));
  const inputs = clips.flatMap((clip) => ["-i", clip]);

  let filter = "";
  let last = "[0:v]";
  let accumulated = durations[0];

  for (let i = 1; i < clips.length; i++) {
    const next = `[${i}:v]`;
    const out = i === clips.length - 1 ? "[vout]" : `[v${i}]`;
    const offset = accumulated - xfadeDuration;
    filter += `${last}${next}xfade=transition=fade:duration=${xfadeDuration}:offset=${offset.toFixed(3)}${out};`;
    last = out;
    accumulated = accumulated + durations[i] - xfadeDuration;
  }

  filter = filter.replace(/;$/, "");

  runFfmpeg(
    [
      "-y",
      ...inputs,
      "-filter_complex",
      filter,
      "-map",
      "[vout]",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "17",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    "concat video",
  );
}

function muxFinal(videoPath, narrationPath, musicPath, outputPath) {
  runFfmpeg(
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      narrationPath,
      "-i",
      musicPath,
      "-filter_complex",
      "[1]volume=1.0[voice];[2]volume=0.16[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]",
      "-map",
      "0:v",
      "-map",
      "[aout]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    "mux final",
  );
}

export async function composeIntroVideo() {
  console.log("=== LioConecta Intro Pro ===\n");
  ensureCleanDir(WORK_DIR);
  mkdirSync(join(ROOT, "public", "videos"), { recursive: true });
  mkdirSync(AUDIO_DIR, { recursive: true });
  mkdirSync(CLIPS_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  console.log("1/6 Capturando screenshots dos módulos...");
  await captureScreenshots();

  console.log("2/6 Gerando narração...");
  const narrationSegments = [
    { id: NARRATION_HOOK.id, text: NARRATION_HOOK.text },
    ...MODULES.map((m) => ({ id: m.id, text: m.narration })),
    { id: NARRATION_OUTRO.id, text: NARRATION_OUTRO.text },
  ];
  const voiced = generateNarration(narrationSegments);
  const voicedMap = Object.fromEntries(voiced.map((v) => [v.id, v]));

  const hookDuration = voicedMap[NARRATION_HOOK.id].duration;
  const outroVoiceDuration = voicedMap[NARRATION_OUTRO.id].duration;

  const moduleDurations = MODULES.map((mod) => {
    const voice = voicedMap[mod.id].duration;
    return Math.max(3.8, voice + MODULE_PADDING);
  });

  const totalVideoDuration =
    INTRO_SECONDS + moduleDurations.reduce((a, b) => a + b, 0) + OUTRO_SECONDS;

  console.log(`   Duração estimada: ${totalVideoDuration.toFixed(1)}s`);

  console.log("3/6 Gerando trilha corporativa...");
  const musicPath = join(AUDIO_DIR, "music.mp3");
  generateCorporateMusic(totalVideoDuration + 1, musicPath);

  console.log("4/6 Renderizando intro e outro (30 fps frame-by-frame)...");
  const introClip = join(CLIPS_DIR, "00-intro.mp4");
  const outroClip = join(CLIPS_DIR, "99-outro.mp4");

  await renderHtmlSegment({
    htmlName: "intro-pro.html",
    seekFn: "seekIntro",
    durationSec: INTRO_SECONDS,
    outputClip: introClip,
    framesDir: join(FRAMES_DIR, "intro"),
  });

  console.log("5/6 Montando clipes dos módulos...");
  const moduleClips = [];
  let cursor = INTRO_SECONDS;

  for (let i = 0; i < MODULES.length; i++) {
    const mod = MODULES[i];
    const duration = moduleDurations[i];
    const screenshot = join(INTRO_DIR, "build", "screenshots", `${mod.id}.png`);
    const clipPath = join(CLIPS_DIR, `${String(i + 1).padStart(2, "0")}-${mod.id}.mp4`);
    buildModuleClip(mod, screenshot, duration, clipPath);
    moduleClips.push({ clipPath, mod, duration, narrationStart: cursor });
    cursor += duration;
  }

  const outroNarrationStart = cursor + 0.4;
  await renderHtmlSegment({
    htmlName: "outro-pro.html",
    seekFn: "seekOutro",
    durationSec: Math.max(OUTRO_SECONDS, outroVoiceDuration + 1.2),
    outputClip: outroClip,
    framesDir: join(FRAMES_DIR, "outro"),
  });

  console.log("6/6 Compondo vídeo final com áudio...");
  const allClips = [introClip, ...moduleClips.map((c) => c.clipPath), outroClip];
  const videoOnly = join(WORK_DIR, "video-only.mp4");
  concatVideoWithXfade(allClips, videoOnly);

  const narrationTimeline = [
    { file: voicedMap[NARRATION_HOOK.id].file, start: 0.6 },
    ...moduleClips.map((clip, i) => ({
      file: voicedMap[MODULES[i].id].file,
      start: clip.narrationStart + 0.15,
    })),
    { file: voicedMap[NARRATION_OUTRO.id].file, start: outroNarrationStart },
  ];

  const narrationMix = join(AUDIO_DIR, "narration-mix.mp3");
  buildNarrationTrack(narrationTimeline, narrationMix);
  muxFinal(videoOnly, narrationMix, musicPath, OUTPUT_MP4);

  const finalDuration = probeDuration(OUTPUT_MP4);
  console.log(`\n✓ Vídeo final: ${OUTPUT_MP4}`);
  console.log(`  Duração: ${finalDuration.toFixed(1)}s · ${FPS} fps · narração + trilha`);

  return OUTPUT_MP4;
}

if (process.argv[1]?.endsWith("compose.mjs")) {
  composeIntroVideo().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
