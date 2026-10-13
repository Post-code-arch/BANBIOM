# BANBIOM

Banque de données des écosystèmes marins : faune et flore, une fiche technique par espèce, et un espace où les chercheurs ajoutent des fiches par saisie ou par import de fichier.

Tout le site repose sur un seul motif, le diagramme de Voronoï : une cellule est une espèce, l'espace entre deux cellules est une relation, la graine qui engendre la cellule est une donnée.

## Contenu du dépôt

| Chemin | Rôle |
|---|---|
| `index.html` | Le site, en un seul fichier, prêt pour GitHub Pages. Généré par `build.py`. |
| `src/site.template.html` | Le gabarit du site (HTML, CSS, logique). À modifier ici, pas dans `index.html`. |
| `src/voronoi.js` | Le moteur voronoï partagé : champs, divisions, cellules nano, signatures d'espèce. |
| `build.py` | Insère le moteur dans le gabarit et écrit `index.html`. |
| `data/especes.json` | Les fiches de départ (10 espèces méditerranéennes, données exemple à valider). |
| `design-system/` | La charte : `README.md` (brand book), `tokens.json` (couleurs, typographie, veines, rayons, densités), planches des composants. |

## Construire et publier

```bash
python3 build.py        # régénère index.html
python3 -m http.server  # aperçu local sur http://localhost:8000
```

Pour publier : activer GitHub Pages sur la branche `main`, dossier racine.

## Données

- **Version publiée sur claude.ai** : les fiches vivent dans une base partagée ; les chercheurs ayant un accès contributeur y ajoutent des fiches, et tout le monde voit les ajouts.
- **Version autonome (ce dépôt, GitHub Pages)** : le site lit `data/especes.json`. Les ajouts faits depuis l'Espace chercheurs restent dans le navigateur et ne sont pas enregistrés. Pour une base partagée hors claude.ai, brancher `connect()` dans `src/site.template.html` sur un service (Supabase, Firebase…).

Format d'une fiche : voir `data/especes.json` et la liste `FIELDS` dans le gabarit. Champs obligatoires : `nom_scientifique`, `regne` (`Animal` ou `Végétal`), `habitat`.

## Charte

Les principes, en bref (détail dans `design-system/README.md`) :

- **Aplats** de couleur, sans dégradé ni ombre.
- **Outfit** pour tout le texte, IBM Plex Mono pour les données.
- **Quatre éléments** : cellule, veine, graine, jonction.
- **Quatre échelles** réglées par la densité : macro, méso, micro, nano.
- **Divisions** : 2 et 3 cellules en coupes droites, 6 et plus en voronoï avec une cellule dominante pour le texte.
- **Deux règnes** : Faune à angles vifs, cobalt ; Flore en galets, lagon.
- **Mouvement** : anticipation, élan, dépassement, retour amorti.

Les planches de `design-system/components/*/preview.html` sont faites pour la page du design system (qui leur fournit les tokens compilés) ; ouvertes seules, elles s'affichent sans couleurs.
