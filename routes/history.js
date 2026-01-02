const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ====== GET: Tampilkan history stock ======
router.get('/', (req, res) => {
    const query = `
        SELECT 
            sh.id,
            sh.jenis,
            sh.jumlah,
            sh.keterangan,
            sh.created_at,
            p.nama_produk
        FROM stock_history sh
        JOIN produk p ON sh.produk_id = p.id
        ORDER BY sh.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('history', { 
            title: 'History Stock',
            history: results 
        });
    });
});

// ====== POST: Reset history ======
router.post('/reset', (req, res) => {
    db.query('DELETE FROM stock_history', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error saat reset history');
        }

        console.log('✅ History stock berhasil direset');
        res.redirect('/history');
    });
});

module.exports = router;