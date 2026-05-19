# HELLFEST '26 — Running Order

Planning personnel du Hellfest 2026. Page web autonome, **un seul fichier** : `index.html` (HTML + CSS + JS inline). Aucun build, aucun backend — ouvrir le fichier dans un navigateur suffit.

## Fonctions

- **Jours** : onglets par journée du festival (MER 17, JEU 18, …).
- **Vues** :
  - `LINEUP` — programme complet, groupé par scène.
  - `MON PLANNING` — uniquement les concerts cochés.
  - `GROUPE` — planning combiné avec celui des amis importés.
- **Sélection** : cocher un concert l'ajoute à « Mon planning ».
- **Infos groupe** : bouton `i` → bio + lien Spotify.
- **Partage par QR / lien** :
  - `MON QR` génère un QR code (lib `qrcode-generator` via CDN) encodant ta sélection dans une URL.
  - Un ami scanne → le site s'ouvre et propose d'importer la sélection, soit comme **ami** (visible en vue Groupe), soit dans **ma setlist**.
  - `AMIS` gère les amis importés (visibilité, suppression).

## Persistance

Tout est stocké en `localStorage` (aucun serveur) :

| Clé          | Contenu                       |
|--------------|-------------------------------|
| `hf_user`    | nom + couleur de l'utilisateur |
| `hf_selected`| ids des concerts cochés        |
| `hf_friends` | plannings des amis importés    |

## Données

Les groupes, horaires, scènes (`STAGES`), jours (`DAYS`) et bios sont des constantes en dur dans le `<script>` de `index.html`.

## Dépendances

- `qrcode-generator` 1.4.4 (CDN cdnjs) — génération des QR codes.

Pas de framework, pas de package.json.
