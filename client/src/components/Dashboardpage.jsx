import { DashboardProvider } from "../context/Dashboardcontext";
import CounsellorPerformance from "./Counsellorperformance";
import FiltersPanel from "./Filterspanel";
import KPIMetrics from "./Kpimetrics";
import ProgramBreakdown from "./Programbreakdown";
import RecentLeads from "./Recentleads";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TopStates from "./Topstates";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "#080f1e", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          {/* Main content */}
          <main className="flex-1 overflow-hidden p-4 flex flex-col gap-3">
            {/* KPI Row */}
            <KPIMetrics />

            {/* Filters */}
            <FiltersPanel />

            {/* Charts + Table Row */}
            <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
              {/* Program Breakdown */}
              <div className="col-span-12 lg:col-span-3 min-h-0">
                <ProgramBreakdown />
              </div>

              {/* Counsellor Performance */}
              <div className="col-span-12 lg:col-span-3 min-h-0">
                <CounsellorPerformance />
              </div>

              {/* Top States */}
              <div className="col-span-12 lg:col-span-2 min-h-0">
                <TopStates />
              </div>

              {/* Recent Leads */}
              <div className="col-span-12 lg:col-span-4 min-h-0 overflow-auto">
                <RecentLeads />
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}