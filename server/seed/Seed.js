import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { pool } from '../config/Database.js';
import { initSchema } from '../config/schema.js';
import fs from 'fs';



const clean = (v) => (v == null ? null : String(v).trim() || null);

const parseDate = (v) => {
  if (!v) return null;
  if (typeof v === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(v);
    if (!date) return null;
    return `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`;
  }
  const d = new Date(v);
  if (isNaN(d)) return null;
  return d.toISOString().split('T')[0];
};

const normalizeStatus = (s) => {
  if (!s) return 'Lead';
  const v = s.toLowerCase().trim();
  if (v.includes('admission')) return 'Admission';
  if (v.includes('application') || v.includes('applied')) return 'Application';
  return 'Lead';
};


const seed = async () => {
  // Find xlsx file
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf('--file');
  let xlsxPath = fileIdx >= 0 ? args[fileIdx + 1] : null;

  if (!xlsxPath) {
    // Auto-detect in project root
    const candidates = fs.readdirSync(path.join(__dirname, "../../server/")).filter(f => f.endsWith('.xlsx'));
    if (candidates.length) xlsxPath = path.join(__dirname, '../../server/', candidates[0]);
  }

  if (!xlsxPath || !fs.existsSync(xlsxPath)) {
    console.log('⚠️  No Excel file found. Creating demo data instead...');
    await seedDemoData();
    return;
  }

  console.log(`📂 Reading workbook: ${xlsxPath}`);
  const wb = XLSX.readFile(xlsxPath);

  // Identify sheets (flexible matching)
  const sheetNames = wb.SheetNames;
  console.log('📋 Sheets found:', sheetNames);

  const findSheet = (keywords) =>
    sheetNames.find((n) => keywords.some((k) => n.toLowerCase().includes(k)));

  const leadsSheet   = findSheet(['lead']);
  const appsSheet    = findSheet(['application', 'app']);
  const teamSheet    = findSheet(['team', 'mapping', 'counsellor']);

  await initSchema();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Clear existing data (order matters for FK constraints)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE applications');
    await conn.query('TRUNCATE TABLE leads');
    await conn.query('TRUNCATE TABLE counsellors');
    await conn.query('DELETE FROM managers WHERE role = "manager"');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // ── 1. Team Mapping ──────────────────────────────────────────────────────
    const managerMap = {}; // name → id
    const counsellorMap = {}; // name → id

    if (teamSheet) {
      const teamData = XLSX.utils.sheet_to_json(wb.Sheets[teamSheet]);
      console.log(`👥 Processing ${teamData.length} team mapping rows...`);

      // Collect unique managers
      const uniqueManagers = [...new Set(teamData.map(r =>
        clean(r['Manager Name'] || r['Manager'] || r['manager_name'])
      ).filter(Boolean))];

      for (const name of uniqueManagers) {
        const email = `${name.toLowerCase().replace(/\s+/g,'.').replace(/[^a-z.]/g,'')}@university.internal`;
        const hash = await bcrypt.hash('Manager@123', 10);
        const [res] = await conn.query(
          `INSERT INTO managers (name, email, password_hash, role)
           VALUES (?, ?, ?, 'manager')
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [name, email, hash]
        );
        const [rows] = await conn.query('SELECT id FROM managers WHERE email = ?', [email]);
        managerMap[name] = rows[0].id;
      }

      // Insert counsellors
      for (const row of teamData) {
        const managerName   = clean(row['Manager Name'] || row['Manager'] || row['manager_name']);
        const counsellorName = clean(row['Counsellor Name'] || row['Counsellor'] || row['Lead Owner']);
        if (!counsellorName) continue;

        const managerId = managerName ? managerMap[managerName] : null;
        await conn.query(
          `INSERT INTO counsellors (name, manager_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE manager_id = VALUES(manager_id)`,
          [counsellorName, managerId]
        );
        const [[{ id }]] = await conn.query('SELECT id FROM counsellors WHERE name = ?', [counsellorName]);
        counsellorMap[counsellorName] = id;
      }
      console.log(`✅ ${Object.keys(managerMap).length} managers, ${Object.keys(counsellorMap).length} counsellors`);
    }

    // ── 2. Leads ─────────────────────────────────────────────────────────────
    if (leadsSheet) {
      const leadsData = XLSX.utils.sheet_to_json(wb.Sheets[leadsSheet]);
      console.log(`📝 Processing ${leadsData.length} leads...`);

      const INSERT_BATCH = 500;
      for (let i = 0; i < leadsData.length; i += INSERT_BATCH) {
        const batch = leadsData.slice(i, i + INSERT_BATCH);
        const values = [];
        const placeholders = [];

        for (const row of batch) {
          const userId        = clean(row['User_id'] || row['UserID'] || row['user_id']);
          if (!userId) continue;

          const ownerName     = clean(row['Lead Owner'] || row['Counsellor']);
          const counsellorId  = ownerName ? (counsellorMap[ownerName] || null) : null;

          // Auto-create counsellor if not in team sheet
          if (ownerName && !counsellorMap[ownerName]) {
            await conn.query(
              'INSERT INTO counsellors (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name',
              [ownerName]
            );
            const [[{ id }]] = await conn.query('SELECT id FROM counsellors WHERE name = ?', [ownerName]);
            counsellorMap[ownerName] = id;
          }

          values.push(
            userId,
            clean(row['Student Name'] || row['Name']),
            clean(row['Student Mobile'] || row['Mobile']),
            clean(row['State']),
            clean(row['City']),
            clean(row['Program Interested'] || row['Program']),
            normalizeStatus(row['Lead Status'] || row['Status']),
            parseDate(row['User Registration Date'] || row['Registration Date']),
            ownerName ? counsellorMap[ownerName] : null
          );
          placeholders.push('(?,?,?,?,?,?,?,?,?)');
        }

        if (placeholders.length) {
          await conn.query(
            `INSERT IGNORE INTO leads
             (user_id, student_name, student_mobile, state, city, program_interested, lead_status, registration_date, counsellor_id)
             VALUES ${placeholders.join(',')}`,
            values
          );
        }
      }
      console.log(`✅ Leads inserted`);
    }

    // ── 3. Applications ──────────────────────────────────────────────────────
    if (appsSheet) {
      const appsData = XLSX.utils.sheet_to_json(wb.Sheets[appsSheet]);
      console.log(`📋 Processing ${appsData.length} applications...`);

      const INSERT_BATCH = 500;
      for (let i = 0; i < appsData.length; i += INSERT_BATCH) {
        const batch = appsData.slice(i, i + INSERT_BATCH);
        const values = [];
        const placeholders = [];

        for (const row of batch) {
          const userId = clean(row['User_id'] || row['UserID'] || row['user_id']);
          if (!userId) continue;

          values.push(
            userId,
            clean(row['Student Name'] || row['Name']),
            clean(row['Student Mobile'] || row['Mobile']),
            clean(row['State']),
            clean(row['City']),
            clean(row['Program Joined'] || row['Program']),
            parseFloat(row['Admission Fee'] || row['admission_fee']) || 0,
            parseFloat(row['Registration Fee'] || row['registration_fee']) || 0
          );
          placeholders.push('(?,?,?,?,?,?,?,?)');
        }

        if (placeholders.length) {
          await conn.query(
            `INSERT IGNORE INTO applications
             (user_id, student_name, student_mobile, state, city, program_joined, admission_fee, registration_fee)
             VALUES ${placeholders.join(',')}`,
            values
          );
        }
      }
      console.log(`✅ Applications inserted`);
    }

    await conn.commit();
    console.log('🌱 Seeding complete!');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    conn.release();
    pool.end();
  }
};


const seedDemoData = async () => {
  await initSchema();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE applications');
    await conn.query('TRUNCATE TABLE leads');
    await conn.query('TRUNCATE TABLE counsellors');
    await conn.query('DELETE FROM managers WHERE role != "admin"');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Demo managers
    const managers = [
      { name: 'Rahul Sharma',  email: 'rahul@university.internal' },
      { name: 'Priya Mehta',   email: 'priya@university.internal' },
      { name: 'Arjun Singh',   email: 'arjun@university.internal' },
    ];
    const managerIds = {};
    for (const m of managers) {
      const hash = await bcrypt.hash('Manager@123', 10);
      await conn.query(
        `INSERT INTO managers (name, email, password_hash, role) VALUES (?,?,?,'manager')
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [m.name, m.email, hash]
      );
      const [[row]] = await conn.query('SELECT id FROM managers WHERE email=?', [m.email]);
      managerIds[m.name] = row.id;
    }

    // Demo counsellors
    const counsellorDefs = [
      { name: 'Anita Verma',    manager: 'Rahul Sharma' },
      { name: 'Deepak Kumar',   manager: 'Rahul Sharma' },
      { name: 'Sunita Patel',   manager: 'Priya Mehta' },
      { name: 'Rohit Gupta',    manager: 'Priya Mehta' },
      { name: 'Kavita Joshi',   manager: 'Arjun Singh' },
      { name: 'Vikram Nair',    manager: 'Arjun Singh' },
    ];
    const counsellorIds = {};
    for (const c of counsellorDefs) {
      await conn.query(
        'INSERT INTO counsellors (name, manager_id) VALUES (?,?) ON DUPLICATE KEY UPDATE manager_id=VALUES(manager_id)',
        [c.name, managerIds[c.manager]]
      );
      const [[row]] = await conn.query('SELECT id FROM counsellors WHERE name=?', [c.name]);
      counsellorIds[c.name] = row.id;
    }

    // Generate 500 demo leads
    const states = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Uttar Pradesh','Gujarat','Rajasthan','West Bengal'];
    const cities = {
      Maharashtra: ['Mumbai','Pune','Nagpur'], Delhi: ['Delhi','Noida','Gurgaon'],
      Karnataka: ['Bangalore','Mysore'], 'Tamil Nadu': ['Chennai','Coimbatore'],
      'Uttar Pradesh': ['Lucknow','Kanpur'], Gujarat: ['Ahmedabad','Surat'],
      Rajasthan: ['Jaipur','Jodhpur'], 'West Bengal': ['Kolkata','Howrah'],
    };
    const programs = ['MBA','B.Tech','BBA','MCA','B.Com','BCA','M.Tech','B.Sc'];
    const statuses = ['Lead','Lead','Lead','Application','Application','Admission'];
    const counsellorNames = Object.keys(counsellorIds);

    const leadsValues = [];
    const leadsPlaceholders = [];
    for (let i = 1; i <= 500; i++) {
      const state = states[i % states.length];
      const citiesForState = cities[state];
      const city = citiesForState[i % citiesForState.length];
      const counsellorName = counsellorNames[i % counsellorNames.length];
      const status = statuses[i % statuses.length];
      const date = new Date(2024, Math.floor(i/50) % 12, (i % 28) + 1);

      leadsValues.push(
        `USR${String(i).padStart(5,'0')}`,
        `Student ${i}`,
        `9${String(1000000000 + i).slice(1)}`,
        state, city,
        programs[i % programs.length],
        status,
        date.toISOString().split('T')[0],
        counsellorIds[counsellorName]
      );
      leadsPlaceholders.push('(?,?,?,?,?,?,?,?,?)');
    }
    await conn.query(
      `INSERT IGNORE INTO leads (user_id,student_name,student_mobile,state,city,program_interested,lead_status,registration_date,counsellor_id)
       VALUES ${leadsPlaceholders.join(',')}`,
      leadsValues
    );

    // Applications for status = Application or Admission
    const [appLeads] = await conn.query(
      `SELECT user_id,student_name,student_mobile,state,city,program_interested,lead_status FROM leads WHERE lead_status IN ('Application','Admission')`
    );
    if (appLeads.length) {
      const appValues = [];
      const appPlaceholders = [];
      for (const l of appLeads) {
        appValues.push(
          l.user_id, l.student_name, l.student_mobile, l.state, l.city,
          l.lead_status === 'Admission' ? l.program_interested : null,
          l.lead_status === 'Admission' ? 25000 : 0,
          500
        );
        appPlaceholders.push('(?,?,?,?,?,?,?,?)');
      }
      await conn.query(
        `INSERT IGNORE INTO applications (user_id,student_name,student_mobile,state,city,program_joined,admission_fee,registration_fee)
         VALUES ${appPlaceholders.join(',')}`,
        appValues
      );
    }

    await conn.commit();
    console.log('🌱 Demo data seeded: 500 leads, managers, counsellors');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Demo seed failed:', err);
  } finally {
    conn.release();
    pool.end();
  }
};


const ensureAdmin = async () => {
  const conn = await pool.getConnection();
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await conn.query(
      `INSERT INTO managers (name, email, password_hash, role)
       VALUES ('Admin', 'admin@university.internal', ?, 'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [hash]
    );
    console.log('👤 Admin user ready: admin@university.internal / Admin@123');
  } finally {
    conn.release();
  }
};

(async () => {
  try {
    await initSchema();
    await ensureAdmin();
    await seed();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();