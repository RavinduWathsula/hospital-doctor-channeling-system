const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_hospital'
});

const departments = [
  ['Neurology', 'Nervous system and brain disorders', 1],
  ['Pediatrics', 'Infant, child, and adolescent healthcare', 1],
  ['Orthopedics', 'Musculoskeletal system care', 1],
  ['Dermatology', 'Skin, hair, and nail conditions', 1],
  ['Ophthalmology', 'Eye and vision care', 1],
  ['Dentistry', 'Oral health and dental care', 1],
  ['General Medicine', 'Comprehensive adult healthcare', 1],
  ['Psychiatry', 'Mental health and emotional well-being', 1]
];

const query = "INSERT INTO departments (name, description, is_active) VALUES ?";

connection.query(query, [departments], (err, results) => {
  if (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Departments already exist or duplicate entry.');
    } else {
      console.error(err);
    }
  } else {
    console.log('Successfully inserted departments: ', results.affectedRows);
  }
  connection.end();
});
