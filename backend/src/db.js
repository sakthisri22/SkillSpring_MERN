import mysql from 'mysql2/promise';

const parsedUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
const ssl = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: true, ca: process.env.DB_SSL_CA || undefined }
  : undefined;
const connectionOptions = parsedUrl
  ? { host: parsedUrl.hostname, port: Number(parsedUrl.port || 3306), user: decodeURIComponent(parsedUrl.username), password: decodeURIComponent(parsedUrl.password), database: parsedUrl.pathname.replace(/^\//, ''), ssl }
  : { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'skillspring', ssl, waitForConnections: true, connectionLimit: 10, queueLimit: 0 };
const rawPool = mysql.createPool({ ...connectionOptions, waitForConnections: true, connectionLimit: 10, queueLimit: 0, decimalNumbers: true });

function mysqlSql(sql, params=[]) {
  let returning = null;
  const ret = sql.match(/\s+RETURNING\s+(\*|[a-zA-Z_][\w]*)\s*;?$/i);
  if (ret) { returning = ret[1]; sql = sql.slice(0, ret.index); }
  sql = sql.replace(/\$([0-9]+)/g, (_, n) => '?').replace(/::jsonb/gi, '').replace(/\bILIKE\b/gi, 'LIKE');
  sql = sql.replace(/ON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\s+([\w]+)\s*=\s*EXCLUDED\.([\w]+)/i, 'ON DUPLICATE KEY UPDATE $1=VALUES($2)');
  const indexes = [...sql.matchAll(/\$(\d+)/g)].map(m => Number(m[1]));
  // Placeholder order is determined from the original SQL, including repeated placeholders.
  const originalIndexes = [...arguments[0].matchAll(/\$(\d+)/g)].map(m => Number(m[1]));
  const ordered = originalIndexes.map(i => params[i-1]);
  return { sql, ordered, returning };
}
export const pool = {
  async query(sql, params=[]) {
    const original = sql;
    const { sql: statement, ordered, returning } = mysqlSql(original, params);
    const [result] = await rawPool.execute(statement, ordered);
    if (Array.isArray(result)) return { rows: result, rowCount: result.length };
    let rows = [];
    if (returning) {
      let id = result.insertId;
      const table = /^\s*INSERT\s+INTO\s+([a-z_]+)/i.exec(statement)?.[1] || /^\s*UPDATE\s+([a-z_]+)/i.exec(statement)?.[1];
      if (!id && /\bUPDATE\b/i.test(statement)) {
        const m = original.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
        if (m) id = params[Number(m[1])-1];
      }
      if (id && table) {
        const [found] = await rawPool.execute(`SELECT ${returning === '*' ? '*' : returning} FROM ${table} WHERE id=?`, [id]);
        rows = found;
      } else if (table && /INSERT\s+INTO\s+(enrolments|certificates)/i.test(statement)) {
        const learner = params[0], course = params[1];
        const [found] = await rawPool.execute(`SELECT ${returning === '*' ? '*' : returning} FROM ${table} WHERE learner_id=? AND course_id=?`, [learner, course]);
        rows = found;
      }
    }
    return { rows, rowCount: result.affectedRows ?? 0, insertId: result.insertId };
  },
  end: () => rawPool.end()
};
export async function initDb() {
  const database = connectionOptions.database;
  if (process.env.DB_AUTO_CREATE !== 'false') {
    const bootstrap = await mysql.createConnection({
      host: connectionOptions.host,
      port: connectionOptions.port,
      user: connectionOptions.user,
      password: connectionOptions.password,
      ssl
    });
    try {
      await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '``')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } finally {
      await bootstrap.end();
    }
  }
  const statements = [
  `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('learner','instructor','admin') NOT NULL DEFAULT 'learner', is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(120) NOT NULL, slug VARCHAR(180) UNIQUE, summary VARCHAR(260) NOT NULL, description TEXT, category VARCHAR(100) NOT NULL, level VARCHAR(40) DEFAULT 'Beginner', language VARCHAR(40) DEFAULT 'English', thumbnail TEXT, outcomes JSON, prerequisites JSON, instructor_id INT NOT NULL, sections JSON, quiz JSON, status VARCHAR(30) DEFAULT 'draft', rejection_reason TEXT, average_rating DECIMAL(3,2) DEFAULT 0, review_count INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT fk_courses_instructor FOREIGN KEY(instructor_id) REFERENCES users(id)) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS enrolments (id INT AUTO_INCREMENT PRIMARY KEY, learner_id INT NOT NULL, course_id INT NOT NULL, completed_lessons JSON, completed_at DATETIME NULL, quiz_passed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uq_enrolment(learner_id,course_id), FOREIGN KEY(learner_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS reviews (id INT AUTO_INCREMENT PRIMARY KEY, learner_id INT NOT NULL, course_id INT NOT NULL, rating INT NOT NULL, body VARCHAR(1200) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_review(learner_id,course_id), FOREIGN KEY(learner_id) REFERENCES users(id), FOREIGN KEY(course_id) REFERENCES courses(id), CHECK(rating BETWEEN 1 AND 5)) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS certificates (id INT AUTO_INCREMENT PRIMARY KEY, learner_id INT NOT NULL, course_id INT NOT NULL, code VARCHAR(100) NOT NULL UNIQUE, learner_name VARCHAR(160), course_title VARCHAR(180), issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_certificate(learner_id,course_id), FOREIGN KEY(learner_id) REFERENCES users(id), FOREIGN KEY(course_id) REFERENCES courses(id)) ENGINE=InnoDB`
  ];
  for (const sql of statements) await rawPool.execute(sql);
}
export const parseJson = v => typeof v === 'string' ? (()=>{try{return JSON.parse(v)}catch{return v}})() : v;
export const rows = r => r.rows;
export const publicCourse = r => ({ _id:String(r.id), id:r.id, title:r.title, slug:r.slug, summary:r.summary, description:r.description, category:r.category, level:r.level, language:r.language, thumbnail:r.thumbnail, outcomes:parseJson(r.outcomes)||[], prerequisites:parseJson(r.prerequisites)||[], instructor:r.instructor_id, sections:parseJson(r.sections)||[], quiz:parseJson(r.quiz)||[], status:r.status, rejectionReason:r.rejection_reason, averageRating:Number(r.average_rating||0), reviewCount:r.review_count||0, createdAt:r.created_at, updatedAt:r.updated_at });
export const publicUser = r => ({ _id:String(r.id), id:r.id, name:r.name, email:r.email, role:r.role, isActive:!!r.is_active, createdAt:r.created_at });
