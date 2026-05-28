# 🧬 Codebase DNA Guardian

> Eine Claude Code-Kompetenz, die das ungeschriebene Wissen einer Codebasis extrahiert und durchsetzt.

[![npm version](https://img.shields.io/npm/v/codebase-dna-guardian)](https://www.npmjs.com/package/codebase-dna-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-8b5cf6)](https://claude.ai/claude-code)

![DNA Guardian Übersicht](docs/screenshots/overview.png)

Jede ausgereifte Codebasis hat ungeschriebene Regeln — Namenskonventionen, Fehlerbehandlungsmuster, Import-Stile, Architekturentscheidungen — die nur erfahrene Teammitglieder kennen. Neue Entwickler (und KI-Assistenten) verstoßen gegen diese Regeln nicht aus Inkompetenz, sondern weil **sie niemand aufgeschrieben hat**.

DNA Guardian erfasst diese Regeln als maschinenlesbares Profil und setzt sie kontinuierlich durch.

---

## ✨ Funktionen

| Befehl | Beschreibung |
|--------|-------------|
| `/dna-scan` | Codebasis scannen und Konventionen als DNA-Profil extrahieren |
| `/dna-check [pfad]` | Dateien gegen das DNA-Profil prüfen |
| `/dna-refactor [pfad]` | Konventionsverstöße automatisch beheben |
| `/dna-report` | Projektweites Gesundheitsdashboard generieren |
| `/dna-preview` | Interaktiven visuellen HTML-Bericht rendern |
| `/dna-onboard` | Einführungsdokument für neue Entwickler erstellen |
| `/dna-diff` | Zeigen, wie sich Konventionen seit dem letzten Scan entwickelt haben |
| `/dna-guard [branch]` | Pre-Merge-Gate — HARD-Verstöße blockieren |

---

## 🚀 Installation

### Via npm

```bash
npm install -g codebase-dna-guardian
```

### Manuelle Installation

```bash
git clone https://github.com/mturac/codebase-dna-guardian
# Dann zum Claude Code Skills-Verzeichnis hinzufügen
```

---

## 📖 Schnellstart

```
# 1. Projekt scannen
/dna-scan

# 2. Datei vor dem Merge prüfen
/dna-check src/services/payment.ts

# 3. Gesundheitsdashboard anzeigen
/dna-report

# 4. Visueller interaktiver Bericht
/dna-preview

# 5. PR absichern
/dna-guard feature/payment-refactor
```

Nach `/dna-scan` wird Claude Code **automatisch die DNA vor jeder neuen Codegenerierung konsultieren** — keine zusätzlichen Befehle erforderlich.

---

## 🏗 Funktionsweise

### 1. Scan (15–20 Dateien, nicht die gesamte Codebasis)

Der Scanner nimmt chirurgisch Stichproben:
- Konfigurationsdateien (tsconfig, eslint, pyproject.toml, usw.)
- Einstiegspunkte (main.ts, app.ts, server.py)
- Ein **vertikaler Schnitt** eines typischen Features (Route → Service → Repository → Test)
- Fehlerbehandlungsbeispiele
- Gemeinsam genutzte Hilfsprogramme
- Testdateien

Aus diesen ~20 Dateien werden Muster in 8 Kategorien extrahiert: Benennung, Architektur, Fehlerbehandlung, Tests, Importe, Abhängigkeiten, API-Verträge, asynchrone Muster.

### 2. Schweregrade

Jede Regel hat einen von drei Schweregraden:

| Grad | Verhalten |
|------|-----------|
| 🔴 **HARD** | Stopp vor der Generierung von verletzendem Code. Erklären. Um Bestätigung bitten. |
| 🟡 **SOFT** | Konformen Code generieren + kurze Fußnote hinzufügen. |
| 🟢 **PREF** | Stillschweigend anwenden. Nicht erwähnen. |

### 3. Passiver Wächter-Modus

Sobald `.claude/dna.md` vorhanden ist, **liest Claude Code es vor jeder Codegenerierung** — die Kompetenz muss nicht explizit aufgerufen werden. Das DNA ist immer aktiv.

---

## 📁 DNA-Profilformat

Der Scan schreibt in `.claude/dna.md` (einzelnes Projekt) oder `.claude/dna/` (Monorepo):

```
.claude/
  dna/
    root.md          ← gemeinsame Regeln
    frontend.md      ← servicespezifische Überschreibungen
    backend.md       ← servicespezifische Überschreibungen
    cross-service.md ← automatisch generierte Divergenzkarte
  dna-history.md     ← Audit-Trail aller Änderungen
```

---

## 📊 Visuelles Dashboard

Das Verzeichnis `scripts/` enthält eine React-Dashboard-Komponente:

```bash
cd scripts && npm install && npm run dev
```

Oder verwenden Sie `/dna-preview` in Claude Code.

| Übersicht | Regeln |
|-----------|--------|
| ![Übersicht](docs/screenshots/overview.png) | ![Regeln](docs/screenshots/rules.png) |

| Services | Gesundheit |
|----------|-----------|
| ![Services](docs/screenshots/services.png) | ![Gesundheit](docs/screenshots/health.png) |

---

## 🧩 Monorepo-Unterstützung

DNA Guardian unterstützt Multi-Service-Projekte nativ:

```
Welle 1: Root-Scan (gemeinsame Konfiguration, CI, gemeinsame Utilities)
Welle 2: Pro-Service-Scan (ein vertikaler Schnitt pro Service)
Welle 3: Kreuzvergleich (Musterunterschiede zwischen Services)
Welle 4: Klassifizierung (absichtliche Abweichung vs. Drift)
```

---

## 🌍 Andere Sprachen

[🇬🇧 English](README.md) · [🇹🇷 Türkçe](README.tr.md) · [🇫🇷 Français](README.fr.md) · [🇨🇳 中文](README.zh.md) · [🇰🇷 한국어](README.ko.md)

---

## 🤝 Mitwirken

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). PRs willkommen.

---

## 📜 Lizenz

MIT © Mehmet Turac
