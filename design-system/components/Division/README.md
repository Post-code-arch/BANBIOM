# Division

Un cadre se divise en un nombre choisi de cellules. Le nombre de cellules est l'échelle de division :

| Cellules | Coupe | Usage |
|---|---|---|
| **2** | une coupe **droite**, inclinée de 12° | tuile à deux zones : titre et action, image et texte, « Explorer / → » |
| **3** | deux coupes **droites et parallèles** | tuile à trois temps ; la cellule centrale peut dominer |
| **6** | voronoï | carte de section, une cellule dominante pour le titre |
| **12** | voronoï | bande, en-tête de page |
| **24 et plus** | voronoï | fond, texture (voir Échelles) |

Règles :

- En 2 et 3 cellules, les séparations sont des lignes droites qui traversent tout le cadre. Les proportions se règlent avec `sizes` (par exemple `[2, 1]`).
- À partir de 6 cellules, on réserve une **cellule dominante** (`focus`) : plus grande que les autres, elle crée l'espace typographique. Les autres cellules restent plus petites autour d'elle.
- Les coins extérieurs suivent le cadre ; les coins intérieurs sont arrondis avec un rayon adapté à chaque cellule (au plus 35 % de son rayon intérieur), jamais en cercle.
- Veine `vein-medium` (10) en 2 et 3 cellules, `vein-fine` à partir de 6.

`Banbiom.division(svg, { n, sizes, angle, focus: {x, y, size}, gap, radius, colors, focusColor })` dessine les cellules et renvoie, pour chacune, la zone de texte disponible (`text: {x, y, w, h}`).
