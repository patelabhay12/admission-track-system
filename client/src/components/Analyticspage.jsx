import { useMemo } from "react";
import { leadsData, applicationsData, teamMapping } from "../data/mockdata";
import { useAuth } from "../context/Authcontext";


/* ─── helpers ──────────────────────────────────────────────── */
const PROG_COLORS  = { MBA: "#6366f1", "B.Tech": "#06b6d4", MCA: "#10b981", BCA: "#f59e0b" };
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function pct(a, b) { return b === 0 ? "0" : ((a / b) * 100).toFixed(1); }

/* ─── tiny components ──────────────────────────────────────── */
function SectionCard({ title, icon, iconBg, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>{icon}</div>
        <h3 className="text-white text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ─── Funnel SVG ────────────────────────────────────────────── */
function FunnelChart({ leads, apps, admissions }) {
  const stages = [
    { label: "Leads",        val: leads,      color: "#3b82f6", pctVal: 100 },
    { label: "Applications", val: apps,       color: "#8b5cf6", pctVal: leads > 0 ? (apps / leads) * 100 : 0 },
    { label: "Admissions",   val: admissions, color: "#10b981", pctVal: leads > 0 ? (admissions / leads) * 100 : 0 },
  ];
  const maxWidth = 280;
  return (
    <div className="flex flex-col gap-3 flex-1 justify-center">
      {stages.map((s, i) => {
        const w = (s.pctVal / 100) * maxWidth;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                <span className="text-slate-300 text-xs font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-bold" style={{ fontFamily: "'Sora',sans-serif" }}>{s.val}</span>
                {i > 0 && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: s.color + "22", color: s.color }}>{s.pctVal.toFixed(1)}%</span>}
              </div>
            </div>
            <div className="h-8 rounded-xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-xl transition-all duration-1000 flex items-center px-3"
                style={{ width: `${s.pctVal}%`, background: `linear-gradient(90deg, ${s.color}cc, ${s.color}55)`, minWidth: s.val > 0 ? "2rem" : 0 }}>
                {s.val > 0 && <span className="text-white text-xs font-bold opacity-80">{s.val}</span>}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center gap-2 mt-1.5 ml-2">
                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                <span className="text-slate-600 text-xs">
                  {i === 0 ? `${pct(apps, leads)}% converted to application` : `${pct(admissions, apps)}% converted to admission`}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Monthly Trend (SVG sparkline) ────────────────────────── */
function MonthlyTrend({ data }) {
  if (!data.length) return <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">No data</div>;

  const maxVal = Math.max(...data.flatMap(d => [d.leads, d.apps, d.adm]), 1);
  const W = 520, H = 130, padL = 8, padR = 8, padT = 10, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const toX = (i) => padL + (i / (data.length - 1)) * chartW;
  const toY = (v) => padT + chartH - (v / maxVal) * chartH;

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d[key]).toFixed(1)}`).join(" ");

  const lines = [
    { key: "leads", color: "#3b82f6", label: "Leads" },
    { key: "apps",  color: "#8b5cf6", label: "Apps" },
    { key: "adm",   color: "#10b981", label: "Admitted" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2">
      {/* Legend */}
      <div className="flex gap-4">
        {lines.map(l => (
          <div key={l.key} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: l.color }}/>
            <span className="text-slate-400 text-xs">{l.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={padL} y1={padT + chartH * t} x2={W - padR} y2={padT + chartH * t}
            stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} strokeDasharray={t === 1 ? "0" : "4 4"}/>
        ))}
        {/* Area fills */}
        {lines.map(l => {
          const area = [...data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d[l.key]).toFixed(1)}`),
            `L${toX(data.length - 1).toFixed(1)},${(padT + chartH).toFixed(1)}`,
            `L${toX(0).toFixed(1)},${(padT + chartH).toFixed(1)}Z`].join(" ");
          return <path key={l.key} d={area} fill={l.color} fillOpacity={0.07}/>;
        })}
        {/* Lines */}
        {lines.map(l => (
          <path key={l.key} d={linePath(l.key)} fill="none" stroke={l.color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
        ))}
        {/* Month labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fill="#475569" fontSize={9} fontFamily="DM Sans, sans-serif">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Donut chart (SVG) ─────────────────────────────────────── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, x) => s + x.val, 0);
  if (total === 0) return <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">No data</div>;

  const R = 54, CX = 70, CY = 70, stroke = 22;
  const circ = 2 * Math.PI * R;
  let cumAngle = -Math.PI / 2;

  const arcs = segments.map(seg => {
    const angle = (seg.val / total) * 2 * Math.PI;
    const startA = cumAngle;
    // eslint-disable-next-line react-hooks/immutability
    cumAngle += angle;
    return { ...seg, offset: circ * (1 - seg.val / total), startA, angle };
  });

  return (
    <div className="flex items-center gap-6 flex-1">
      <svg viewBox="0 0 140 140" style={{ width: 120, flexShrink: 0 }}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        {/* Segments */}
        {arcs.map((arc, i) => {
          const x1 = CX + R * Math.cos(arc.startA);
          const y1 = CY + R * Math.sin(arc.startA);
          const x2 = CX + R * Math.cos(arc.startA + arc.angle);
          const y2 = CY + R * Math.sin(arc.startA + arc.angle);
          const large = arc.angle > Math.PI ? 1 : 0;
          return (
            <path key={i}
              d={`M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
              fill={arc.color} opacity={0.85}/>
          );
        })}
        {/* Inner circle */}
        <circle cx={CX} cy={CY} r={R - stroke / 2 - 2} fill="#080f1e"/>
        <text x={CX} y={CY - 4} textAnchor="middle" fill="white" fontSize={16} fontWeight={700} fontFamily="Sora, sans-serif">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="DM Sans, sans-serif">total</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }}/>
              <span className="text-slate-300 text-xs">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold">{seg.val}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: seg.color + "22", color: seg.color }}>{pct(seg.val, total)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Counsellor heatmap bars ───────────────────────────────── */
function CounsellorBars({ data }) {
  const maxAdm = Math.max(...data.map(d => d.leads), 1);
  return (
    <div className="flex-1 flex flex-col justify-around gap-2">
      {data.map((c, i) => {
        const convRate = c.leads > 0 ? ((c.adm / c.leads) * 100).toFixed(0) : 0;
        return (
          <div key={c.name}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-3">{i + 1}</span>
                <span className="text-slate-300 text-xs font-medium">{c.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">{c.leads} leads</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{convRate}%</span>
              </div>
            </div>
            <div className="flex gap-1 h-2">
              {/* Leads bar */}
              <div className="rounded-l-full rounded-r-sm overflow-hidden flex-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-l-full transition-all duration-700"
                  style={{ width: `${(c.leads / maxAdm) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#6366f1)" }}/>
              </div>
            </div>
            {/* Sub bar: app vs admission */}
            <div className="flex gap-0.5 h-1.5 mt-0.5">
              <div style={{ flex: c.apps, background: "#8b5cf655", borderRadius: "2px 0 0 2px" }}/>
              <div style={{ flex: c.adm, background: "#10b98188", borderRadius: "0 2px 2px 0" }}/>
              <div style={{ flex: Math.max(0, c.leads - c.apps - c.adm), background: "transparent" }}/>
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[["#3b82f6","Leads"],["#8b5cf6","Applications"],["#10b981","Admissions"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }}/>
            <span className="text-slate-500 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Analytics Page ───────────────────────────────────── */
export default function AnalyticsPage() {
  const { currentUser, isAdmin } = useAuth();

  const scoped = useMemo(() => {
    if (isAdmin) return leadsData;
    const myCounsellors = teamMapping
      .filter(t => t.managerName === currentUser?.managerName)
      .map(t => t.counsellorName);
    return leadsData.filter(l => myCounsellors.includes(l.leadOwner));
  }, [isAdmin, currentUser]);

  const metrics = useMemo(() => {
    const total = scoped.length;
    const apps  = scoped.filter(l => l.leadStatus === "Application" || l.leadStatus === "Admission").length;
    const adm   = scoped.filter(l => l.leadStatus === "Admission").length;

    // Monthly trend (bucket by registration date)
    const monthMap = {};
    scoped.forEach(l => {
      const d = new Date(l.registrationDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { leads: 0, apps: 0, adm: 0, month: MONTH_LABELS[d.getMonth()] };
      monthMap[key].leads++;
      if (l.leadStatus === "Application" || l.leadStatus === "Admission") monthMap[key].apps++;
      if (l.leadStatus === "Admission") monthMap[key].adm++;
    });
    const monthlyTrend = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

    // Program breakdown for donut
    const progSegments = Object.entries(PROG_COLORS).map(([p, color]) => ({
      label: p, val: scoped.filter(l => l.programInterested === p).length, color
    })).filter(s => s.val > 0);

    // Admission by program
    const admByProg = Object.entries(PROG_COLORS).map(([p, color]) => ({
      label: p, val: scoped.filter(l => l.programInterested === p && l.leadStatus === "Admission").length, color
    })).filter(s => s.val > 0);

    // Counsellor data
    const cMap = {};
    scoped.forEach(l => {
      if (!cMap[l.leadOwner]) cMap[l.leadOwner] = { name: l.leadOwner, leads: 0, apps: 0, adm: 0 };
      cMap[l.leadOwner].leads++;
      if (l.leadStatus === "Application" || l.leadStatus === "Admission") cMap[l.leadOwner].apps++;
      if (l.leadStatus === "Admission") cMap[l.leadOwner].adm++;
    });
    const counsellorData = Object.values(cMap).sort((a, b) => b.leads - a.leads);

    // Revenue
    const admFees  = applicationsData.filter(a => scoped.some(l => l.user_id === a.user_id)).reduce((s, a) => s + (a.admissionFee || 0), 0);
    const regFees  = applicationsData.filter(a => scoped.some(l => l.user_id === a.user_id)).reduce((s, a) => s + (a.registrationFee || 0), 0);

    // State distribution
    const stateMap = {};
    scoped.forEach(l => { stateMap[l.state] = (stateMap[l.state] || 0) + 1; });
    const topStates = Object.entries(stateMap).sort(([,a],[,b]) => b - a).slice(0, 8);

    return { total, apps, adm, monthlyTrend, progSegments, admByProg, counsellorData, admFees, regFees, topStates };
  }, [scoped]);

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ background: "#080f1e", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Sora',sans-serif" }}>Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Deep insights into your admissions pipeline</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
          <span className="text-indigo-300 text-xs font-medium">{isAdmin ? "All Teams" : currentUser?.managerName + "'s Team"}</span>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: "Total Revenue", value: `₹${((metrics.admFees + metrics.regFees) / 100000).toFixed(2)}L`, sub: "Reg + Admission fees", color: "#10b981" },
          { label: "Admission Revenue", value: `₹${(metrics.admFees / 100000).toFixed(2)}L`, sub: "Admission fees only", color: "#6366f1" },
          { label: "Avg Fee / Admission", value: metrics.adm > 0 ? `₹${Math.round(metrics.admFees / metrics.adm).toLocaleString("en-IN")}` : "—", sub: "Per admitted student", color: "#8b5cf6" },
          { label: "Lead → App Rate", value: `${pct(metrics.apps, metrics.total)}%`, sub: "Of all leads applied", color: "#f59e0b" },
          { label: "App → Admission Rate", value: `${pct(metrics.adm, metrics.apps)}%`, sub: "Of applicants enrolled", color: "#06b6d4" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color }}/>
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
            <p className="text-white text-xl font-bold" style={{ fontFamily: "'Sora',sans-serif", letterSpacing: "-0.02em" }}>{value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Funnel + Monthly Trend */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4">
          <SectionCard title="Conversion Funnel"
            icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>}
            iconBg="rgba(99,102,241,0.2)"
            className="h-64">
            <FunnelChart leads={metrics.total} apps={metrics.apps} admissions={metrics.adm}/>
          </SectionCard>
        </div>
        <div className="col-span-8">
          <SectionCard title="Monthly Registration Trend"
            icon={<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
            iconBg="rgba(59,130,246,0.2)"
            className="h-64">
            <MonthlyTrend data={metrics.monthlyTrend}/>
          </SectionCard>
        </div>
      </div>

      {/* Row 2: Program Donut + Admission Donut + Counsellors */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3">
          <SectionCard title="Lead Distribution by Program"
            icon={<svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>}
            iconBg="rgba(139,92,246,0.2)"
            className="h-56">
            <DonutChart segments={metrics.progSegments}/>
          </SectionCard>
        </div>
        <div className="col-span-3">
          <SectionCard title="Admissions by Program"
            icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>}
            iconBg="rgba(16,185,129,0.2)"
            className="h-56">
            <DonutChart segments={metrics.admByProg}/>
          </SectionCard>
        </div>
        <div className="col-span-6">
          <SectionCard title="Counsellor Performance Breakdown"
            icon={<svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            iconBg="rgba(6,182,212,0.2)"
            className="h-56">
            <CounsellorBars data={metrics.counsellorData}/>
          </SectionCard>
        </div>
      </div>

      {/* Row 3: State distribution */}
      <SectionCard title="Geographic Lead Distribution (Top States)"
        icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        iconBg="rgba(245,158,11,0.2)">
        <div className="grid grid-cols-4 gap-4">
          {metrics.topStates.map(([state, count], i) => {
            const convLeads = scoped.filter(l => l.state === state);
            const convAdm = convLeads.filter(l => l.leadStatus === "Admission").length;
            const convRate = convLeads.length > 0 ? ((convAdm / convLeads.length) * 100).toFixed(0) : 0;
            const maxCount = metrics.topStates[0]?.[1] || 1;
            const barColors = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ec4899","#3b82f6","#8b5cf6","#ef4444"];
            return (
              <div key={state} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white text-sm font-semibold">{state}</p>
                    <p className="text-slate-500 text-xs">{count} leads</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{convRate}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCount) * 100}%`, background: barColors[i % barColors.length] }}/>
                </div>
                <p className="text-slate-600 text-xs mt-1">{convAdm} admitted</p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}