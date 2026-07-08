#!/usr/bin/env python3
"""Gera narração em PT-BR com voz neural Microsoft (edge-tts)."""
import asyncio
import json
import sys
from pathlib import Path

import edge_tts

VOICE = "pt-BR-AntonioNeural"
RATE = "-4%"
PITCH = "+1Hz"

ROOT = Path(__file__).resolve().parents[2]
AUDIO_DIR = ROOT / "docs" / "intro-video" / "build" / "audio"
CONFIG_PATH = ROOT / "docs" / "intro-video" / "build" / "narration-manifest.json"


def load_segments():
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    # segments are passed via stdin JSON from compose script
    if len(sys.argv) > 1:
        return json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    return json.loads(sys.stdin.read())


async def synthesize_segment(segment: dict) -> dict:
    output = AUDIO_DIR / f"{segment['id']}.mp3"
    communicate = edge_tts.Communicate(
        segment["text"],
        VOICE,
        rate=RATE,
        pitch=PITCH,
    )
    await communicate.save(str(output))
    return {"id": segment["id"], "file": str(output), "text": segment["text"]}


async def main():
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    segments = load_segments()
    results = []
    for segment in segments:
        print(f"Narrando: {segment['id']}...", flush=True)
        results.append(await synthesize_segment(segment))

    manifest = {"voice": VOICE, "segments": results}
    CONFIG_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Manifesto salvo em {CONFIG_PATH}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
