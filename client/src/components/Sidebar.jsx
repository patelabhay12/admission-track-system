import { useAuth } from "../context/Authcontext";


export default function Sidebar() {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <aside className="flex flex-col h-full w-16 lg:w-56 flex-shrink-0 transition-all duration-300" style={{ background: "rgba(15,23,42,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 lg:px-4 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>UniTrack</p>
          <p className="text-indigo-400 text-xs">Admissions Intel</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavItem icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
        } label="Dashboard" active />
        <NavItem icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        } label="Leads" 
        onClick={() => window.location.href = "/analytics"}
        />
        <NavItem icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        } label="Applications"
        onClick={() => window.location.href = "/applications"}
         />
        <NavItem icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        } label="Analytics" />

        {isAdmin && (
          <>
            <div className="hidden lg:block pt-2 pb-1 px-2">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Admin</p>
            </div>
            <NavItem icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            } label="Teams" />
          </>
        )}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 p-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: isAdmin ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #06b6d4, #0891b2)" }}>
            {currentUser?.avatar}
          </div>
          <div className="hidden lg:block overflow-hidden flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-xs capitalize truncate" style={{ color: isAdmin ? "#a5b4fc" : "#67e8f9" }}>{currentUser?.role}</p>
          </div>
          <button onClick={logout} title="Logout" className="hidden lg:flex w-6 h-6 rounded-lg items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
        <button onClick={logout} className="lg:hidden w-full mt-1 flex items-center justify-center py-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <button className={`w-full flex items-center gap-3 px-2 lg:px-3 py-2 rounded-xl transition-all duration-200 group ${active ? "" : "hover:bg-white/5"}`}
      style={active ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" } : { border: "1px solid transparent" }}>
      <span className={`flex-shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>{icon}</span>
      <span className={`hidden lg:block text-sm font-medium ${active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"}`}>{label}</span>
    </button>
  );
}