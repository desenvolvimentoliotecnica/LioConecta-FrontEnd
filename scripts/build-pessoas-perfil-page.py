from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "pessoas-perfil.html"
text = path.read_text(encoding="utf-8")

text = text.replace(
    "<title>LioConecta — Organograma</title>",
    '<title>LioConecta — Perfil</title>',
)
text = text.replace(
    '  <link rel="stylesheet" href="https://cdn.balkan.app/orgchart-community.css" />\n',
    "",
)
text = text.replace(
    '              <a href="pessoas-organograma.html" role="menuitem" class="is-active">Organograma</a>',
    '              <a href="pessoas-organograma.html" role="menuitem">Organograma</a>',
)

start = text.index("    /* PAGE: PESSOAS — ORGANOGRAMA */")
end = text.index("    /* QUICK ACCESS */")
profile_css = Path(__file__).with_name("pessoas-perfil.css.snippet").read_text(encoding="utf-8")
text = text[:start] + profile_css + text[end:]

main_start = text.index("        <header class=\"page-header\">")
main_end = text.index("      </main>", main_start)
profile_html = Path(__file__).with_name("pessoas-perfil.main.snippet").read_text(encoding="utf-8")
text = text[:main_start] + profile_html + text[main_end:]

modal_start = text.index('  <div class="org-profile-modal"')
modal_end = text.index("  <script>", modal_start)
text = text[:modal_start] + text[modal_end:]

script_start = text.index('  <script src="https://cdn.balkan.app/orgchart-community.js"></script>')
script_end = text.index("</body>", script_start)
profile_js = Path(__file__).with_name("pessoas-perfil.script.snippet").read_text(encoding="utf-8")
text = text[:script_start] + profile_js + text[script_end:]

path.write_text(text, encoding="utf-8")
print("Updated", path)
