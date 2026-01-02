const mysql = require('mysql2');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // default Laragon
    password: '',        // default Laragon (kosong)
    database: 'toko_db'
});

// Test koneksi
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

module.exports = connection;