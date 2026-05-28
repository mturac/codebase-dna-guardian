# 🧬 Codebase DNA Guardian

> 一个提取并强制执行代码库隐性知识的 Claude Code 技能。

[![npm version](https://img.shields.io/npm/v/codebase-dna-guardian)](https://www.npmjs.com/package/codebase-dna-guardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-8b5cf6)](https://claude.ai/claude-code)

![DNA Guardian 概览](docs/screenshots/overview.png)

每个成熟的代码库都有不成文的规则——命名约定、错误处理模式、导入风格、架构决策——这些只有经验丰富的团队成员才知道。新开发者（和 AI 助手）违反这些规则，不是因为能力不足，而是因为**从未有人将它们写下来**。

DNA Guardian 将这些规则捕获为机器可读的配置文件，并持续强制执行。

---

## ✨ 功能

| 命令 | 描述 |
|------|------|
| `/dna-scan` | 扫描代码库并将约定提取为 DNA 配置文件 |
| `/dna-check [路径]` | 根据 DNA 配置文件审计文件 |
| `/dna-refactor [路径]` | 自动修复约定违规 |
| `/dna-report` | 生成项目级健康仪表板 |
| `/dna-preview` | 渲染交互式 HTML 可视化报告 |
| `/dna-onboard` | 为新开发者生成基于 DNA 的入职简报 |
| `/dna-diff` | 显示自上次扫描以来约定的演变 |
| `/dna-guard [分支]` | 合并前检查门——阻止 HARD 违规 |

---

## 🚀 安装

### 通过 npm

```bash
npm install -g codebase-dna-guardian
```

### 手动安装

```bash
git clone https://github.com/mturac/codebase-dna-guardian
# 然后添加到 Claude Code 技能目录
```

---

## 📖 快速开始

```
# 1. 扫描项目
/dna-scan

# 2. 合并前检查文件
/dna-check src/services/payment.ts

# 3. 查看健康仪表板
/dna-report

# 4. 交互式可视化报告
/dna-preview

# 5. 保护 PR
/dna-guard feature/payment-refactor
```

运行 `/dna-scan` 后，Claude Code 将**在生成任何新代码之前自动参考 DNA**——无需额外命令。

---

## 🏗 工作原理

### 1. 扫描（15–20 个文件，而非整个代码库）

扫描器采用精准采样策略：
- 配置文件（tsconfig、eslint、pyproject.toml 等）
- 入口文件（main.ts、app.ts、server.py）
- 典型功能的**垂直切片**（路由 → 服务 → 仓库 → 测试）
- 错误处理示例
- 共享工具函数
- 测试文件

从这约 20 个文件中，提取 8 个类别的模式：命名、架构、错误处理、测试、导入、依赖、API 契约、异步模式。

### 2. 严重级别

每条规则有三个级别之一：

| 级别 | 行为 |
|------|------|
| 🔴 **HARD** | 在生成违规代码前停止，解释原因，请求确认。 |
| 🟡 **SOFT** | 生成合规代码 + 添加简短脚注。 |
| 🟢 **PREF** | 静默应用，不作说明。 |

### 3. 被动守护模式

一旦 `.claude/dna.md` 存在，Claude Code 将**在每次代码生成前自动读取**——无需显式调用该技能。DNA 始终处于激活状态。

---

## 📁 DNA 配置文件格式

扫描结果写入 `.claude/dna.md`（单项目）或 `.claude/dna/`（monorepo）：

```
.claude/
  dna/
    root.md          ← 共享规则
    frontend.md      ← 服务特定覆盖
    backend.md       ← 服务特定覆盖
    cross-service.md ← 自动生成的差异图
  dna-history.md     ← 所有变更的审计追踪
```

---

## 📊 可视化仪表板

`scripts/` 目录包含一个 React 仪表板组件，可渲染交互式健康报告：

```bash
cd scripts && npm install && npm run dev
```

或在 Claude Code 中使用 `/dna-preview`。

| 概览 | 规则 |
|------|------|
| ![概览](docs/screenshots/overview.png) | ![规则](docs/screenshots/rules.png) |

| 服务 | 健康 |
|------|------|
| ![服务](docs/screenshots/services.png) | ![健康](docs/screenshots/health.png) |

---

## 🧩 Monorepo 支持

DNA Guardian 原生处理多服务项目：

```
第 1 波：根扫描（共享配置、CI、共享工具）
第 2 波：逐服务扫描（每个服务一个垂直切片）
第 3 波：交叉比较（跨服务差异模式）
第 4 波：分类（有意分歧 vs. 漂移）
```

---

## 🌍 其他语言

[🇬🇧 English](README.md) · [🇹🇷 Türkçe](README.tr.md) · [🇫🇷 Français](README.fr.md) · [🇩🇪 Deutsch](README.de.md) · [🇰🇷 한국어](README.ko.md)

---

## 🤝 贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。欢迎提交 PR。

---

## 📜 许可证

MIT © Mehmet Turac
