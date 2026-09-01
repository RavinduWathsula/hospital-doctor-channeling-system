const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
async function insert() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', password:'', database:'smart_hospital'});
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);
  await conn.query(`
    INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
    VALUES ('Front', 'Desk', 'reception@smarthospital.com', ?, 'RECEPTIONIST', '1111111111')
  `, [hash]);
  console.log('Receptionist inserted!');
  process.exit();
}
insert();
