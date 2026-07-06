#!/usr/bin/env python3
"""Generate weekend development report from git commits (FE + BE)."""

import subprocess
from datetime import datetime, timedelta
from pathlib import Path

REPOS = [
    ("Frontend", Path(r"C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd")),
    ("Backend", Path(r"C:\Users\leonardo.mendes\Projects\LioConecta.Backend")),
]

OUTPUT = Path(r"C:\Users\leonardo.mendes\Projects\LioConecta-FrontEnd\docs\relatorio-desenvolvimento-04-05-jul-2026.html")

SINCE = "2026-07-04 00:00:00"
UNTIL = "2026-07-06 00:00:00"

# Períodos de descanso excluídos do cálculo de duração (início inclusivo, fim exclusivo)
BREAK_PERIODS: list[tuple[datetime, datetime, str]] = [
    (
        datetime(2026, 7, 5, 0, 40, 26),
        datetime(2026, 7, 5, 7, 50, 0),
        "Descanso noturno (05/07)",
    ),
]


def overlap_seconds(start: datetime, end: datetime, brk_start: datetime, brk_end: datetime) -> float:
    """Seconds of [start, end) overlapping [brk_start, brk_end)."""
    o_start = max(start, brk_start)
    o_end = min(end, brk_end)
    if o_end <= o_start:
        return 0.0
    return (o_end - o_start).total_seconds()


def adjusted_duration(start: datetime, end: datetime) -> tuple[float, list[str]]:
    """Raw duration minus configured break overlaps."""
    raw = (end - start).total_seconds()
    if raw <= 0:
        return 30.0, []

    notes: list[str] = []
    deducted = 0.0
    for brk_start, brk_end, label in BREAK_PERIODS:
        overlap = overlap_seconds(start, end, brk_start, brk_end)
        if overlap > 0:
            deducted += overlap
            notes.append(label)

    adjusted = max(raw - deducted, 30.0)
    return adjusted, notes


def fetch_commits(repo_path: Path) -> list[dict]:
    out = subprocess.run(
        [
            "git",
            "log",
            f"--since={SINCE}",
            f"--until={UNTIL}",
            "--format=%H|%ai|%s|%b",
            "--reverse",
        ],
        cwd=repo_path,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=True,
    )
    commits = []
    for line in out.stdout.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split("|", 3)
        if len(parts) < 3:
            continue
        h, dt_str, subject = parts[0], parts[1], parts[2]
        body = parts[3].strip().replace("\n", " ") if len(parts) > 3 else ""
        dt = datetime.strptime(dt_str[:19], "%Y-%m-%d %H:%M:%S")
        commits.append(
            {
                "hash": h[:8],
                "dt": dt,
                "subject": subject,
                "body": body,
                "is_merge": subject.startswith("Merge pull request"),
            }
        )
    return commits


def pt_desc(subject: str, body: str, repo: str, is_merge: bool) -> str:
    """Brief Portuguese description for leadership report."""
    if is_merge:
        detail = subject
        if "Merge pull request" in subject:
            parts = subject.split(" from ", 1)
            detail = parts[0].replace("Merge pull request #", "PR #")
            if len(parts) > 1:
                detail += f" ({parts[1]})"
        return f"[{repo}] Integração: {detail}"

    text = body if body else ""
    if "Co-authored-by:" in text:
        text = text.split("Co-authored-by:")[0].strip()
    if not text:
        text = subject
    if len(text) > 220:
        text = text[:217].rsplit(" ", 1)[0] + "..."
    return f"[{repo}] {text}"


def fmt_duration(seconds: float) -> str:
    if seconds < 60:
        return f"{int(seconds)}s"
    minutes = int(seconds // 60)
    if minutes < 60:
        secs = int(seconds % 60)
        return f"{minutes}min {secs}s" if secs else f"{minutes}min"
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours}h {mins:02d}min"


def fmt_time(dt: datetime) -> str:
    return dt.strftime("%H:%M:%S")


def fmt_date(dt: datetime) -> str:
    days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    return f"{days[dt.weekday()]}, {dt.strftime('%d/%m/%Y')}"


def main() -> None:
    all_commits: list[dict] = []
    for repo_label, repo_path in REPOS:
        for c in fetch_commits(repo_path):
            c["repo"] = repo_label
            all_commits.append(c)

    all_commits.sort(key=lambda c: c["dt"])

    tasks = []
    for i, c in enumerate(all_commits):
        start = c["dt"]
        if i + 1 < len(all_commits):
            end = all_commits[i + 1]["dt"]
        else:
            # Last commit: assume 15 min wrap-up or use a reasonable end
            end = start + timedelta(minutes=15)

        duration_sec, break_notes = adjusted_duration(start, end)

        tasks.append(
            {
                "num": i + 1,
                "desc": pt_desc(c["subject"], c["body"], c["repo"], c["is_merge"]),
                "date": fmt_date(start),
                "start": fmt_time(start),
                "end": fmt_time(end),
                "duration": fmt_duration(duration_sec),
                "duration_sec": duration_sec,
                "break_notes": break_notes,
                "repo": c["repo"],
                "hash": c["hash"],
                "subject": c["subject"],
                "is_merge": c["is_merge"],
            }
        )

    total_sec = sum(t["duration_sec"] for t in tasks)
    fe_count = sum(1 for c in all_commits if c["repo"] == "Frontend")
    be_count = sum(1 for c in all_commits if c["repo"] == "Backend")
    work_count = sum(1 for t in tasks if not t["is_merge"])

    # Executive summary by day
    day_summary = {}
    for t in tasks:
        if t["is_merge"]:
            continue
        day_key = t["date"].split(", ")[-1]
        day_summary.setdefault(day_key, {"count": 0, "hours": 0})
        day_summary[day_key]["count"] += 1
        day_summary[day_key]["hours"] += t["duration_sec"] / 3600

    milestones = [
        ("04/07 — Manhã/Tarde", "Wireframes HTML completos: feed, comunicados, pessoas, grupos, documentos, serviços RH e migração inicial para React/Vite"),
        ("04/07 — Noite", "Páginas Facilities, Jurídico, feed composer, leitor de comunicados, integração inicial com API"),
        ("05/07 — Madrugada", "Backend .NET 8 + PostgreSQL; integração FE/BE: feed, mood, likes, comentários, comunicados, grupos, notificações SignalR, analytics"),
        ("05/07 — Manhã", "Upload de imagens, contracheque, benefícios, férias, enquetes no feed"),
        ("05/07 — Tarde", "Observabilidade, trilha de auditoria, ponto eletrônico TOTVS RM, mídia no feed, edição de perfil, e-mail SMTP admin"),
        ("05/07 — Noite", "Modal de composição de e-mail, sync Graph/Entra ID, melhorias no diretório de pessoas"),
    ]

    milestone_html = "\n".join(
        f'      <li><strong>{title}:</strong> {desc}</li>' for title, desc in milestones
    )

    day_stats_html = "\n".join(
        f'      <div class="day-stat"><span class="day-label">{day}</span>'
        f'<span class="day-val">{info["count"]} entregas · {info["hours"]:.1f}h estimadas</span></div>'
        for day, info in sorted(day_summary.items())
    )

    rows_html = []
    for t in tasks:
        merge_cls = " merge" if t["is_merge"] else ""
        repo_cls = t["repo"].lower()
        dur_cell = t["duration"]
        if t["break_notes"]:
            note = t["break_notes"][0]
            dur_cell = f'{t["duration"]}<br><small class="break-note" title="{note}">* descanso excluído</small>'
        rows_html.append(
            f"""    <tr class="{repo_cls}{merge_cls}">
      <td class="num">{t['num']}</td>
      <td class="repo"><span class="badge {repo_cls}">{t['repo']}</span></td>
      <td class="desc">{t['desc']}</td>
      <td class="date">{t['date']}</td>
      <td class="time">{t['start']}</td>
      <td class="time">{t['end']}</td>
      <td class="dur">{dur_cell}</td>
    </tr>"""
        )

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Desenvolvimento — LioConecta (04–05/Jul/2026)</title>
  <style>
    :root {{
      --bg: #f4f6f9;
      --card: #ffffff;
      --text: #1a2332;
      --muted: #5c6b7a;
      --border: #dde3ea;
      --fe: #2563eb;
      --be: #059669;
      --merge: #94a3b8;
      --accent: #e85d04;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1.5rem;
    }}
    .container {{ max-width: 1200px; margin: 0 auto; }}
    header {{
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      color: #fff;
      border-radius: 12px;
      padding: 2rem 2.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(30,58,95,.25);
    }}
    header h1 {{ font-size: 1.75rem; font-weight: 700; margin-bottom: .35rem; }}
    header p {{ opacity: .9; font-size: .95rem; }}
    .summary {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }}
    .stat {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.1rem 1.25rem;
    }}
    .stat .label {{ font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }}
    .stat .value {{ font-size: 1.5rem; font-weight: 700; margin-top: .2rem; }}
    .stat .value small {{ font-size: .85rem; font-weight: 400; color: var(--muted); }}
    .note {{
      background: #fff8f0;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      padding: .85rem 1.1rem;
      font-size: .88rem;
      color: #9a3412;
      margin-bottom: 1.5rem;
    }}
    .table-wrap {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }}
    table {{ width: 100%; border-collapse: collapse; font-size: .88rem; }}
    thead {{ background: #f0f4f8; }}
    th {{
      text-align: left;
      padding: .85rem 1rem;
      font-weight: 600;
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .03em;
      color: var(--muted);
      border-bottom: 2px solid var(--border);
    }}
    td {{ padding: .75rem 1rem; border-bottom: 1px solid var(--border); vertical-align: top; }}
    tr:last-child td {{ border-bottom: none; }}
    tr:hover {{ background: #f8fafc; }}
    tr.merge {{ opacity: .72; }}
    tr.merge td.desc {{ font-style: italic; }}
    .num {{ width: 40px; text-align: center; color: var(--muted); font-weight: 600; }}
    .repo {{ width: 90px; }}
    .date {{ white-space: nowrap; width: 130px; }}
    .time {{ white-space: nowrap; width: 80px; font-family: 'Consolas', monospace; font-size: .82rem; }}
    .dur {{ white-space: nowrap; width: 90px; font-weight: 600; color: var(--accent); }}
    .desc {{ min-width: 280px; }}
    .badge {{
      display: inline-block;
      padding: .15rem .5rem;
      border-radius: 4px;
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .03em;
    }}
    .badge.frontend {{ background: #dbeafe; color: var(--fe); }}
    .badge.backend {{ background: #d1fae5; color: var(--be); }}
    footer {{
      margin-top: 1.5rem;
      text-align: center;
      font-size: .8rem;
      color: var(--muted);
    }}
    .executive {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem 1.75rem;
      margin-bottom: 1.5rem;
    }}
    .executive h2 {{ font-size: 1.1rem; margin-bottom: .75rem; }}
    .executive ul {{ padding-left: 1.25rem; }}
    .executive li {{ margin-bottom: .45rem; font-size: .9rem; }}
    .day-stats {{ display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1rem; }}
    .day-stat {{
      background: #f0f4f8;
      border-radius: 8px;
      padding: .6rem 1rem;
      font-size: .85rem;
    }}
    .day-label {{ font-weight: 700; margin-right: .5rem; }}
    .day-val {{ color: var(--muted); }}
    .break-note {{ font-weight: 400; color: var(--muted); font-size: .7rem; }}
    @media print {{
      body {{ padding: 0; background: #fff; }}
      header {{ border-radius: 0; }}
      .table-wrap {{ box-shadow: none; }}
      tr:hover {{ background: transparent; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Relatório de Desenvolvimento — LioConecta</h1>
      <p>Fim de semana: 04 e 05 de julho de 2026 &nbsp;|&nbsp; Leonardo Mendes &nbsp;|&nbsp; Frontend + Backend</p>
    </header>

    <div class="summary">
      <div class="stat">
        <div class="label">Período trabalhado</div>
        <div class="value">{fmt_time(all_commits[0]['dt'])} <small>→</small> {fmt_time(all_commits[-1]['dt'])}</div>
      </div>
      <div class="stat">
        <div class="label">Tempo estimado total</div>
        <div class="value">{fmt_duration(total_sec)}</div>
      </div>
      <div class="stat">
        <div class="label">Commits</div>
        <div class="value">{len(all_commits)} <small>({fe_count} FE + {be_count} BE)</small></div>
      </div>
      <div class="stat">
        <div class="label">Entregas de código</div>
        <div class="value">{work_count} <small>tarefas</small></div>
      </div>
    </div>

    <div class="executive">
      <h2>Resumo executivo para gestão</h2>
      <ul>
{milestone_html}
      </ul>
      <div class="day-stats">
{day_stats_html}
      </div>
    </div>

    <div class="note">
      <strong>Metodologia:</strong> cada linha representa uma entrega (commit). A duração é o intervalo até o próximo commit, descontando períodos de descanso configurados (05/07: 00:40:26 → 07:50:00). Commits de merge aparecem em itálico. A última tarefa assume 15 min de encerramento.
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Repo</th>
            <th>Descrição da tarefa</th>
            <th>Data</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Duração</th>
          </tr>
        </thead>
        <tbody>
{chr(10).join(rows_html)}
        </tbody>
      </table>
    </div>

    <footer>
      Gerado automaticamente a partir do histórico Git em {datetime.now().strftime('%d/%m/%Y %H:%M')} &nbsp;·&nbsp; LioConecta FrontEnd &amp; Backend
    </footer>
  </div>
</body>
</html>
"""

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Report written to: {OUTPUT}")
    print(f"Commits: {len(all_commits)} | Tasks: {len(tasks)} | Total time: {fmt_duration(total_sec)}")


if __name__ == "__main__":
    main()
