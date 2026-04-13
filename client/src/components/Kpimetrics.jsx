import { useDashboard } from "../context/Dashboardcontext";


function KPICard({ title, value, subtitle, icon, gradient, accent, delay = 0, isRate = false }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Background glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />

      <div className="flex items-start justify-between relative z-10">
        <p className="text-slate-400 text-xs font-medium leading-tight pr-2">{title}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: gradient }}>
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>
          {isRate ? `${value}%` : value?.toLocaleString("en-IN") ?? "—"}
        </p>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>

      {isRate && (
        <div className="relative z-10">
          <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(value, 100)}%`, background: gradient }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function KPIMetrics() {
  const { metrics, loading } = useDashboard();

  if (!metrics || loading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 h-28 animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="h-3 rounded-full w-20 mb-3" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="h-7 rounded-full w-16" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Leads",
      value: metrics.totalLeads,
      subtitle: "All registered students",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      accent: "#3b82f6",
    },
    {
      title: "Total Applications",
      value: metrics.totalApplications,
      subtitle: "Paid ₹500 reg. fee",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      accent: "#8b5cf6",
    },
    {
      title: "Total Admissions",
      value: metrics.totalAdmissions,
      subtitle: "Enrolled students",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      accent: "#10b981",
    },
    {
      title: "Lead → Application",
      value: metrics.leadToApp,
      subtitle: "Conversion rate",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      accent: "#f59e0b",
      isRate: true,
    },
    {
      title: "Lead → Admission",
      value: metrics.leadToAdm,
      subtitle: "End-to-end rate",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      gradient: "linear-gradient(135deg, #ec4899, #be185d)",
      accent: "#ec4899",
      isRate: true,
    },
    {
      title: "App → Admission",
      value: metrics.appToAdm,
      subtitle: "Close rate",
      icon: <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      accent: "#06b6d4",
      isRate: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <KPICard key={i} {...card} delay={i * 60} />
      ))}
    </div>
  );
}