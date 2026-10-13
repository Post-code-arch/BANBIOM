# Composition

Dans une division, une cellule plus grande que les autres devient l'**espace typographique** : le titre s'y pose, les cellules plus petites autour d'elle font le motif.

- Une seule cellule dominante par cadre. Elle prend la couleur la plus profonde (`abyss`) ou la plus claire (`foam`) pour porter le texte avec un bon contraste (`on-dark` ou `on-light`).
- Le texte se place dans le plus grand rectangle inscrit dans la cellule, renvoyé par `Banbiom.division` (`text`). Il ne déborde jamais sur une veine.
- Les autres cellules ne portent pas de texte.
- En 2 cellules : la plus grande porte le titre, la petite porte une action ou une couleur seule.
- En 3 cellules : la cellule centrale domine et porte un chiffre ou un mot ; les deux autres l'encadrent.
