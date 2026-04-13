import { pool } from './Database.js';

const initSchema = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Managers (internal users)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS managers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Counsellors (lead owners)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS counsellors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        manager_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE SET NULL
      )
    `);

    // Leads
    await conn.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        student_name VARCHAR(255),
        student_mobile VARCHAR(20),
        state VARCHAR(100),
        city VARCHAR(100),
        program_interested VARCHAR(255),
        lead_status ENUM('Lead', 'Application', 'Admission') NOT NULL DEFAULT 'Lead',
        registration_date DATE,
        counsellor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE SET NULL,
        INDEX idx_state (state),
        INDEX idx_city (city),
        INDEX idx_program (program_interested),
        INDEX idx_lead_status (lead_status),
        INDEX idx_counsellor (counsellor_id)
      )
    `);

    // Applications
    await conn.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        student_name VARCHAR(255),
        student_mobile VARCHAR(20),
        state VARCHAR(100),
        city VARCHAR(100),
        program_joined VARCHAR(255),
        admission_fee DECIMAL(10,2) DEFAULT 0,
        registration_fee DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES leads(user_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);

    await conn.commit();
    console.log('✅ Schema initialized successfully');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Schema init error:', err.message);
    throw err;
  } finally {
    conn.release();
  }
};

export { initSchema };