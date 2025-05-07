const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  async query(sql, params) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  }

  async connect() {
    try {
      const connection = await this.pool.getConnection();
      console.log('Successfully connected to database');
      connection.release();
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
  }
}

module.exports = new Database();