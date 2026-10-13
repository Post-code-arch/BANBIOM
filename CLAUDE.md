# BANBIOM — contexte pour Claude Code

Banque de données des écosystèmes marins (faune et flore) conçue par le studio POST_ (Alger). Une fiche technique par espèce, un catalogue Faune / Flore, un espace chercheurs (saisie manuelle et import CSV / TSV / JSON). Langue du site et des échanges : français.

## Structure

- `src/site.template.html` : tout le site (HTML, CSS, JS) dans un seul gabarit. **On modifie ici**, jamais directement `index.html`.
- `src/voronoi.js` : moteur voronoï partagé (`window.Banbiom`) : `field`, `division`, `cellPath`, `seedsFromSpecies`, et les aides `_cells`, `_traceSVG`, `_rounded`, `_arcs`, `_innerRect`, `_hash`, `_rng`.
- `build.py` : insère `src/voronoi.js` à la place de `/*BUNDLE*/` dans le gabarit et écrit `index.html`. Lancer `python3 build.py` après chaque modification.
- `data/especes.json` : fiches de départ (données exemple, à valider scientifiquement).
- `design-system/` : la charte (brand book `README.md`, `tokens.json`, planches `components/*/preview.html`). Toute décision visuelle doit la respecter ; la mettre à jour quand une règle change.

Aperçu local : `python3 build.py && python3 -m http.server` puis http://localhost:8000.

## Données

- Sur claude.ai, le site utilise la base partagée de l'artifact (`window.claude.use("db")`, collection `species`).
- En autonome (GitHub Pages), `connect()` ne trouve pas `window.claude` et `demoMode()` charge `data/especes.json`. Les ajouts restent locaux. Pour une vraie base, brancher `connect()` sur un service (Supabase, Firebase…).
- Champs d'une fiche : liste `FIELDS` du gabarit. Obligatoires : `nom_scientifique`, `regne` (`Animal` | `Végétal`), `habitat`. Validation dans `validate()`.

## Charte (résumé, détail dans design-system/README.md)

- **Aplats** de couleur partout. Pas de dégradés ni d'ombres dans l'interface (exception : le hero de l'accueil, cellules en verre dépoli sur un fond en dégradé, avec grain).
- **Typographie** : Outfit (titres en 200–300, texte en 400), IBM Plex Mono pour libellés et données. Noms scientifiques toujours en italique.
- **Le voronoï est le système** : cellule = espèce, veine = relation, graine = donnée, jonction = connexion.
- **Échelles par densité** : macro (40–120 cellules), méso (8–20), micro (3–12, signature d'espèce), nano (1–3, composant).
- **Divisions** : 2 et 3 cellules en coupes **droites** et parallèles ; 6 et plus en voronoï avec **une cellule dominante** qui porte le texte (espace typographique). Exception : les cartes Faune / Flore de l'accueil sont un voronoï de 3 cellules (titre, moyenne, petite case pour la flèche).
- **Arrondis adaptatifs** : rayon ≤ 35 % du rayon intérieur de la cellule ; jamais de pointe, jamais de cercle.
- **Règnes** : Faune = angles vifs, cobalt, étiquettes parallélogramme ; Flore = galets, lagon, étiquettes pilule.
- **Mouvement** : anticipation, élan, dépassement, retour amorti (ressorts). Les cellules réagissent au curseur (cartes, en-têtes, carte des espèces). Respecter `prefers-reduced-motion`.
- **Menu** : barre de verre centrée en bas, repliée au défilement vers le bas.

## Décisions déjà prises (ne pas revenir dessus sans demande)

- Pas de 3D pour l'instant (sphère et relief abandonnés) : l'accueil est une carte des espèces à plat, cellules numérotées, aperçu au survol.
- Pas de nageoire comme logo ; le logo est un disque fracturé en cellules.
- Outfit remplace Geologica.
