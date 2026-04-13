
import { states, cities, programs, counsellors, managers, teamMapping } from "../data/Mockdata";
import { useAuth } from "../context/Authcontext";
import { useDashboard } from "../context/Dashboardcontext";
import { leadsData } from "../data/Mockdata";

function FilterSelect({ label, value, onChange, options, placeholder, icon }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
        <span className="text-slate-500">{icon}</span>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 rounded-xl text-sm text-white outline-none transition-all duration-200 pr-8 truncate"
          style={{
            background: value ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.06)",
            border: value ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
            fontFamily: "inherit",
            color: value ? "#c7d2fe" : "#64748b",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ background: "#1e293b", color: "white" }}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function FiltersPanel() {
  const { filters, updateFilter, resetFilters } = useDashboard();
  const { isAdmin, currentUser } = useAuth();
  const hasAnyFilter = Object.values(filters).some(Boolean);

  // For managers, filter counsellors to only their team
  const availableCounsellors = isAdmin
    ? counsellors
    : teamMapping.filter(t => t.managerName === currentUser?.managerName).map(t => t.counsellorName);

  // Filter cities based on selected state
  const availableCities = filters.state
    ? [...new Set(
        // eslint-disable-next-line no-undef
       leadsData
          .filter(l => l.state === filters.state)
          .map(l => l.city)
      )].sort()
    : cities;

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold">Filters</span>
          {hasAnyFilter && (
            <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </div>
        {hasAnyFilter && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear all
          </button>
        )}
      </div>

      <div className={`grid gap-3 ${isAdmin ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 lg:grid-cols-4"}`}>
        <FilterSelect
          label="State"
          value={filters.state}
          onChange={v => { updateFilter("state", v); updateFilter("city", ""); }}
          options={states}
          placeholder="All States"
          icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <FilterSelect
          label="City"
          value={filters.city}
          onChange={v => updateFilter("city", v)}
          options={availableCities}
          placeholder="All Cities"
          icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <FilterSelect
          label="Program"
          value={filters.program}
          onChange={v => updateFilter("program", v)}
          options={programs}
          placeholder="All Programs"
          icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <FilterSelect
          label="Lead Owner"
          value={filters.counsellor}
          onChange={v => updateFilter("counsellor", v)}
          options={availableCounsellors}
          placeholder="All Counsellors"
          icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        {isAdmin && (
          <FilterSelect
            label="Manager"
            value={filters.manager}
            onChange={v => updateFilter("manager", v)}
            options={managers}
            placeholder="All Managers"
            icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        )}
      </div>
    </div>
  );
}