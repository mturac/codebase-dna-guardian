import { useState, useEffect, useRef } from "react";

// === MOCK DATA (replace with real DNA scan output) ===
const DNA_DATA = {
  project: "TeserracT",
  framework: "Fastify + TypeScript + Prisma",
  language: "TypeScript / Python / Go",
  structure: "Monorepo (17 services)",
  lastScan: "2026-05-28",
  gitHash: "d114aef",
  filesSampled: 42,
  totalFiles: 714,
  consistencyScore: 87,
  previousScore: 81,
  services: [
    { name: "aegis", score: 94, rules: 22, violations: 1, language: "TypeScript" },
    { name: "pmai", score: 86, rules: 19, violations: 3, language: "Python" },
    { name: "morpheus", score: 91, rules: 18, violations: 2, language: "TypeScript" },
    { name: "pythia", score: 88, rules: 17, violations: 2, language: "TypeScript" },
    { name: "uroboros", score: 82, rules: 16, violations: 3, language: "TypeScript" },
    { name: "zentra", score: 79, rules: 20, violations: 4, language: "Go" },
    { name: "cortex", score: 85, rules: 18, violations: 3, language: "TypeScript" },
  ],
  rules: [
    { id: "N1", tier: "HARD", category: "Naming", rule: "Files use kebab-case", violations: 4, locations: ["src/services/userService.ts", "src/controllers/PaymentHandler.ts", "pmai/dataProcessor.py", "morpheus/runExperiment.ts"] },
    { id: "A2", tier: "HARD", category: "Architecture", rule: "No direct DB calls in controllers — use Repository pattern", violations: 2, locations: ["src/controllers/legacy/reports.ts", "zentra/handlers/batch.go"] },
    { id: "E1", tier: "HARD", category: "Error Handling", rule: "All async functions must have error handling", violations: 1, locations: ["src/services/notification.ts:45"] },
    { id: "E2", tier: "SOFT", category: "Error Handling", rule: "Use pino logger, never console.log", violations: 3, locations: ["morpheus/runner.ts:12", "pythia/scanner.ts:67", "uroboros/gc.ts:23"] },
    { id: "I1", tier: "SOFT", category: "Imports", rule: "Use path aliases (@/) instead of relative paths", violations: 5, locations: ["aegis/src/routes/auth.ts", "morpheus/src/bridge.ts", "cortex/src/index.ts", "pythia/src/digest.ts", "uroboros/src/collector.ts"] },
    { id: "D2", tier: "PREF", category: "Dependencies", rule: "Use dayjs instead of moment", violations: 1, locations: ["legacy/src/utils/format-date.ts"] },
    { id: "T2", tier: "SOFT", category: "Testing", rule: "Test files co-located as *.spec.ts", violations: 2, locations: ["__tests__/auth.test.ts", "__tests__/user.test.ts"] },
    { id: "C1", tier: "HARD", category: "API Contracts", rule: "API responses wrapped in { data, error, meta }", violations: 0, locations: [] },
    { id: "A3", tier: "SOFT", category: "Architecture", rule: "Feature-based folder structure", violations: 2, locations: ["src/controllers/", "src/models/"] },
    { id: "I2", tier: "PREF", category: "Imports", rule: "Barrel files for public API of each module", violations: 3, locations: ["services/morpheus/src/", "services/pythia/src/", "services/uroboros/src/"] },
  ],
  zombies: [
    { pkg: "moment@2.29.4", lastSeen: "legacy/src/utils/", verdict: "zombie", installedSize: "4.2 MB" },
    { pkg: "lodash@4.17.21", lastSeen: "Only _.get in 2 files", verdict: "partial", installedSize: "1.4 MB" },
    { pkg: "request@2.88.2", lastSeen: "None found", verdict: "zombie", installedSize: "2.1 MB" },
    { pkg: "uuid@8.3.2", lastSeen: "Replaced by crypto.randomUUID()", verdict: "zombie", installedSize: "0.1 MB" },
  ],
  driftZones: [
    { location: "src/controllers/legacy/", issue: "Callback pattern vs async/await", cause: "Legacy code pre-refactor", severity: "medium" },
    { location: "services/zentra/handlers/", issue: "Direct DB access bypassing repository", cause: "Go service — different data access norms", severity: "low" },
    { location: "services/pmai/", issue: "snake_case file naming (Python convention)", cause: "Intentional — Python ecosystem", severity: "info" },
  ],
  evolution: [
    { date: "2026-05-28", score: 87, added: 2, changed: 1, removed: 1 },
    { date: "2026-05-14", score: 84, added: 0, changed: 3, removed: 0 },
    { date: "2026-04-30", score: 81, added: 5, changed: 2, removed: 2 },
    { date: "2026-04-15", score: 78, added: 0, changed: 1, removed: 0 },
    { date: "2026-04-01", score: 74, added: 24, changed: 0, removed: 0 },
  ],
  // Cross-service consistency — populate from /dna-scan Wave 3 or cross-service.md
  crossServiceConsistency: {
    consistent: [
      "Error base class (AppError)",
      "API response envelope { data, error, meta }",
      "Git commit format (conventional commits)",
      "kebab-case file naming (TS services)",
    ],
    intentional: [
      "Data access: Prisma (TS) vs SQLAlchemy (Python) vs GORM (Go)",
      "Test framework: Vitest vs Pytest vs Go testing",
      "File naming: kebab-case (TS) vs snake_case (Python)",
    ],
    drift: [
      "Path aliases: aegis uses @/ while morpheus uses relative imports (both TS)",
      "Barrel files: aegis has them, pythia/uroboros don't",
    ],
  },
};

const TIER_CONFIG = {
  HARD: { color: "#ff4444", bg: "rgba(255,68,68,0.08)", border: "rgba(255,68,68,0.25)", label: "HARD", icon: "🔴" },
  SOFT: { color: "#ffaa00", bg: "rgba(255,170,0,0.08)", border: "rgba(255,170,0,0.25)", label: "SOFT", icon: "🟡" },
  PREF: { color: "#44cc88", bg: "rgba(68,204,136,0.08)", border: "rgba(68,204,136,0.25)", label: "PREF", icon: "🟢" },
};

const CATEGORY_COLORS = {
  Naming: "#8b5cf6",
  Architecture: "#3b82f6",
  "Error Handling": "#ef4444",
  Imports: "#f59e0b",
  Dependencies: "#10b981",
  Testing: "#06b6d4",
  "API Contracts": "#ec4899",
};

// === Animated Score Ring ===
function ScoreRing({ score, prev, size = 160 }) {
  const [animScore, setAnimScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let frame;
    let start;
    const duration = 1400;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimScore(Math.round(eased * score));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference - (animScore / 100) * circumference;
  const getColor = (s) => s >= 90 ? "#22c55e" : s >= 75 ? "#eab308" : s >= 60 ? "#f97316" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={getColor(animScore)} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 800, color: getColor(animScore), fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-2px" }}>
          {animScore}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: -2 }}>/ 100</span>
        {prev !== undefined && (
          <span style={{ fontSize: 12, color: score > prev ? "#22c55e" : "#ef4444", marginTop: 4, fontWeight: 600 }}>
            {score > prev ? "▲" : "▼"} {Math.abs(score - prev)} pts
          </span>
        )}
      </div>
    </div>
  );
}

// === Mini bar for service scores ===
function ServiceBar({ name, score, language, violations }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(score), 100); }, [score]);
  const getColor = (s) => s >= 90 ? "#22c55e" : s >= 75 ? "#eab308" : s >= 60 ? "#f97316" : "#ef4444";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ width: 100, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{name}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{language}</div>
      </div>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, borderRadius: 4, background: `linear-gradient(90deg, ${getColor(score)}88, ${getColor(score)})`,
          transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
      <span style={{ width: 36, textAlign: "right", fontSize: 14, fontWeight: 700, color: getColor(score), fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
      {violations > 0 && (
        <span style={{ fontSize: 10, color: "#ff6b6b", background: "rgba(255,68,68,0.12)", padding: "2px 6px", borderRadius: 8, fontWeight: 600 }}>
          {violations}
        </span>
      )}
    </div>
  );
}

// === Helix DNA Animation ===
function HelixAnimation() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 60;
    const h = canvas.height = 200;
    let t = 0;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * h;
        const phase = t + i * 0.35;
        const x1 = w/2 + Math.sin(phase) * 18;
        const x2 = w/2 - Math.sin(phase) * 18;
        const depth = (Math.cos(phase) + 1) / 2;

        ctx.globalAlpha = 0.15 + depth * 0.35;
        ctx.beginPath();
        ctx.arc(x1, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#8b5cf6";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#06b6d4";
        ctx.fill();

        if (i % 3 === 0) {
          ctx.globalAlpha = 0.08 + depth * 0.12;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      t += 0.02;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} style={{ opacity: 0.6 }} />;
}

// === Main Dashboard ===
export default function DNAGuardianDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRule, setSelectedRule] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
  const d = DNA_DATA;

  const hardViolations = d.rules.filter(r => r.tier === "HARD" && r.violations > 0);
  const softViolations = d.rules.filter(r => r.tier === "SOFT" && r.violations > 0);
  const totalViolations = d.rules.reduce((s, r) => s + r.violations, 0);
  const cleanRules = d.rules.filter(r => r.violations === 0).length;

  const tabs = [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "rules", label: "Rules", icon: "§" },
    { id: "services", label: "Services", icon: "⬡" },
    { id: "health", label: "Health", icon: "♥" },
  ];

  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 24,
    backdropFilter: "blur(20px)",
  };

  const statBox = (label, value, sub, accent) => (
    <div style={{ ...cardStyle, flex: 1, minWidth: 140, textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent || "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #0a0a0f 0%, #0f1219 40%, #0d1117 100%)",
      color: "#e2e8f0",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "24px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* BG Grid */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{ position: "relative" }}>
            <HelixAnimation />
            <div style={{ position: "absolute", top: 0, left: 0, width: 60, height: 200, background: "linear-gradient(to bottom, #0a0a0f, transparent 15%, transparent 85%, #0a0a0f)", pointerEvents: "none" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                DNA Guardian
              </h1>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>v2.0</span>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {d.project} • {d.framework}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              <span>Scanned: {d.lastScan}</span>
              <span>•</span>
              <span>Git: {d.gitHash}</span>
              <span>•</span>
              <span>{d.filesSampled}/{d.totalFiles} files sampled</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedRule(null); }}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                background: activeTab === tab.id ? "rgba(139,92,246,0.2)" : "transparent",
                color: activeTab === tab.id ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}>
              <span style={{ fontSize: 11 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Score + Stats Row */}
            <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 200 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>Consistency</div>
                  <ScoreRing score={d.consistencyScore} prev={d.previousScore} />
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 300 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {statBox("Rules", d.rules.length, `${cleanRules} clean`, "#c4b5fd")}
                  {statBox("Violations", totalViolations, `${hardViolations.length} critical`, totalViolations > 0 ? "#ff6b6b" : "#22c55e")}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {statBox("Services", d.services.length, d.structure)}
                  {statBox("Zombies", d.zombies.filter(z => z.verdict === "zombie").length, "suspected deps", "#f59e0b")}
                </div>
              </div>
            </div>

            {/* Critical Violations */}
            {hardViolations.length > 0 && (
              <div style={{ ...cardStyle, borderColor: "rgba(255,68,68,0.2)", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>🔴</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ff6b6b" }}>Critical Violations</span>
                  <span style={{ fontSize: 11, color: "rgba(255,68,68,0.6)", marginLeft: "auto" }}>fix before merge</span>
                </div>
                {hardViolations.map(rule => (
                  <div key={rule.id} style={{ padding: "12px 16px", background: "rgba(255,68,68,0.04)", borderRadius: 10, marginBottom: 8, border: "1px solid rgba(255,68,68,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ff6b6b", marginRight: 8 }}>{rule.id}</span>
                        <span style={{ fontSize: 13, color: "#e2e8f0" }}>{rule.rule}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6b6b", fontFamily: "'JetBrains Mono', monospace" }}>×{rule.violations}</span>
                    </div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {rule.locations.map((loc, i) => (
                        <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Evolution Sparkline */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                DNA Evolution
              </div>
              <div style={{ display: "flex", alignItems: "end", gap: 2, height: 80 }}>
                {d.evolution.slice().reverse().map((e, i) => {
                  const h = ((e.score - 60) / 40) * 80;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.5)" }}>{e.score}</span>
                      <div style={{
                        width: "100%", maxWidth: 50, height: Math.max(h, 8), borderRadius: 6,
                        background: `linear-gradient(to top, rgba(139,92,246,0.3), rgba(139,92,246,${0.3 + (e.score/100)*0.5}))`,
                        border: "1px solid rgba(139,92,246,0.2)",
                        transition: "height 0.5s ease",
                      }} />
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{e.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === "rules" && (
          <div>
            {/* Category breakdown */}
            <div style={{ ...cardStyle, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                Rules by Category
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(
                  d.rules.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {})
                ).map(([cat, count]) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                    background: `${CATEGORY_COLORS[cat] || "#888"}15`, border: `1px solid ${CATEGORY_COLORS[cat] || "#888"}30` }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[cat] || "#888" }} />
                    <span style={{ fontSize: 12, color: "#e2e8f0" }}>{cat}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: CATEGORY_COLORS[cat] || "#888", fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rule list */}
            {d.rules.map(rule => {
              const tc = TIER_CONFIG[rule.tier];
              const isSelected = selectedRule === rule.id;
              return (
                <div key={rule.id}
                  onClick={() => setSelectedRule(isSelected ? null : rule.id)}
                  style={{
                    ...cardStyle, marginBottom: 8, cursor: "pointer",
                    borderColor: isSelected ? tc.border : "rgba(255,255,255,0.06)",
                    background: isSelected ? tc.bg : "rgba(255,255,255,0.03)",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: tc.color, minWidth: 32 }}>{rule.id}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: tc.bg, color: tc.color, fontWeight: 700, border: `1px solid ${tc.border}` }}>
                      {tc.label}
                    </span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${CATEGORY_COLORS[rule.category]}15`, color: CATEGORY_COLORS[rule.category] }}>
                      {rule.category}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{rule.rule}</span>
                    {rule.violations > 0 ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: tc.color, fontFamily: "'JetBrains Mono', monospace" }}>×{rule.violations}</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "#22c55e" }}>✓</span>
                    )}
                  </div>
                  {isSelected && rule.violations > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${tc.border}` }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Violation locations:</div>
                      {rule.locations.map((loc, i) => (
                        <div key={i} style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.6)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: tc.color }}>→</span> {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div>
            <div style={{ ...cardStyle, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                Service Consistency Scores
              </div>
              {d.services.map(svc => (
                <div key={svc.name} onMouseEnter={() => setHoveredService(svc.name)} onMouseLeave={() => setHoveredService(null)}>
                  <ServiceBar {...svc} />
                </div>
              ))}
            </div>

            {/* Cross-service analysis — data-driven from DNA_DATA.crossServiceConsistency */}
            {d.crossServiceConsistency && (
              <div style={{ ...cardStyle }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Cross-Service Consistency
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {d.crossServiceConsistency.consistent?.length > 0 && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>✅ Consistent Across All Services</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {d.crossServiceConsistency.consistent.map((item, i) => (
                          <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#22c55e", fontSize: 10 }}>•</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.crossServiceConsistency.intentional?.length > 0 && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                      <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 8 }}>ℹ️ Intentional Divergence</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {d.crossServiceConsistency.intentional.map((item, i) => (
                          <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#3b82f6", fontSize: 10 }}>•</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.crossServiceConsistency.drift?.length > 0 && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
                      <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, marginBottom: 8 }}>⚠️ Unintentional Drift</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {d.crossServiceConsistency.drift.map((item, i) => (
                          <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#f97316", fontSize: 10 }}>•</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {d.crossServiceConsistency.drift?.length === 0 && d.crossServiceConsistency.consistent?.length === 0 && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 16 }}>
                      Run /dna-scan on a monorepo to populate cross-service analysis
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HEALTH TAB */}
        {activeTab === "health" && (
          <div>
            {/* Zombie Dependencies */}
            <div style={{ ...cardStyle, marginBottom: 20, borderColor: "rgba(245,158,11,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>🧟</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>Zombie Dependencies</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>verify with depcheck / knip</span>
              </div>
              {d.zombies.map((z, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
                  background: z.verdict === "zombie" ? "rgba(239,68,68,0.04)" : "rgba(245,158,11,0.04)",
                  border: `1px solid ${z.verdict === "zombie" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)"}`,
                  marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{z.verdict === "zombie" ? "💀" : "⚠️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0" }}>{z.pkg}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{z.lastSeen}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{z.installedSize}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: z.verdict === "zombie" ? "#ef4444" : "#f59e0b", textTransform: "uppercase" }}>{z.verdict}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Architectural Drift */}
            <div style={{ ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>🌊</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#8b5cf6" }}>Architectural Drift Zones</span>
              </div>
              {d.driftZones.map((dz, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#c4b5fd" }}>{dz.location}</div>
                      <div style={{ fontSize: 13, color: "#e2e8f0", marginTop: 4 }}>{dz.issue}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Cause: {dz.cause}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      color: dz.severity === "medium" ? "#f97316" : dz.severity === "low" ? "#eab308" : "#3b82f6",
                      background: dz.severity === "medium" ? "rgba(249,115,22,0.1)" : dz.severity === "low" ? "rgba(234,179,8,0.1)" : "rgba(59,130,246,0.1)",
                      textTransform: "uppercase",
                    }}>
                      {dz.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            Codebase DNA Guardian v2.0 • Consistency beats cleverness
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {["/dna-scan", "/dna-check", "/dna-guard", "/dna-onboard"].map(cmd => (
              <span key={cmd} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.06)", padding: "3px 8px", borderRadius: 6 }}>
                {cmd}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
