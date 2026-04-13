import { useDashboard } from "../context/Dashboardcontext";


const RANK_STYLES = [
  { bg: "rgba(251,191,36,0.2)", color: "#fbbf24", text: "🥇" },
  { bg: "rgba(156,163,175,0.2)", color: "#9ca3af", text: "🥈" },
  { bg: "rgba(180,83,9,0.2)", color: "#b45309", text: "🥉" },
];

export default function CounsellorPerformance() {
  const { metrics, loading } = useDashboard();

  if (!metrics || loading) {
    return (
      <div className="rounded-2xl p-4 h-full animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-4 w-40 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-white text-sm font-semibold">Counsellor Performance</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-2 mb-2 px-2">
        <span className="col-span-2 text-slate-500 text-xs font-medium">#  Name</span>
        <span className="text-slate-500 text-xs font-medium text-center">Leads</span>
        <span className="text-slate-500 text-xs font-medium text-center">Apps</span>
        <span className="text-slate-500 text-xs font-medium text-center">Admitted</span>
      </div>

      <div className="flex-1 overflow-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {metrics.counsellorData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">No data for current filters</p>
          </div>
        ) : metrics.counsellorData.map(({ name, leads, applications, admissions }, i) => {
          const rankStyle = RANK_STYLES[i] || null;
          const convRate = leads > 0 ? ((admissions / leads) * 100).toFixed(0) : 0;
          const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);

          return (
            <div key={name} className="grid grid-cols-5 gap-2 items-center px-2 py-2.5 rounded-xl transition-colors hover:bg-white/5 group" style={{ border: "1px solid transparent" }}>
              <div className="col-span-2 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: rankStyle ? rankStyle.bg : "rgba(255,255,255,0.08)", color: rankStyle ? rankStyle.color : "#94a3b8", border: `1px solid ${rankStyle ? rankStyle.color + "40" : "rgba(255,255,255,0.1)"}` }}>
                  {i < 3 ? rankStyle.text : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{name.split(" ")[0]}</p>
                  <p className="text-slate-500 text-xs truncate">{name.split(" ").slice(1).join(" ")}</p>
                </div>
              </div>
              <span className="text-slate-300 text-xs font-medium text-center">{leads}</span>
              <span className="text-slate-300 text-xs font-medium text-center">{applications}</span>
              <div className="flex items-center justify-center">
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{
                  background: admissions > 0 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
                  color: admissions > 0 ? "#34d399" : "#64748b"
                }}>
                  {admissions}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}