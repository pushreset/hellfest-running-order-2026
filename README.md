# HELLFEST '26 — Running Order

Ton planning perso du Hellfest 2026, dans la poche. Tu coches les concerts à ne pas rater, tu compares avec tes potes, et le jour J tu sais exactement où être et à quelle heure.

Une appli web autonome, installable sur ton téléphone, qui marche même sans réseau au milieu de la foule.

## Ce que tu peux faire

### Préparer ton festival
- **Parcourir le lineup** complet, jour par jour, scène par scène ou trié par horaires.
- **Filtrer sur les mainstages** pour t'y retrouver dans les gros créneaux.
- **Cocher les concerts** que tu veux voir — ils atterrissent dans *Mon Planning*.
- **Découvrir les groupes** d'un tap : bio courte + lien Spotify pour écouter avant le départ.

### Visualiser ton planning
- **Vue liste** : tous tes concerts cochés du jour, dans l'ordre.
- **Vue grille (style timetable PDF)** : ton planning à la verticale, scènes en colonnes, comme le programme officiel.
- **Vue timeline (gantt horizontal)** : une ligne par scène, idéal pour repérer les chevauchements d'un coup d'œil.
- **Marqueur "NOW"** qui suit l'heure réelle pendant le festival.
- **Conflits d'horaires** mis en évidence visuellement.
- **Impression PDF** : un planning propre, une page par jour, à glisser dans la poche en backup papier.

### Faire le festival à plusieurs
- **Partage par QR code** : tu génères ton QR, ton pote scanne, sa setlist est synchro.
- **Import au choix** : ajouter la sélection comme **ami** (visible en vue Groupe) ou la fusionner dans **ta propre setlist**.
- **Vue Groupe** : ton planning combiné à ceux de tes potes — qui regarde quoi, où, quand.
- **Mise à jour facile** : un même pote qui rescanne son QR met à jour son planning sans le dupliquer.
- **Gestion des amis** : masquer, supprimer, renommer côté toi.

### Après le show
- **Note tes concerts** : étoiles (1–5) + petite note perso pour te souvenir des sets qui t'ont marqué.
- **Récap** du festival une fois fini.

### Pratique
- **Installable** comme une app (iOS / Android / desktop) via le manifest PWA.
- **Mode hors-ligne** complet grâce au service worker — pratique quand le réseau sature sur site.
- **Mémorise ton dernier onglet** : tu reviens là où tu étais.

## Sous le capot

Une appli volontairement minimaliste : **un seul fichier `index.html`** (HTML + CSS + JS inline), pas de build, pas de backend. Ouvre-le dans un navigateur, ça marche.

Tout est stocké en `localStorage` sur ton appareil — rien ne part sur un serveur :

| Clé           | Contenu                                  |
|---------------|------------------------------------------|
| `hf_user`     | nom, couleur et identifiant stable       |
| `hf_selected` | concerts cochés                          |
| `hf_friends`  | plannings des amis importés              |
| `hf_ratings`  | notes (étoiles + texte) post-concert     |
| `hf_view`     | dernière vue active                      |
| `hf_day`      | dernier jour consulté                    |

Lineup, scènes, horaires et bios sont en dur dans `index.html` (mis à jour J-30 avant le festival).

## Dépendances

- `qrcode-generator` 1.4.4 (CDN) — génération des QR codes.

Pas de framework, pas de `package.json`, pas de toolchain.
