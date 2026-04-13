import API from "./API";


// MATRIX
export const getMatrixData = async () => {
  try {
    const res = await API.get("/dashboard/metrics");
    return res.data;
  } catch (err) {
    console.error("Matrix data error:", err);
    return {
      success: false,
      message: "Failed to fetch matrix data. Please try again.",
    };
  }
};


// router.get('/metrics', getMetrics);
// router.get('/filters', getFilterOptions);
// router.get('/table', getLeadsTable);
// router.get('/chart', getChartData);


// CHART
export const getChartData = async (filters) => {
  try {
    const res = await API.get("/dashboard/chart", { params: filters });
    return res.data;
  } catch (err) {
    console.error("Chart data error:", err);
    return {
        success: false,
        message: "Failed to fetch chart data. Please try again.",
        };
    }   
};

// FILTER OPTIONS
export const getFilterOptions = async () => {
  try {
    const res = await API.get("/dashboard/filters");
    return res.data;
  } catch (err) {
    console.error("Filter options error:", err);
    return {
      success: false,
      message: "Failed to fetch filter options. Please try again.",
    };
  }
}

// LEADS TABLE          
export const getLeadsTable = async (filters) => {       
    try {       
        const res = await API.get("/dashboard/table", { params: filters });
        return res.data;
    } catch (err) {
        console.error("Leads table error:", err);
        return {
            success: false,
            message: "Failed to fetch leads table data. Please try again.",
        };
    }
};