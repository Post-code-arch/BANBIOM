"""Construit index.html : insère le moteur voronoï (src/voronoi.js) dans le gabarit (src/site.template.html)."""
from pathlib import Path
root = Path(__file__).parent
tpl = (root / "src/site.template.html").read_text(encoding="utf-8")
engine = (root / "src/voronoi.js").read_text(encoding="utf-8")
head = '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
(root / "index.html").write_text(head + tpl.replace("/*BUNDLE*/", engine) + "\n</body>\n</html>\n", encoding="utf-8")
print("index.html construit")
