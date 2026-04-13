import { pool } from "../config/Database.js";

/**
 * Build the WHERE clause and params for filtered queries.
 * Managers can only see data for counsellors in their team.
 */
const buildFilters = async (user, query) => {
  const conditions = [];
  const params = [];

  // RBAC: Manager can only see their counsellors
  if (user.role === "manager") {
    const [counsellorRows] = await pool.query(
      "SELECT id FROM counsellors WHERE manager_id = ?",
      [user.id],
    );
    const counsellorIds = counsellorRows.map((r) => r.id);
    if (!counsellorIds.length) {
      return { conditions: ["1 = 0"], params: [] }; // No data visible
    }
    conditions.push(
      `l.counsellor_id IN (${counsellorIds.map(() => "?").join(",")})`,
    );
    params.push(...counsellorIds);
  }

  // Admin filter by manager
  if (user.role === "admin" && query.manager_id) {
    const [counsellorRows] = await pool.query(
      "SELECT id FROM counsellors WHERE manager_id = ?",
      [query.manager_id],
    );
    const counsellorIds = counsellorRows.map((r) => r.id);
    if (!counsellorIds.length) {
      return { conditions: ["1 = 0"], params: [] };
    }
    conditions.push(
      `l.counsellor_id IN (${counsellorIds.map(() => "?").join(",")})`,
    );
    params.push(...counsellorIds);
  }

  if (query.state) {
    conditions.push("l.state = ?");
    params.push(query.state);
  }
  if (query.city) {
    conditions.push("l.city = ?");
    params.push(query.city);
  }
  if (query.program_interested) {
    conditions.push("l.program_interested = ?");
    params.push(query.program_interested);
  }
  if (query.counsellor_id) {
    conditions.push("l.counsellor_id = ?");
    params.push(query.counsellor_id);
  }

  return { conditions, params };
};

/**
 * GET /api/dashboard/metrics
 * Returns 6 KPIs with optional filters applied
 */
const getMetrics = async (req, res) => {
  try {
    const { conditions, params } = await buildFilters(
      { ...req.user, role: "admin" },
      req.query,
    );

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const buildWhereWithExtra = (extra) =>
      conditions.length
        ? `WHERE ${[...conditions, extra].join(" AND ")}`
        : `WHERE ${extra}`;

    // ✅ METRICS
    const metricsQuery = `
      SELECT
        COUNT(DISTINCT l.user_id) AS total_leads,
        COUNT(DISTINCT CASE 
          WHEN l.lead_status IN ('Application','Admission') 
          THEN l.user_id END) AS total_applications,
        COUNT(DISTINCT CASE 
          WHEN l.lead_status = 'Admission' 
          THEN l.user_id END) AS total_admissions,

        ROUND(
          COUNT(DISTINCT CASE 
            WHEN l.lead_status IN ('Application','Admission') 
            THEN l.user_id END
          ) / NULLIF(COUNT(DISTINCT l.user_id), 0) * 100, 2
        ) AS lead_to_application,

        ROUND(
          COUNT(DISTINCT CASE 
            WHEN l.lead_status = 'Admission' 
            THEN l.user_id END
          ) / NULLIF(COUNT(DISTINCT l.user_id), 0) * 100, 2
        ) AS lead_to_admission,

        ROUND(
          COUNT(DISTINCT CASE 
            WHEN l.lead_status = 'Admission' 
            THEN l.user_id END
          ) / NULLIF(
            COUNT(DISTINCT CASE 
              WHEN l.lead_status IN ('Application','Admission') 
              THEN l.user_id END
            ), 0
          ) * 100, 2
        ) AS application_to_admission

      FROM leads l
      ${whereClause}
    `;

    const [metricRows] = await pool.query(metricsQuery, params);
    const m = metricRows[0];

    // ✅ PROGRAM BREAKDOWN
    const [programRows] = await pool.query(
      `SELECT
        l.program_interested AS program,
        COUNT(*) AS leads,
        SUM(CASE WHEN l.lead_status = 'Admission' THEN 1 ELSE 0 END) AS admissions
       FROM leads l
       ${buildWhereWithExtra("l.program_interested IS NOT NULL")}
       GROUP BY l.program_interested
       ORDER BY leads DESC`,
      params,
    );

    // ✅ COUNSELLOR DATA
    const [counsellorRows] = await pool.query(
      `SELECT
        c.name,
        COUNT(*) AS leads,
        SUM(CASE WHEN l.lead_status IN ('Application','Admission') THEN 1 ELSE 0 END) AS applications,
        SUM(CASE WHEN l.lead_status = 'Admission' THEN 1 ELSE 0 END) AS admissions
       FROM leads l
       JOIN counsellors c ON l.counsellor_id = c.id
       ${whereClause}
       GROUP BY c.id, c.name
       ORDER BY admissions DESC
       LIMIT 6`,
      params,
    );

    // ✅ TOP STATES (🔥 NEW)
    const [stateRows] = await pool.query(
      `SELECT
        l.state AS name,
        COUNT(*) AS count
       FROM leads l
       ${buildWhereWithExtra("l.state IS NOT NULL")}
       GROUP BY l.state
       ORDER BY count DESC
       LIMIT 5`,
      params,
    );

    // ✅ FINAL RESPONSE
    res.json({
      success: true,
      data: {
        totalLeads: Number(m.total_leads) || 0,
        totalApplications: Number(m.total_applications) || 0,
        totalAdmissions: Number(m.total_admissions) || 0,
        leadToApp: Number(m.lead_to_application) || 0,
        leadToAdm: Number(m.lead_to_admission) || 0,
        appToAdm: Number(m.application_to_admission) || 0,

        programBreakdown: programRows.map((r) => ({
          program: r.program,
          leads: Number(r.leads),
          admissions: Number(r.admissions),
        })),

        counsellorData: counsellorRows.map((r) => ({
          name: r.name,
          leads: Number(r.leads),
          applications: Number(r.applications),
          admissions: Number(r.admissions),
        })),

        // 🔥 NEW
        topStates: stateRows.map((r) => ({
          state: r.name,
          count: Number(r.count),
        })),
      },
    });
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/dashboard/filters
 * Returns available filter options (state, city, program, counsellor, manager)
 */
const getFilterOptions = async (req, res) => {
  try {
    const baseFilters = await buildFilters(
      { ...req.user, role: "admin" },
      req.query,
    );

    // STATES
    const stateConditions = [...baseFilters.conditions, "state IS NOT NULL"];
    const stateWhere = stateConditions.length
      ? `WHERE ${stateConditions.join(" AND ")}`
      : "";

    const [states] = await pool.query(
      `SELECT DISTINCT state FROM leads l ${stateWhere} ORDER BY state`,
      baseFilters.params,
    );

    // CITIES
    const cityConditions = [...baseFilters.conditions, "city IS NOT NULL"];
    const cityWhere = cityConditions.length
      ? `WHERE ${cityConditions.join(" AND ")}`
      : "";

    const [cities] = await pool.query(
      `SELECT DISTINCT city FROM leads l ${cityWhere} ORDER BY city`,
      baseFilters.params,
    );

    // PROGRAMS
    const programConditions = [
      ...baseFilters.conditions,
      "program_interested IS NOT NULL",
    ];
    const programWhere = programConditions.length
      ? `WHERE ${programConditions.join(" AND ")}`
      : "";

    const [programs] = await pool.query(
      `SELECT DISTINCT program_interested FROM leads l ${programWhere} ORDER BY program_interested`,
      baseFilters.params,
    );

    // COUNSELLORS
    const counsellorConditions = [
      ...baseFilters.conditions,
      "c.name IS NOT NULL",
    ];
    const counsellorWhere = counsellorConditions.length
      ? `WHERE ${counsellorConditions.join(" AND ")}`
      : "";

    const [counsellors] = await pool.query(
      `SELECT DISTINCT c.id, c.name
   FROM leads l
   JOIN counsellors c ON l.counsellor_id = c.id
   ${counsellorWhere}
   ORDER BY c.name`,
      baseFilters.params,
    );

    const response = {
      states: states.map((r) => r.state),
      cities: cities.map((r) => r.city),
      programs: programs.map((r) => r.program_interested),
      counsellors: counsellors.map((r) => ({ id: r.id, name: r.name })),
    };
    // Admin also gets manager list
    if ("admin" === "admin") {
      const [managers] = await pool.query(
        `SELECT id, name FROM managers WHERE role = 'manager' ORDER BY name`,
      );
      response.managers = managers.map((r) => ({ id: r.id, name: r.name }));
    }

    res.json({ success: true, data: response });
  } catch (err) {
    console.error("Filter options error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/dashboard/table
 * Returns paginated leads table with filters
 */
const getLeadsTable = async (req, res) => {
  try {
    const { conditions, params } = await buildFilters(
      { ...req.user, role: "admin" },
      req.query,
    );
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) AS total FROM leads l ${whereClause}`;
    const [[{ total }]] = await pool.query(countSql, params);

    const dataSql = `
      SELECT
        l.user_id, l.student_name, l.state, l.city,
        l.program_interested, l.lead_status, l.registration_date,
        c.name AS counsellor_name,
        m.name AS manager_name
      FROM leads l
      LEFT JOIN counsellors c ON l.counsellor_id = c.id
      LEFT JOIN managers m ON c.manager_id = m.id
      ${whereClause}
      ORDER BY l.registration_date DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    res.json({
      success: true,
      data: rows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Table error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/dashboard/chart
 * Returns status breakdown for the funnel chart
 */
const getChartData = async (req, res) => {
  try {
    const baseFilters = await buildFilters(
      { ...req.user, role: "admin" },
      req.query,
    );

    const buildWhere = (conditions) =>
      conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // ✅ STATUS BREAKDOWN
    const statusWhere = buildWhere(baseFilters.conditions);

    const [statusBreakdown] = await pool.query(
      `SELECT l.lead_status, COUNT(*) AS count
       FROM leads l
       ${statusWhere}
       GROUP BY l.lead_status`,
      baseFilters.params,
    );

    // ✅ TOP PROGRAMS
    const programWhere = buildWhere([
      ...baseFilters.conditions,
      "l.program_interested IS NOT NULL",
    ]);

    const [topPrograms] = await pool.query(
      `SELECT l.program_interested AS name, COUNT(*) AS count
       FROM leads l
       ${programWhere}
       GROUP BY l.program_interested
       ORDER BY count DESC
       LIMIT 8`,
      baseFilters.params,
    );

    // ✅ TOP STATES
    const stateWhere = buildWhere([
      ...baseFilters.conditions,
      "l.state IS NOT NULL",
    ]);

    const [topStates] = await pool.query(
      `SELECT l.state AS name, COUNT(*) AS count
       FROM leads l
       ${stateWhere}
       GROUP BY l.state
       ORDER BY count DESC
       LIMIT 8`,
      baseFilters.params,
    );

    res.json({
      success: true,
      data: {
        statusBreakdown,
        topPrograms,
        topStates,
      },
    });
  } catch (err) {
    console.error("Chart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getMetrics, getFilterOptions, getLeadsTable, getChartData };
