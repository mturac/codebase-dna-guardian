# 🧬 Codebase DNA Guardian

> Une compétence Claude Code qui extrait et applique les règles non écrites d'une base de code.

[![npm version](https://img.shields.io/npm/v/codebase-dna-guardian)](https://www.npmjs.com/package/codebase-dna-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-8b5cf6)](https://claude.ai/claude-code)

![DNA Guardian Vue d'ensemble](docs/screenshots/overview.png)

Chaque base de code mature possède des règles non écrites — conventions de nommage, patterns de gestion d'erreurs, styles d'import, décisions architecturales — que seuls les membres expérimentés de l'équipe connaissent. Les nouveaux développeurs (et les assistants IA) violent ces règles non pas par incompétence, mais parce que **personne ne les a écrites**.

DNA Guardian capture ces règles sous forme de profil lisible par machine et les applique en continu.

---

## ✨ Fonctionnalités

| Commande | Description |
|----------|-------------|
| `/dna-scan` | Scanner la base de code et extraire les conventions comme profil ADN |
| `/dna-check [chemin]` | Auditer des fichiers selon le profil ADN |
| `/dna-refactor [chemin]` | Corriger automatiquement les violations de conventions |
| `/dna-report` | Générer un tableau de bord de santé global |
| `/dna-preview` | Afficher un rapport visuel HTML interactif |
| `/dna-onboard` | Créer un briefing pour les nouveaux développeurs |
| `/dna-diff` | Montrer l'évolution des conventions depuis le dernier scan |
| `/dna-guard [branche]` | Porte pré-fusion — bloquer les violations HARD |

---

## 🚀 Installation

### Via npm

```bash
npm install -g codebase-dna-guardian
```

### Installation manuelle

```bash
git clone https://github.com/mturac/codebase-dna-guardian
# Puis ajouter au répertoire des compétences Claude Code
```

---

## 📖 Démarrage rapide

```
# 1. Scanner votre projet
/dna-scan

# 2. Vérifier un fichier avant une fusion
/dna-check src/services/payment.ts

# 3. Voir le tableau de bord
/dna-report

# 4. Rapport visuel interactif
/dna-preview

# 5. Protéger une PR
/dna-guard feature/payment-refactor
```

Après `/dna-scan`, Claude Code **consultera automatiquement l'ADN avant de générer tout nouveau code** — aucune commande supplémentaire nécessaire.

---

## 🏗 Fonctionnement

### 1. Scan (15–20 fichiers, pas toute la base de code)

Le scanner échantillonne de manière chirurgicale :
- Fichiers de configuration (tsconfig, eslint, pyproject.toml, etc.)
- Points d'entrée (main.ts, app.ts, server.py)
- Une **tranche verticale** d'une fonctionnalité typique (route → service → repository → test)
- Exemples de gestion d'erreurs
- Utilitaires partagés
- Fichiers de tests

Ces ~20 fichiers permettent d'extraire des patterns dans 8 catégories : Nommage, Architecture, Gestion d'erreurs, Tests, Imports, Dépendances, Contrats API, Patterns asynchrones.

### 2. Niveaux de sévérité

Chaque règle a un niveau parmi trois :

| Niveau | Comportement |
|--------|-------------|
| 🔴 **HARD** | Stopper avant de générer du code violant la règle. Expliquer. Demander confirmation. |
| 🟡 **SOFT** | Générer du code conforme + ajouter une note de bas de page. |
| 🟢 **PREF** | Appliquer silencieusement. Ne pas mentionner. |

### 3. Mode Gardien Passif

Une fois `.claude/dna.md` créé, Claude Code **le lit avant chaque génération de code** — pas besoin d'invoquer la compétence explicitement. L'ADN est toujours actif.

---

## 📁 Format du profil ADN

Le scan écrit dans `.claude/dna.md` (projet unique) ou `.claude/dna/` (monorepo) :

```
.claude/
  dna/
    root.md          ← règles partagées
    frontend.md      ← surcharges spécifiques au service
    backend.md       ← surcharges spécifiques au service
    cross-service.md ← carte de divergences générée automatiquement
  dna-history.md     ← audit trail de tous les changements
```

---

## 📊 Tableau de bord visuel

Le répertoire `scripts/` contient un composant React pour un rapport de santé interactif :

```bash
cd scripts && npm install && npm run dev
```

Ou utilisez `/dna-preview` dans Claude Code.

| Vue d'ensemble | Règles |
|----------------|--------|
| ![Vue d'ensemble](docs/screenshots/overview.png) | ![Règles](docs/screenshots/rules.png) |

| Services | Santé |
|----------|-------|
| ![Services](docs/screenshots/services.png) | ![Santé](docs/screenshots/health.png) |

---

## 🧩 Support Monorepo

DNA Guardian gère nativement les projets multi-services :

```
Vague 1 : Scan racine (config partagée, CI, utilitaires partagés)
Vague 2 : Scan par service (une tranche verticale par service)
Vague 3 : Comparaison croisée (diff des patterns entre services)
Vague 4 : Classification (divergence intentionnelle vs dérive)
```

---

## 🌍 Autres langues

[🇬🇧 English](README.md) · [🇹🇷 Türkçe](README.tr.md) · [🇩🇪 Deutsch](README.de.md) · [🇨🇳 中文](README.zh.md) · [🇰🇷 한국어](README.ko.md)

---

## 🤝 Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Les PR sont les bienvenues.

---

## 📜 Licence

MIT © Mehmet Turac
