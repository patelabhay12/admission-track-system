import { useDashboard } from "../context/Dashboardcontext";


const STATUS_STYLES = {
  Lead: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd", dot: "#3b82f6" },
  Application: { bg: "rgba(139,92,246,0.15)", color: "#c4b5fd", dot: "#8b5cf6" },
  Admission: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", dot: "#10b981" },
};

export default function RecentLeads() {
  const { recentLeads, loading } = useDashboard();

  if (loading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="h-4 w-32 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.2)" }}>
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-semibold">Recent Leads</h3>
        </div>
        <span className="text-slate-500 text-xs">{recentLeads.length} records</span>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">Student</span>
          <span className="col-span-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">State</span>
          <span className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wider">Program</span>
          <span className="col-span-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">Owner</span>
          <span className="col-span-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ divideColor: "rgba(255,255,255,0.04)" }}>
          {recentLeads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">No leads match the current filters</p>
            </div>
          ) : recentLeads.map((lead, i) => {
            const statusStyle = STATUS_STYLES[lead.leadStatus] || STATUS_STYLES.Lead;
            const initials = lead.student_name.split(" ").map(n => n[0]).join("").slice(0, 2);
            const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
            const bgColor = colors[i % colors.length];

            return (
              <div key={lead.user_id} className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center transition-colors hover:bg-white/[0.02]" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: bgColor + "33", border: `1px solid ${bgColor}40`, color: bgColor }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{lead.studentName}</p>
                    <p className="text-slate-500 text-xs truncate">{lead.user_id}</p>
                  </div>
                </div>
                <span className="col-span-2 text-slate-400 text-xs truncate">{lead.state}</span>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium truncate"
                    style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
                    {lead.programInterested}
                  </span>
                </div>
                <span className="col-span-2 text-slate-400 text-xs truncate">{lead.manager_name.split(" ")[0]}</span>
                <div className="col-span-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusStyle.dot }} />
                    {lead.leadStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}