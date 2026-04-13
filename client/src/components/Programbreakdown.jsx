import { useDashboard } from "../context/Dashboardcontext";

const PROGRAM_COLORS = {
  "MBA": { bar: "linear-gradient(90deg, #6366f1, #8b5cf6)", dot: "#6366f1" },
  "B.Tech": { bar: "linear-gradient(90deg, #06b6d4, #0891b2)", dot: "#06b6d4" },
  "MCA": { bar: "linear-gradient(90deg, #10b981, #059669)", dot: "#10b981" },
  "BCA": { bar: "linear-gradient(90deg, #f59e0b, #d97706)", dot: "#f59e0b" },
};

export default function ProgramBreakdown() {
  const { metrics, loading } = useDashboard();

  if (!metrics || loading) {
    return (
      <div className="rounded-2xl p-4 h-full animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-4 w-32 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />)}
      </div>
    );
  }

  const maxLeads = Math.max(...metrics.programBreakdown.map(p => p.leads), 1);

  return (
    <div className="rounded-2xl p-4 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-white text-sm font-semibold">Program Breakdown</h3>
      </div>

      <div className="flex-1 flex flex-col justify-around gap-3">
        {metrics.programBreakdown.map(({ program, leads, admissions }) => {
          const colors = PROGRAM_COLORS[program] || { bar: "linear-gradient(90deg, #94a3b8, #64748b)", dot: "#94a3b8" };
          const convRate = leads > 0 ? ((admissions / leads) * 100).toFixed(0) : 0;
          const barWidth = leads > 0 ? (leads / maxLeads) * 100 : 0;

          return (
            <div key={program} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.dot }} />
                  <span className="text-slate-300 text-xs font-medium">{program}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">{leads} leads</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{convRate}%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, background: colors.bar }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-600 text-xs">{admissions} admitted</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}