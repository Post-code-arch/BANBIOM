# BANBIOM

Système graphique de BANBIOM, la banque de données des écosystèmes marins. Tout part d'une seule figure, le diagramme de Voronoï : chaque espèce occupe sa cellule. Le même diagramme sert de texture, de mise en page, d'identité d'espèce et de forme de composant, selon l'échelle à laquelle on le regarde.

Trois principes tiennent l'ensemble :

1. **Des aplats.** Couleurs pleines, sans dégradé ni ombre. Le relief (galets éclairés) est une exception rare, réservée à un seul moment par page.
2. **Le plein et le vide ont le même poids.** La cellule et l'espace entre les cellules sont tous deux des éléments du système. On choisit à chaque usage lequel des deux porte la forme.
3. **La géométrie dit quelque chose.** Une cellule est une espèce, une veine est une relation, une graine est une donnée. On n'emploie pas le motif comme simple décor quand il peut porter une information.

## Les quatre éléments

| Élément | Ce que c'est | Ce qu'il représente | Où on le voit |
|---|---|---|---|
| **Cellule** (le plein) | Le territoire le plus proche d'une graine | Une espèce, une fiche, une section, un conteneur | Cartes, tuiles, boutons, badges |
| **Veine** (le vide) | L'espace entre deux cellules | Une relation, une séparation, une gouttière | Fonds, séparateurs, réseau du hero, style branche |
| **Graine** (le noyau) | Le point qui engendre la cellule | La donnée elle-même : sa position vaut une valeur | Puces, marqueurs, curseur, signatures d'espèce |
| **Jonction** | Le point où trois veines se rencontrent | Une connexion | Icône du site, points de focus, notifications |

## Les quatre échelles

L'échelle se règle par la **densité** (nombre de cellules visibles), pas par la taille en pixels. Le même champ, vu de plus près, change de rôle.

| Échelle | Densité | Rôle | Veine | Mouvement |
|---|---|---|---|---|
| **Macro** · la page | `density-macro` 40 à 120 | Matière, milieu, fond | `vein-hair` | Dérive lente, respiration des veines |
| **Méso** · la tuile | `density-meso` 8 à 20 | Formes lisibles une à une ; une cellule peut porter un titre | `vein-hair` à `vein-branch` | Réaction au curseur : les cellules s'écartent, puis reviennent avec un léger rebond |
| **Micro** · la carte | `density-micro` 3 à 12 | Signature d'une espèce, calculée à partir de ses données | selon le règne | Au survol, écart puis retour |
| **Nano** · le composant | `density-nano` 1 à 3 | Une cellule = un bouton, un badge, un masque d'image | `vein-fine` entre deux cellules accolées | La cellule se tasse à l'appui |

Les échelles s'emboîtent. Une cellule macro (un habitat) contient des cellules méso (ses espèces), qui contiennent leur signature micro. La navigation idéale est un zoom continu dans ce champ.

## Les divisions

Un cadre (tuile, carte, bande) se divise en un nombre choisi de cellules. C'est une seconde échelle, qui s'ajoute à la densité :

| Cellules | Séparations | Usage |
|---|---|---|
| **2** | une coupe droite, inclinée (12° par défaut) | titre et action, image et texte |
| **3** | deux coupes droites parallèles | trois temps, la cellule centrale domine |
| **6** | voronoï, une cellule dominante | carte de section |
| **12** | voronoï, une cellule dominante | bande, en-tête |
| **24 et plus** | voronoï | fond, texture |

En 2 et 3 cellules, les séparations sont **toujours droites** et traversent tout le cadre ; les proportions se règlent (`2:1`, `1:2:1`). À partir de 6, une **cellule dominante** plus grande que les autres crée l'espace typographique : le titre s'y pose, dans le plus grand rectangle inscrit, et les petites cellules autour font le motif. Une seule cellule dominante par cadre.

## Les arrondis

Chaque cellule arrondie est réduite d'un rayon puis regonflée du même rayon : ses bords ne bougent pas et ses coins sont de vrais arcs. Le rayon s'adapte à la cellule : au plus le token demandé, et au plus 35 % de son rayon intérieur. Une petite cellule garde donc des côtés droits ; elle ne disparaît pas et ne devient jamais un cercle.

## Les règnes

La Faune et la Flore ont deux traitements distincts du même diagramme. On doit pouvoir reconnaître le règne au premier coup d'œil, sans lire.

| | **Faune** | **Flore** | **Marque** |
|---|---|---|---|
| Rayon des cellules | `radius-faune` (0), angles vifs | `radius-galet` (26), galets | `radius-branche` (40) |
| Veine | `vein-hair`, couleur `mist` | `vein-medium`, couleur `ground` | `vein-branch`, couleur `lagoon` |
| Aplats des cellules | `cobalt`, `cobalt-2` | `lagoon`, `deep`, `foam`, `abyss`, `mist` | `abyss` |
| Accent texte | `fa` | `fl` | `ink` |
| Étiquette | parallélogramme incliné (−14°), `radius-xs` | pilule, `radius-pill` | pilule contour |
| Ce qu'on regarde | le **plein** : les cellules, découpées par un trait | le **plein** : les galets, posés sur un fond | le **vide** : le réseau des veines |

Le **réseau** (hero, fonds macro) est la version neutre : cellules `abyss` à `radius-s`, veines `hero-vein` en `vein-hair`.

## Couleur

Uniquement des aplats. `abyss`, `cobalt` et `lagoon` sont les trois couleurs d'identité : ce sont elles qui prennent les grandes surfaces (hero, bandes, tuiles). `paper` et `surface` portent la lecture. Les couleurs UICN (`iucn-*`) ne servent qu'au statut de conservation, en petit.

Dans un champ de cellules, une couleur domine (au moins 70 % des cellules), une seconde la nuance, une troisième au plus sert d'accent ponctuel (cellule survolée, cellule mise en avant).

Texte sur aplat : `on-dark` sur `abyss` et `cobalt`, `on-light` sur `lagoon`, `foam` et `ground`.

## Typographie

- **Outfit** pour tout le texte : graisse 200 pour les titres, grands, légers et serrés (`display-xl`, `display-l`), graisse 300 pour les titres de section et les noms d'espèce, 400 pour le texte courant (`body`, `lede`).
- **IBM Plex Mono** pour les libellés en capitales (`label`) et les valeurs mesurées (`data`), en chiffres tabulaires.
- Les noms scientifiques sont **toujours en italique** (`species`, `card-title`), comme l'exige la nomenclature.

Le texte se pose soit **dans une cellule** (une cellule méso géante porte un titre), soit **sur un aplat** à côté du champ. À l'échelle macro, des libellés peuvent courir le long des veines, comme des routes sur une carte. On ne pose jamais de texte courant sur un champ dense de cellules.

## Les données dans la géométrie

| Donnée | Encodage |
|---|---|
| Règne | forme des cellules (angle vif / galet) et couleur |
| Plage de température | position horizontale des graines dans la signature |
| Plage de profondeur | position verticale des graines dans la signature |
| Taille maximale | nombre de cellules dans la signature |
| Statut UICN | couleur de la graine ou du badge (`iucn-*`) |
| Parenté entre deux espèces | épaisseur de la veine qui les sépare : même famille `vein-hair`, autre embranchement `vein-river` |

Une même espèce garde toujours la même signature : les graines sont tirées de façon déterministe à partir de son nom.

## Mouvement

Les principes de l'animation s'appliquent à chaque échelle :

- **Anticipation** : une carte se tasse (échelle 0,955) à l'appui avant d'ouvrir la fiche ; la fiche recule de 14 px avant de se fermer.
- **Élan et dépassement** : les cartes qui changent de place glissent puis dépassent légèrement leur position (`cubic-bezier(.34,1.56,.64,1)`).
- **Retour amorti** : les graines sont tenues par des ressorts fortement amortis ; repoussées par le curseur, elles reviennent sans à-coup. La dérive reste faible pour que les graines ne se croisent jamais (pas de cellule qui saute).
- **Cascade** : titres mot par mot, cartes l'une après l'autre (55 ms d'écart).
- **Le vide s'ouvre** : sous le curseur, les veines s'élargissent progressivement (lissage, pas de saut) et les cellules se contractent.
- Une cellule dominante est fixe : elle ne bouge pas, pour que le texte qu'elle porte reste lisible.

Tout mouvement s'arrête si l'utilisateur a demandé moins d'animation (`prefers-reduced-motion`).

## Accueil : la carte des espèces (prototype)

Deux rendus sont à l'essai, au choix par le sélecteur du hero (ou `?hero=verre` / `?hero=veines`) :

- **Verre** : peu de grandes cellules (une trentaine), en verre dépoli (shader WebGL) qui réfracte un fond en dégradé lent (cobalt, lagon, écume sur abysse). Faune teintée cobalt à angles vifs, Flore teintée lagon en galets. Seconde exception aux aplats, après le fond abyssal.
- **Veines** : seulement les lignes du diagramme, 1 px écume à 22 %, sur un aplat abysse. Une graine (point) marque chaque espèce ; la cellule survolée se remplit en aplat de son règne.

Dans les deux cas : plus de grain ni de vignettage, pas de numéros sur les cellules de remplissage, et les cellules d'espèce portent leur numéro et leur nom scientifique abrégé (italique, 15 px). Sous le titre, le verre s'aplatit et les veines s'effacent pour garder le texte lisible.

## À faire, à éviter

- Faire : un seul style de cellule par zone ; le règne lisible sans légende ; des valeurs mesurées en `data`.
- Faire : choisir l'échelle par la densité, et garder le même champ quand on zoome.
- Éviter : les dégradés, les ombres portées, les reflets (sauf le moment unique de relief).
- Éviter : mélanger angles vifs et galets dans une même cellule ou un même champ, sauf pour montrer la frontière entre règnes.
- Éviter : des coins pointus sur les galets. Les cellules arrondies sont rétrécies puis regonflées d'un rayon constant : leurs coins sont toujours de vrais arcs de cercle.

## Moteur

`components/bundle.js` expose `window.Banbiom` :

- `Banbiom.field(canvas, { kind, seed, density | cells, gap, radius, live, interactive })` dessine un champ. `kind` vaut `faune`, `flore`, `branche`, `reseau` ou `trait`. `live` fait dériver les graines, `interactive` les fait réagir au curseur. 
- `Banbiom.division(svg, { n, sizes, angle, focus: {x, y, size}, gap, radius, colors, focusColor })` divise un cadre en 2, 3 (coupes droites) ou n cellules (voronoï avec cellule dominante) et renvoie la zone de texte de chaque cellule.
- `Banbiom.field(canvas, { …, focus: {x, y, size}, focusColor })` réserve aussi une cellule dominante fixe dans un champ animé.
- `Banbiom.cellPath(seed, w, h, { radius, sides, inset })` renvoie le tracé SVG d'une cellule seule, pour les formes nano (bouton, badge, masque via `clip-path: path(...)`).
- `Banbiom.seedsFromSpecies(espece)` place les graines d'une signature à partir des données de l'espèce.

Les couleurs sont lues dans les tokens du thème courant ; le dessin se met à jour quand le thème change.
