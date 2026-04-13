import { useDashboard } from "../context/Dashboardcontext";


export default function TopStates() {
  const { metrics, loading } = useDashboard();

  if (!metrics || loading) {
    return (
      <div className="rounded-2xl p-4 h-full animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-4 w-28 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        {[...Array(5)].map((_, i) => <div key={i} className="h-8 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />)}
      </div>
    );
  }

  const maxCount = Math.max(...metrics.topStates.map(s => s.count), 1);
  const totalLeads = metrics.totalLeads || 1;

  const stateColors = [
    "linear-gradient(90deg, #6366f1, #8b5cf6)",
    "linear-gradient(90deg, #06b6d4, #0891b2)",
    "linear-gradient(90deg, #10b981, #059669)",
    "linear-gradient(90deg, #f59e0b, #d97706)",
    "linear-gradient(90deg, #ec4899, #be185d)",
  ];

  return (
    <div className="rounded-2xl p-4 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-white text-sm font-semibold">Top States</h3>
      </div>

      <div className="flex-1 flex flex-col justify-around gap-2">
        {metrics.topStates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">No data available</p>
          </div>
        ) : metrics.topStates.map(({ state, count }, i) => {
          const pct = ((count / totalLeads) * 100).toFixed(0);
          const barPct = (count / maxCount) * 100;
          return (
            <div key={state}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-bold w-4">{i + 1}</span>
                  <span className="text-slate-300 text-xs font-medium">{state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{count}</span>
                  <span className="text-xs font-semibold w-8 text-right" style={{ color: i === 0 ? "#fbbf24" : "#64748b" }}>{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, background: stateColors[i] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}