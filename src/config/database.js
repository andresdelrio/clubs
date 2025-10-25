const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'clubs',
  DB_CONNECTION_LIMIT = 10,
} = process.env;


let pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }
  return pool;
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

module.exports = {
  createPool,
  getPool,
};

