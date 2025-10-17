const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'BaseDeDatos2024!',
  database: 'familycarecirclebd',
  port: 3306
});

module.exports = pool;
