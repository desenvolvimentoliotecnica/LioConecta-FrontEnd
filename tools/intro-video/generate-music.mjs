import { mkdirSync } from "node:fs";
import { AUDIO_DIR } from "./config.mjs";
import { probeDuration, runFfmpeg } from "./ffmpeg-utils.mjs";

/** Trilha corporativa suave — pads em C maior com arpejo discreto. */
export function generateCorporateMusic(durationSec, outputPath) {
  mkdirSync(AUDIO_DIR, { recursive: true });
  const d = (durationSec + 1).toFixed(2);

  runFfmpeg(
    [
      "-y",
      "-f",
      "lavfi",
      "-t",
      d,
      "-i",
      "sine=frequency=261.63:sample_rate=44100",
      "-f",
      "lavfi",
      "-t",
      d,
      "-i",
      "sine=frequency=329.63:sample_rate=44100",
      "-f",
      "lavfi",
      "-t",
      d,
      "-i",
      "sine=frequency=392.00:sample_rate=44100",
      "-f",
      "lavfi",
      "-t",
      d,
      "-i",
      "sine=frequency=523.25:sample_rate=44100",
      "-f",
      "lavfi",
      "-t",
      d,
      "-i",
      "anoisesrc=color=pink:amplitude=0.015:sample_rate=44100",
      "-filter_complex",
      [
        "[0]volume=0.022[low]",
        "[1]volume=0.018[mid]",
        "[2]volume=0.014[high]",
        "[3]volume=0.007,asetrate=44100*1.02,aresample=44100[arp]",
        "[4]lowpass=f=700,volume=0.35[air]",
        "[low][mid][high][arp][air]amix=inputs=5:duration=longest:normalize=0",
        "lowpass=f=2600",
        "highpass=f=140",
        "acompressor=threshold=-22dB:ratio=2.5:attack=30:release=300",
        "volume=0.75",
        `afade=t=in:st=0:d=2.8`,
        `afade=t=out:st=${(durationSec - 2.5).toFixed(2)}:d=2.8`,
      ].join(","),
      "-ar",
      "44100",
      "-ac",
      "2",
      outputPath,
    ],
    "generate-music",
  );

  return probeDuration(outputPath);
}
