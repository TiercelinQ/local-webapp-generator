# Guide d'utilisation — Local Web App Generator

> Version 0.1.0 : pipeline de génération + skills de maintenance, rôle explicite par skill, specs persistées, vérification exécutable, mémoire native.

---

## Structure du framework

```
local-webapp-generator/
├── CLAUDE.md                 # Instructions core (EN) · persona · communication FR · index commandes · calibrage
├── GUIDE.md                  # Ce fichier
├── README.md                 # Présentation du repo GitHub (EN)
├── CHANGELOG.md              # Changelog du générateur (distinct de celui des apps générées)
├── LICENSE
└── .claude/
    ├── design-system.md      # Référence visuelle contraignante (v3.0, Bootstrap 5.3 via Sass) — source de vérité unique
    ├── layout.md              # Cadre layout d'accompagnement — catalogue de patterns + composition par défaut + spec toasts
    ├── rules/
    │   ├── mvc.md            # routes=Controllers · services=appels API sortants · views=templates, livraison par lots
    │   ├── css.md             # Organisation Sass/Bootstrap, $primary, data-bs-theme, nommage
    │   ├── errors.md          # Contrat ApiResult<T>, toasts, middleware d'erreur Express + uncaughtException
    │   ├── security.md        # Sécurité web (validation entrées, secrets .env, CORS localhost)
    │   ├── config.md          # config.ts, versioning, tsconfig, packaging (aucun)
    │   ├── env-config.md      # Variables d'environnement (.env / .env.example)
    │   ├── api-calls.md       # Conventions d'appels HTTP sortants (client, timeouts, retries)
    │   ├── tests.md           # Vitest, couverture par couche
    │   ├── logging.md         # pino obligatoire (fichier, niveaux, zéro console.log)
    │   ├── verification.md    # Vérification EXÉCUTABLE centralisée + intégrité statique
    │   └── readme.md          # Synchro README post-livraison (régénération auto)
    ├── skills/
    │   ├── local-webapp-app/            # Menu démarrage / reprise / maintenance (4 options)
    │   ├── local-webapp-p1-scoping/     # Scoping — jusqu'à 8 questions + accent → docs/specs/01-scoping.md
    │   ├── local-webapp-p2-featuring/   # Fiche besoins → docs/specs/02-featuring.md
    │   ├── local-webapp-p3-surfaces/    # Proposition layout → docs/specs/03-surfaces.md
    │   ├── local-webapp-p4-architect/   # Contrat architectural verrouillé → docs/specs/04-architect.md
    │   ├── local-webapp-p5-development/ # Livraison par lots (enchaînement auto)
    │   ├── local-webapp-add-feature/    # Ajouter une feature à un projet livré (respect contrat + sécurité)
    │   ├── local-webapp-trace-feature/  # Tracer une fonctionnalité route→service→vue
    │   ├── local-webapp-fix-issue/      # Corriger un bug — arbre de décision, cause racine
    │   ├── local-webapp-refactor-code/  # Restructurer sous validation explicite uniquement
    │   ├── local-webapp-migrate-design/ # Convertir une app legacy (CSS custom) vers Bootstrap 5.3
    │   ├── local-webapp-release/        # Figer une version SemVer (changelog cumulé)
    │   ├── local-webapp-run-tests/      # Vérification exécutable (typecheck, lint, build)
    │   ├── local-webapp-load-project/   # Chargement d'un projet existant
    │   ├── local-webapp-generate-readme/ # Génération README.md projet existant
    │   ├── local-webapp-save-session/   # Sauvegarde de session
    │   ├── local-webapp-show-state/     # État courant du projet
    │   ├── local-webapp-show-contract/  # Arborescence du contrat validé
    │   └── local-webapp-save-memory/    # Persiste dans la mémoire native Claude Code
    ├── settings.json          # Permissions d'exécution (npm, npx, node) + garde-fous deny (.env, secrets, artefacts)
    └── settings.local.json    # Overrides locaux (non versionné)
```

> Source de vérité **unique** : un seul `design-system.md` et un seul `layout.md`, sous `.claude/` (lus à la demande par les skills UI, non auto-importés — voir `CLAUDE.md` § BINDING REFERENCES). `design-system.md` est contraignant (skin) ; la composition décrite par `layout.md` est un **défaut modifiable**, co-défini en Phase 3 et verrouillé dans `docs/specs/04-architect.md`.

---

## Spécificités de ce framework

| Apport                        | Détail                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Rôle par skill**            | Chaque skill ouvre sur un persona ciblé (Role / Goal / Deliverable).            |
| **Specs persistées**          | Phases 1→4 écrivent `docs/specs/01-scoping.md` … `04-architect.md` (dans la langue de l'utilisateur). |
| **Contrat = source de vérité**| `docs/specs/04-architect.md` relu par `/local-webapp-load-project`, `/local-webapp-show-contract`, `/local-webapp-add-feature`, `/local-webapp-refactor-code`. |
| **Skills de maintenance**     | `local-webapp-trace-feature`, `local-webapp-add-feature`, `local-webapp-fix-issue`, `local-webapp-refactor-code`, `local-webapp-migrate-design`, `local-webapp-release`, `local-webapp-run-tests` avec arbres de décision et anti-patterns. |
| **Vérification exécutable**   | `rules/verification.md` : typecheck, lint, build — échec bloquant.              |
| **Mémoire native**            | `/local-webapp-save-memory` écrit dans la mémoire native Claude Code + `MEMORY.md`.            |

---

## Installation

```bash
# Démarrer Claude Code depuis le dossier du framework (ou copier dans le projet cible).
claude
```

### Prérequis

```bash
claude --version      # Claude Code CLI installé et connecté
node --version         # Node.js 22 LTS+ (pour exécuter les apps générées)
```

### Activer la mémoire (une seule fois, par machine)

```
/config → Memory → Enable auto memory → On
```

---

## Démarrer une nouvelle application

```
/local-webapp-app → 1
```

### Phase 1 — Scoping

Jusqu'à 8 questions en un seul bloc : objectif · port local · systèmes API externes à appeler · préférences persistantes · i18n FR/EN · tests (Vitest) · variables d'environnement attendues. Puis choix de l'**accent** : un seul override optionnel (`$primary`) du thème Bootstrap 5.3 standard. Accent « Steel Blue » par défaut + 5 accents nommés (Teal, Forest, Slate, Amber, Ruby) + hex personnalisé + option « thème Bootstrap par défaut » (aucun override) ; contrôle de contraste WCAG AA (averti, non bloquant) sur l'accent.

Calibrage **provisoire** annoncé (figé après Phase 2) :

| Taille        | Lots (sans tests) | Lots (avec tests) |
| ------------- | ----------------- | ----------------- |
| Petit         | 3                  | 4                   |
| Moyen / Grand | 4                  | 5                   |

Écrit `docs/specs/01-scoping.md`.

### Phase 2 — Featuring

Fiche structurée + calibrage **confirmé** à partir du compte réel. Validation bloquante avant Phase 3. Écrit `docs/specs/02-featuring.md`.

### Phase 3 — Surfaces

Co-conception guidée. Questionnaire structurant (navigation, organisation du contenu, formulaires et actions) appuyé sur le catalogue de patterns de `layout.md` §12 : topbar + onglets (défaut), sidebar verticale, barre de menus, master-detail. Puis proposition sur mesure, composition librement amendable, et questions de détail (position des onglets, drawer/modale, 6 positions de toasts). Validation bloquante. Écrit `docs/specs/03-surfaces.md`.

### Phase 4 — Architect

Arborescence + rôle de chaque fichier + **tableau des endpoints API** (route → controller → service → système externe appelé → vue) + tableau variables/classes Bootstrap → usage. **Verrouillé après validation.** Écrit `docs/specs/04-architect.md` (source de vérité).

### Phase 5 — Development

Fichiers écrits directement sur le disque. Annonce `Lot N/[total] — [contenu]`. Enchaînement automatique. Dernier lot : instructions d'installation, `README.md`, `.env.example`. Vérification exécutable appliquée.

---

## Reprendre une session

```
/local-webapp-save-session             # sauvegarder en fin de session (docs/sessions/)
/local-webapp-app → 2    # reprendre : fournir le chemin du fichier SESSION
```

La reprise est gérée par `/local-webapp-app` (option 2, ou bloc SESSION collé directement dans le message — reprise sans menu) : lecture complète du fichier SESSION, réponse `Resuming [APP_NAME] — [phase suivante] | Batch [X/total] | Open points: …`, puis enchaînement immédiat sans re-poser les questions résolues.

En fin de Phase 5, le générateur écrit automatiquement `docs/sessions/SESSION_[NomApp]_S0.md` : la session de référence de la livraison (écrasée si la Phase 5 est rejouée). Les `/local-webapp-save-session` manuels sont numérotés à partir de S1.

---

## Travailler sur un projet livré

```
/local-webapp-app → 3     # ou directement /local-webapp-load-project depuis la racine du projet
```

Claude lit `docs/specs/04-architect.md` (priorité), sinon le README, sinon le code, puis confirme la prise en charge en un bloc au format unifié (`Project loaded: [nom] v[version]`, stack, endpoints API, tests, design system, specs, `Generator rules applied. Ready for: development · fixes · improvements · adjustments.`) et applique toutes les règles. Projet sans README : `/local-webapp-generate-readme`.

### Maintenance (`/local-webapp-app → 4`)

| Besoin                          | Commande      |
| -------------------------------- | ------------- |
| Ajouter une fonctionnalité      | `/local-webapp-add-feature`   |
| Comprendre / tracer le code     | `/local-webapp-trace-feature`     |
| Corriger un bug                 | `/local-webapp-fix-issue`         |
| Restructurer (sous validation)  | `/local-webapp-refactor-code`    |
| Convertir une app legacy (CSS custom) vers Bootstrap 5.3 | `/local-webapp-migrate-design` |
| Figer une version SemVer (changelog cumulé) | `/local-webapp-release` |
| Vérifier le build / lancer les checks | `/local-webapp-run-tests`  |

---

## Vérification exécutable

`rules/verification.md` est la source unique. Commandes (échec bloquant quand l'environnement le permet) :

```bash
npm install
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm run build                # tsc
npm run test                 # vitest — si activé (Phase 1)
```

`/local-webapp-run-tests` exécute cette échelle ; `/local-webapp-fix-issue` y renvoie pour confirmer une correction.

---

## Sécurité

`rules/security.md` est non négociable et appliqué à 100% : validation de toute entrée de route côté serveur, secrets et identifiants d'API uniquement dans `.env` (jamais en dur, jamais envoyés au client, jamais loggés), CORS restreint à localhost. `/local-webapp-fix-issue` et `/local-webapp-add-feature` y renvoient systématiquement.

---

## Gestion des anomalies et mémoire

Après correction (`/local-webapp-fix-issue` ou Phase 5), Claude produit un bilan de nettoyage puis propose `Veux-tu mémoriser ce point ? /local-webapp-save-memory`. `/local-webapp-save-memory` catégorise et écrit dans la **mémoire native Claude Code** (+ `MEMORY.md`).

Prérequis : la mémoire auto doit être activée (`/config → Memory → Enable auto memory → On`). Sans cette activation, `/local-webapp-save-memory` formule les notes mais ne les persiste pas entre sessions.

---

## Commandes de référence

| Commande                          | Modèle | Action                                               |
| ------------------------------------ | ------ | ----------------------------------------------------- |
| `/local-webapp-app`                 | Haiku  | Menu démarrage / reprise / maintenance               |
| `/local-webapp-p1-scoping`          | Sonnet | Scoping — jusqu'à 8 questions + accent               |
| `/local-webapp-p2-featuring`        | Sonnet | Fiche besoins                                         |
| `/local-webapp-p3-surfaces`         | Sonnet | Proposition layout + personnalisation                |
| `/local-webapp-p4-architect`        | Sonnet | Contrat architectural verrouillé (endpoints)         |
| `/local-webapp-p5-development`      | Sonnet | Livraison par lots — enchaînement automatique        |
| `/local-webapp-add-feature`         | Sonnet | Ajouter une feature à un projet livré                |
| `/local-webapp-trace-feature`       | Sonnet | Tracer une fonctionnalité à travers les couches      |
| `/local-webapp-fix-issue`           | Sonnet | Corriger un bug — cause racine                       |
| `/local-webapp-refactor-code`       | Sonnet | Restructurer sous validation                          |
| `/local-webapp-migrate-design`      | Sonnet | Convertir une app legacy (CSS custom) vers Bootstrap 5.3 |
| `/local-webapp-release`             | Sonnet | Figer une version SemVer depuis le changelog cumulé   |
| `/local-webapp-run-tests`           | Sonnet | Vérification exécutable                               |
| `/local-webapp-load-project`        | Sonnet | Charger un projet existant                            |
| `/local-webapp-generate-readme`     | Sonnet | Générer README.md d'un projet existant                |
| `/local-webapp-save-session`        | Haiku  | Sauvegarder la session                                |
| `/local-webapp-show-state`          | Haiku  | État courant                                           |
| `/local-webapp-show-contract`       | Haiku  | Contrat architectural validé                          |
| `/local-webapp-save-memory`         | Haiku  | Persister dans la mémoire native                      |

---

## Structure d'une application générée

```
mon-app/
├── package.json · tsconfig*.json · eslint.config.mjs
├── README.md
├── CLAUDE.md                      # Identité projet (origine, contexte, écarts) — généré en fin de Phase 5
├── .claude/settings.json          # Garde-fous + hook de vérification (app auto-contrôlée)
├── docs/specs/                    # Specs de génération (langue utilisateur)
├── docs/release/CHANGELOG.md      # Changelog SemVer (Keep a Changelog)
├── .env.example                   # Variables d'environnement documentées
└── src/
    ├── shared/                    # config.ts, types.ts, logger.ts
    ├── routes/                    # Routers Express (controllers)
    ├── services/                  # Appels vers les systèmes API externes
    ├── views/                     # Templates / pages statiques
    └── index.ts                   # Point d'entrée
```

### Versioning & changelog

Chaque app générée porte une version SemVer et un changelog `docs/release/CHANGELOG.md` (format Keep a Changelog, rédigé en anglais). Les skills de maintenance (`add-feature`, `fix-issue`, `refactor-code`, `migrate-design`) accumulent leurs entrées sous `## [Unreleased]` ; `/local-webapp-release` les fige en un bloc de version daté et incrémente la source de version (`package.json` + le miroir `src/shared/config.ts` `APP_VERSION`). La version n'est jamais incrémentée en silence. Voir `rules/versioning.md`.

---

## Points de vigilance

- `.claude/design-system.md` et `.claude/layout.md` sont la **source de vérité unique** — ne pas les dupliquer. La composition portée par `layout.md` est un défaut modifiable (retenue validée en Phase 3) ; le skin de `design-system.md` reste contraignant.
- Sécurité web (`.claude/rules/security.md`) non négociable — jamais affaiblie, même temporairement.
- Les appels API sortants sont centralisés dans `src/services/` — zéro appel `fetch` direct depuis une route ou une vue.
- Le contrat (`docs/specs/04-architect.md`) est verrouillé. Tout changement structurel passe par `/local-webapp-add-feature` ou le protocole de déclaration d'écart.
- `/local-webapp-load-project`, `/local-webapp-generate-readme`, `/local-webapp-add-feature`, `/local-webapp-trace-feature`, `/local-webapp-fix-issue`, `/local-webapp-refactor-code`, `/local-webapp-migrate-design`, `/local-webapp-release`, `/local-webapp-run-tests` s'invoquent depuis la racine du projet cible.
- Application strictement locale : aucune exposition réseau au-delà de `localhost`, aucun secret ne quitte le serveur.
