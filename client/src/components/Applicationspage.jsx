import { useState, useMemo } from "react";
import { programs, leadsData, applicationsData, teamMapping } from "../data/mockdata";
import { useAuth } from "../context/Authcontext";

const PROG_COLORS = {
  MBA:      { bg: "rgba(99,102,241,0.15)",  text: "#a5b4fc" },
  "B.Tech": { bg: "rgba(6,182,212,0.15)",   text: "#67e8f9" },
  MCA:      { bg: "rgba(16,185,129,0.15)",  text: "#6ee7b7" },
  BCA:      { bg: "rgba(245,158,11,0.15)",  text: "#fcd34d" },
};

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ec4899"];
const PAGE_SIZE = 10;

function FeeChip({ amount, label }) {
  const paid = amount > 0;
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold" style={{ color: paid ? "#34d399" : "#475569" }}>
        {paid ? `₹${amount.toLocaleString("en-IN")}` : "—"}
      </span>
      <span className="text-xs" style={{ color: "#475569" }}>{label}</span>
    </div>
  );
}

export default function ApplicationsPage() {
  const { currentUser, isAdmin } = useAuth();

  // Merge leads with application data
  const merged = useMemo(() => {
    return leadsData
      .filter(l => l.leadStatus === "Application" || l.leadStatus === "Admission")
      .map(l => {
        const app = applicationsData.find(a => a.user_id === l.user_id) || {};
        return { ...l, ...app, programJoined: app.programJoined || null, admissionFee: app.admissionFee || 0, registrationFee: app.registrationFee || 500 };
      });
  }, []);

  // RBAC
  const scoped = useMemo(() => {
    if (isAdmin) return merged;
    const myCounsellors = teamMapping
      .filter(t => t.managerName === currentUser?.managerName)
      .map(t => t.counsellorName);
    return merged.filter(a => myCounsellors.includes(a.leadOwner));
  }, [isAdmin, currentUser, merged]);

  const [search, setSearch]      = useState("");
  const [filterStatus, setStatus] = useState("All");
  const [filterProg, setFProg]   = useState("All");
  const [sortKey, setSortKey]    = useState("registrationDate");
  const [sortDir, setSortDir]    = useState("desc");
  const [page, setPage]          = useState(1);
  const [selected, setSelected]  = useState(null);

  const filtered = useMemo(() => {
    return scoped.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.studentName.toLowerCase().includes(q) || a.user_id.toLowerCase().includes(q) || a.leadOwner.toLowerCase().includes(q);
      const matchStatus = filterStatus === "All" || a.leadStatus === filterStatus;
      const matchProg   = filterProg   === "All" || a.programInterested === filterProg;
      return matchSearch && matchStatus && matchProg;
    });
  }, [scoped, search, filterStatus, filterProg]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      if (sortDir === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ col }) => (
    <svg className="w-3 h-3 inline ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {sortKey === col && sortDir === "asc"
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
        : sortKey === col && sortDir === "desc"
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        : <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
      }
    </svg>
  );

  // Revenue stats
  const totalRegFees = scoped.reduce((s, a) => s + (a.registrationFee || 0), 0);
  const totalAdmFees = scoped.reduce((s, a) => s + (a.admissionFee || 0), 0);
  const admitted     = scoped.filter(a => a.leadStatus === "Admission");
  const inProgress   = scoped.filter(a => a.leadStatus === "Application");

  const statCards = [
    { label: "Total Applications", value: scoped.length.toString(), color: "#8b5cf6", sub: "In pipeline" },
    { label: "Admitted", value: admitted.length.toString(), color: "#10b981", sub: "Fully enrolled" },
    { label: "In Progress", value: inProgress.length.toString(), color: "#f59e0b", sub: "Form submitted" },
    { label: "Reg. Fee Collected", value: `₹${totalRegFees.toLocaleString("en-IN")}`, color: "#06b6d4", sub: "@ ₹500 each" },
    { label: "Admission Revenue", value: `₹${(totalAdmFees / 100000).toFixed(1)}L`, color: "#6366f1", sub: "Total fee collected" },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-5 gap-4" style={{ background: "#080f1e" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Sora',sans-serif" }}>Applications</h2>
          <p className="text-slate-500 text-sm mt-0.5">Students who paid the registration fee and entered the admission pipeline</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span className="text-amber-400 text-xs font-medium">View Only</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {statCards.map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color }}/>
              <span className="text-slate-400 text-xs font-medium">{label}</span>
            </div>
            <p className="text-white text-xl font-bold" style={{ fontFamily: "'Sora',sans-serif", letterSpacing: "-0.02em" }}>{value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Search student, ID, owner…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }}/>
        </div>
        {["All","Application","Admission"].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={filterStatus === s
              ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }
            }>{s}</button>
        ))}
        <select value={filterProg} onChange={e => { setFProg(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl text-xs outline-none"
          style={{ background: filterProg !== "All" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: filterProg !== "All" ? "#c7d2fe" : "#64748b", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="All">All Programs</option>
          {programs.map(p => <option key={p} value={p} style={{ background: "#1e293b" }}>{p}</option>)}
        </select>
        <span className="ml-auto text-slate-500 text-xs">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {[
                  { label: "Student", key: "studentName" },
                  { label: "ID", key: "user_id" },
                  { label: "Program Applied", key: "programInterested" },
                  { label: "Program Joined", key: "programJoined" },
                  { label: "Lead Owner", key: "leadOwner" },
                  { label: "Reg. Fee", key: "registrationFee" },
                  { label: "Admission Fee", key: "admissionFee" },
                  { label: "Stage", key: "leadStatus" },
                ].map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                    style={{ color: sortKey === col.key ? "#a5b4fc" : "#475569" }}>
                    {col.label}<SortIcon col={col.key}/>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-500 text-sm">No applications found</td></tr>
              ) : pageData.map((app, i) => {
                const pc  = PROG_COLORS[app.programInterested] || { bg: "rgba(255,255,255,0.08)", text: "#94a3b8" };
                const pjc = app.programJoined ? (PROG_COLORS[app.programJoined] || pc) : null;
                const idx = i % AVATAR_COLORS.length;
                const init = app.studentName.split(" ").map(n => n[0]).join("").slice(0, 2);
                const isAdmitted = app.leadStatus === "Admission";
                return (
                  <tr key={app.user_id}
                    onClick={() => setSelected(selected?.user_id === app.user_id ? null : app)}
                    className="cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: selected?.user_id === app.user_id ? "rgba(99,102,241,0.08)" : "transparent" }}
                    onMouseEnter={e => { if (selected?.user_id !== app.user_id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { if (selected?.user_id !== app.user_id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: AVATAR_COLORS[idx] + "33", border: `1px solid ${AVATAR_COLORS[idx]}40`, color: AVATAR_COLORS[idx] }}>{init}</div>
                        <div>
                          <p className="text-white text-sm font-medium whitespace-nowrap">{app.studentName}</p>
                          <p className="text-slate-500 text-xs">{app.state}, {app.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{app.user_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: pc.bg, color: pc.text }}>{app.programInterested}</span>
                    </td>
                    <td className="px-4 py-3">
                      {app.programJoined
                        ? <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: pjc.bg, color: pjc.text }}>{app.programJoined}</span>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{app.leadOwner}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: "#34d399" }}>₹{(app.registrationFee || 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmitted && app.admissionFee > 0
                        ? <span className="text-xs font-bold" style={{ color: "#a5b4fc" }}>₹{app.admissionFee.toLocaleString("en-IN")}</span>
                        : <span className="text-slate-600 text-xs">Pending</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={isAdmitted
                          ? { background: "rgba(16,185,129,0.15)", color: "#6ee7b7" }
                          : { background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }
                        }>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: isAdmitted ? "#10b981" : "#8b5cf6" }}/>
                        {app.leadStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-slate-500 text-xs">Page {page} of {totalPages} · {filtered.length} total</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>‹ Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={p === page
                  ? { background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)", color: "#a5b4fc" }
                  : { background: "rgba(255,255,255,0.06)", color: "#64748b" }
                }>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>Next ›</button>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-80 flex flex-col shadow-2xl z-50"
          style={{ background: "#0d1628", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-white font-bold text-base" style={{ fontFamily: "'Sora',sans-serif" }}>Application Detail</h3>
            <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff" }}>
                {selected.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-base">{selected.studentName}</p>
                <p className="text-slate-400 text-sm font-mono">{selected.user_id}</p>
              </div>
            </div>
            {/* Fee Summary */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fee Summary</p>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Registration Fee</span>
                <span className="text-emerald-400 text-sm font-bold">₹{(selected.registrationFee || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Admission Fee</span>
                <span className="text-sm font-bold" style={{ color: selected.admissionFee > 0 ? "#a5b4fc" : "#475569" }}>
                  {selected.admissionFee > 0 ? `₹${selected.admissionFee.toLocaleString("en-IN")}` : "Not paid"}
                </span>
              </div>
              <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }}/>
              <div className="flex justify-between">
                <span className="text-white text-sm font-semibold">Total</span>
                <span className="text-white text-sm font-bold">₹{((selected.registrationFee || 0) + (selected.admissionFee || 0)).toLocaleString("en-IN")}</span>
              </div>
            </div>
            {[
              { label: "State / City", value: `${selected.state}, ${selected.city}` },
              { label: "Program Applied", value: selected.programInterested },
              { label: "Program Joined", value: selected.programJoined || "Not yet enrolled" },
              { label: "Lead Owner", value: selected.leadOwner },
              { label: "Current Stage", value: selected.leadStatus },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
                <span className="text-slate-200 text-sm text-right font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}