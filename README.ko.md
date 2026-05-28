# 🧬 Codebase DNA Guardian

> 코드베이스의 부족 지식을 추출하고 적용하는 Claude Code 스킬.

[![npm version](https://img.shields.io/npm/v/codebase-dna-guardian)](https://www.npmjs.com/package/codebase-dna-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-8b5cf6)](https://claude.ai/claude-code)

![DNA Guardian 개요](docs/screenshots/overview.png)

모든 성숙한 코드베이스에는 암묵적인 규칙이 있습니다 — 네이밍 컨벤션, 에러 처리 패턴, 임포트 스타일, 아키텍처 결정 — 이것들은 경험 있는 팀원만 알고 있습니다. 신규 개발자(그리고 AI 어시스턴트)가 이 규칙을 위반하는 것은 능력 부족이 아니라, **아무도 문서화하지 않았기** 때문입니다.

DNA Guardian은 이러한 규칙을 머신 리더블한 프로필로 캡처하고 지속적으로 적용합니다.

---

## ✨ 기능

| 명령어 | 설명 |
|--------|------|
| `/dna-scan` | 코드베이스를 스캔하여 컨벤션을 DNA 프로필로 추출 |
| `/dna-check [경로]` | DNA 프로필에 대해 파일 감사 |
| `/dna-refactor [경로]` | 컨벤션 위반 자동 수정 |
| `/dna-report` | 프로젝트 전체 건강 대시보드 생성 |
| `/dna-preview` | 인터랙티브 HTML 시각 보고서 렌더링 |
| `/dna-onboard` | DNA에서 신규 개발자 브리핑 문서 생성 |
| `/dna-diff` | 마지막 스캔 이후 컨벤션의 변화 표시 |
| `/dna-guard [브랜치]` | 머지 전 게이트 — HARD 위반 차단 |

---

## 🚀 설치

### npm을 통한 설치

```bash
npm install -g codebase-dna-guardian
```

### 수동 설치

```bash
git clone https://github.com/mturac/codebase-dna-guardian
# 그 다음 Claude Code 스킬 디렉토리에 추가
```

---

## 📖 빠른 시작

```
# 1. 프로젝트 스캔
/dna-scan

# 2. 머지 전 파일 검사
/dna-check src/services/payment.ts

# 3. 건강 대시보드 확인
/dna-report

# 4. 인터랙티브 시각 보고서
/dna-preview

# 5. PR 보호
/dna-guard feature/payment-refactor
```

`/dna-scan` 실행 후 Claude Code는 **새 코드를 생성하기 전에 자동으로 DNA를 참조합니다** — 추가 명령이 필요 없습니다.

---

## 🏗 작동 원리

### 1. 스캔 (전체 코드베이스가 아닌 15–20개 파일)

스캐너는 전략적으로 샘플링합니다:
- 설정 파일 (tsconfig, eslint, pyproject.toml 등)
- 진입점 (main.ts, app.ts, server.py)
- 일반적인 기능의 **수직 슬라이스** (라우트 → 서비스 → 리포지토리 → 테스트)
- 에러 처리 샘플
- 공유 유틸리티
- 테스트 파일

이 ~20개 파일에서 8가지 카테고리의 패턴을 추출합니다: 네이밍, 아키텍처, 에러 처리, 테스트, 임포트, 의존성, API 계약, 비동기 패턴.

### 2. 심각도 단계

모든 규칙은 세 단계 중 하나를 가집니다:

| 단계 | 동작 |
|------|------|
| 🔴 **HARD** | 위반 코드 생성 전 중지. 설명. 확인 요청. |
| 🟡 **SOFT** | 준수 코드 생성 + 간단한 각주 추가. |
| 🟢 **PREF** | 조용히 적용. 언급 없음. |

### 3. 수동 가디언 모드

`.claude/dna.md`가 존재하면 Claude Code는 **모든 코드 생성 전에 자동으로 읽습니다** — 스킬을 명시적으로 호출할 필요가 없습니다. DNA는 항상 활성 상태입니다.

---

## 📁 DNA 프로필 형식

스캔은 `.claude/dna.md` (단일 프로젝트) 또는 `.claude/dna/` (모노레포)에 작성됩니다:

```
.claude/
  dna/
    root.md          ← 공유 규칙
    frontend.md      ← 서비스별 오버라이드
    backend.md       ← 서비스별 오버라이드
    cross-service.md ← 자동 생성된 차이 맵
  dna-history.md     ← 모든 변경 사항의 감사 추적
```

---

## 📊 시각 대시보드

`scripts/` 디렉토리에는 인터랙티브 건강 보고서를 렌더링하는 React 대시보드 컴포넌트가 포함되어 있습니다:

```bash
cd scripts && npm install && npm run dev
```

또는 Claude Code에서 `/dna-preview` 사용.

| 개요 | 규칙 |
|------|------|
| ![개요](docs/screenshots/overview.png) | ![규칙](docs/screenshots/rules.png) |

| 서비스 | 건강 |
|--------|------|
| ![서비스](docs/screenshots/services.png) | ![건강](docs/screenshots/health.png) |

---

## 🧩 모노레포 지원

DNA Guardian은 멀티 서비스 프로젝트를 기본으로 지원합니다:

```
Wave 1: 루트 스캔 (공유 설정, CI, 공유 유틸리티)
Wave 2: 서비스별 스캔 (서비스당 수직 슬라이스 하나)
Wave 3: 교차 비교 (서비스 간 패턴 차이)
Wave 4: 분류 (의도적 차이 vs. 드리프트)
```

---

## 🌍 다른 언어

[🇬🇧 English](README.md) · [🇹🇷 Türkçe](README.tr.md) · [🇫🇷 Français](README.fr.md) · [🇩🇪 Deutsch](README.de.md) · [🇨🇳 中文](README.zh.md)

---

## 🤝 기여

[CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요. PR을 환영합니다.

---

## 📜 라이선스

MIT © Mehmet Turac
