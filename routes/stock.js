const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ====== POST: Update stock produk ======
router.post('/update/:id', (req, res) => {
    const { jumlah } = req.body;
    const produkId = req.params.id;

    // ===== VALIDASI INPUT =====
    if (jumlah === undefined || jumlah === null) {
        return res.status(400).send('Stock harus diisi');
    }

    const stokNumber = parseInt(jumlah);
    if (isNaN(stokNumber) || stokNumber < 0) {
        return res.status(400).send('Stock harus berupa angka positif');
    }

    // ===== UPDATE STOCK =====
    db.query(
        'UPDATE stock SET jumlah = ? WHERE produk_id = ?',
        [stokNumber, produkId],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            console.log(`✅ Stock produk ID ${produkId} diubah menjadi ${stokNumber} unit`);
            res.redirect('/products');
        }
    );
});

module.exports = router;
