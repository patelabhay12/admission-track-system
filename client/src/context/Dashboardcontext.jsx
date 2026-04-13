import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getMatrixData,
  getChartData,
  getFilterOptions,
  getLeadsTable,
} from "../services/dashboardService";
import { useAuth } from "./Authcontext";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { currentUser, isAdmin } = useAuth();

  const [filters, setFilters] = useState({
    state: "",
    city: "",
    program: "",
    counsellor: "",
    manager: "",
  });

  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [recentLeads, setRecentLeads] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 MAIN DATA FETCH FUNCTION
  const fetchDashboard = useCallback(async (activeFilters = filters) => {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      // 🔐 Attach role-based filters automatically
      let finalFilters = { ...activeFilters };

      if (!isAdmin) {
        finalFilters.manager = currentUser?.name; // adjust if needed
      }

      // 🚀 Parallel API calls
      const [matrixRes, chartRes, filterRes, tableRes] = await Promise.all([
        getMatrixData(),
        getChartData(finalFilters),
        getFilterOptions(),
        getLeadsTable(finalFilters),
      ]);

      // ✅ MATRIX (KPIs)
      if (matrixRes.success !== false) {
        setMetrics(matrixRes.data || matrixRes);
      }

      // ✅ CHART DATA
      if (chartRes.success !== false) {
        setChartData(chartRes.data || chartRes);
      }

      // ✅ FILTER OPTIONS
      if (filterRes.success !== false) {
        setFilterOptions(filterRes.data || filterRes);
      }

      // ✅ TABLE (Recent Leads)
      if (tableRes.success !== false) {
        setRecentLeads(tableRes.data || tableRes);
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, filters]);

  // 🔄 AUTO LOAD
  useEffect(() => {
    fetchDashboard(filters);
  }, [currentUser, filters, fetchDashboard]);

  // 🔁 UPDATE FILTER
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // 🔁 RESET FILTERS
  const resetFilters = useCallback(() => {
    setFilters({
      state: "",
      city: "",
      program: "",
      counsellor: "",
      manager: "",
    });
  }, []);

  // 🔁 MANUAL REFRESH
  const reload = () => fetchDashboard(filters);

  return (
    <DashboardContext.Provider
      value={{
        filters,
        updateFilter,
        resetFilters,

        metrics,
        chartData,
        filterOptions,
        recentLeads,

        loading,
        error,

        reload,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// HOOK
// eslint-disable-next-line react-refresh/only-export-components
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}