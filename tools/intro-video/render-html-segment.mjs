import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { FPS, HEIGHT, INTRO_DIR, STATIC_PORT, WIDTH } from "./config.mjs";
import { runFfmpeg } from "./ffmpeg-utils.mjs";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".css": "text/css",
  ".js": "application/javascript",
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\//, "");
      const filePath = join(INTRO_DIR, rel);
      if (!filePath.startsWith(INTRO_DIR) || !existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(readFileSync(filePath));
    });
    server.listen(STATIC_PORT, "127.0.0.1", () => resolve(server));
  });
}

export async function renderHtmlSegment({ htmlName, seekFn, durationSec, outputClip, framesDir }) {
  mkdirSync(framesDir, { recursive: true });
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  await page.goto(`http://127.0.0.1:${STATIC_PORT}/${htmlName}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const totalFrames = Math.round(durationSec * FPS);
  for (let i = 0; i < totalFrames; i++) {
    const ms = (i / FPS) * 1000;
    await page.evaluate(
      ({ fn, time }) => {
        const seek = window[fn];
        if (typeof seek === "function") seek(time);
      },
      { fn: seekFn, time: ms },
    );
    const framePath = join(framesDir, `f_${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: framePath, type: "png" });
  }

  await browser.close();
  server.close();

  runFfmpeg(
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      join(framesDir, "f_%05d.png"),
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
    `render ${basename(htmlName)}`,
  );

  for (const file of readdirSync(framesDir)) {
    rmSync(join(framesDir, file), { force: true });
  }
}
