"""Construit le site : insère le moteur voronoï (src/voronoi.js) dans chaque gabarit.
- src/app.template.html  -> index.html   (la console : l'application de travail sur la base)
- src/site.template.html -> vitrine.html (l'ancien site vitrine, conservé pour référence)"""
from pathlib import Path
root = Path(__file__).parent
engine = (root / "src/voronoi.js").read_text(encoding="utf-8")
head = '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
for src, out in [("src/app.template.html", "index.html"), ("src/site.template.html", "vitrine.html")]:
    tpl = (root / src).read_text(encoding="utf-8")
    (root / out).write_text(head + tpl.replace("/*BUNDLE*/", engine) + "\n</body>\n</html>\n", encoding="utf-8")
    print(out, "construit")
