# Cellule

Le plein du système : le territoire d'une graine. À l'échelle nano, une cellule seule devient une forme de composant (bouton, badge, masque).

Obtenir la forme avec `Banbiom.cellPath(seed, largeur, hauteur, { radius, inset })` et l'appliquer en `<path>` SVG ou en `clip-path: path(...)`. La même graine donne toujours la même forme : nommer la graine d'après ce que la cellule représente.

- Faune : `radius-faune`, aplat `cobalt`.
- Flore : `radius-galet`, aplat `lagoon`.
- Marque : `radius-branche`, aplat `abyss`.
- Les coins arrondis sont de vrais arcs (cellule rétrécie puis regonflée) : jamais de pointe.
