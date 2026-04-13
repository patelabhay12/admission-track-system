import { useAuth } from "../context/Authcontext";
import { useDashboard } from "../context/Dashboardcontext";


export default function Topbar() {
  const { currentUser, isAdmin } = useAuth();
  const { loading, filters } = useDashboard();
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ background: "rgba(15,23,42,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Admissions Dashboard
          </h1>
          <p className="text-slate-500 text-xs">{dateStr}</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <svg className="animate-spin w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-indigo-300 text-xs font-medium">Updating...</span>
          </div>
        )}
        {activeFiltersCount > 0 && !loading && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 text-xs font-medium">{activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Role badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: isAdmin ? "rgba(99,102,241,0.15)" : "rgba(6,182,212,0.15)", border: isAdmin ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(6,182,212,0.3)" }}>
          <svg className="w-3.5 h-3.5" style={{ color: isAdmin ? "#a5b4fc" : "#67e8f9" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isAdmin
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            }
          </svg>
          <span className="text-xs font-semibold capitalize" style={{ color: isAdmin ? "#a5b4fc" : "#67e8f9" }}>
            {currentUser?.role}
            {!isAdmin && currentUser?.managerName && ` · ${currentUser.managerName.split(" ")[0]}`}
          </span>
        </div>

        {/* View-only badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-amber-400 text-xs font-medium">View Only</span>
        </div>
      </div>
    </header>
  );
}