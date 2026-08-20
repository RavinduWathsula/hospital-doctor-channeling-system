const pool = require('./src/config/database');

async function migrate() {
    try {
        await pool.query(`ALTER TABLE appointments MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'PENDING'`);
        console.log('Added WAITING and CALLED to ENUM');
        await pool.query(`UPDATE appointments SET status = 'WAITING' WHERE status = 'CHECKED_IN'`);
        console.log('Updated CHECKED_IN to WAITING');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
