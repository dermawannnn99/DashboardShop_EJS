const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ====== GET: Tampilkan semua pembelian ======
router.get('/', (req, res) => {
    const query = `
        SELECT 
            pm.id,
            pm.jumlah,
            pm.total_harga,
            pm.status,
            pm.tanggal_pembelian,
            pm.cancelled_at,
            p.nama_produk,
            p.harga
        FROM pembelian pm
        JOIN produk p ON pm.produk_id = p.id
        ORDER BY pm.tanggal_pembelian DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('purchases', { 
            title: 'Daftar Pembelian',
            purchases: results 
        });
    });
});

// ====== GET: Form tambah pembelian ======
router.get('/add', (req, res) => {
    const query = `
        SELECT p.*, s.jumlah as stock
        FROM produk p
        LEFT JOIN stock s ON p.id = s.produk_id
        WHERE s.jumlah > 0
        ORDER BY p.nama_produk
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('add-purchase', { 
            title: 'Tambah Pembelian',
            products: results,
            error: null
        });
    });
});

// ====== POST: Proses tambah pembelian ======
router.post('/add', (req, res) => {
    const { produk_id, jumlah } = req.body;
    
    if (!produk_id || !jumlah || jumlah <= 0) {
        return res.status(400).send('Invalid input');
    }

    // Check stock
    db.query('SELECT jumlah FROM stock WHERE produk_id = ?', [produk_id], (err, stockResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        const availableStock = stockResults[0]?.jumlah || 0;
        
        if (availableStock < jumlah) {
            return db.query(`
                SELECT p.*, s.jumlah as stock
                FROM produk p
                LEFT JOIN stock s ON p.id = s.produk_id
                WHERE s.jumlah > 0
            `, (err, products) => {
                res.render('add-purchase', { 
                    title: 'Tambah Pembelian',
                    products: products,
                    error: `Stock tidak cukup! Stock tersedia: ${availableStock}`
                });
            });
        }

        // Get harga produk
        db.query('SELECT harga FROM produk WHERE id = ?', [produk_id], (err, productResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            const harga = productResults[0].harga;
            const total_harga = harga * jumlah;

            // Insert pembelian
            db.query(
                'INSERT INTO pembelian (produk_id, jumlah, total_harga) VALUES (?, ?, ?)',
                [produk_id, jumlah, total_harga],
                (err, insertResult) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }

                    // Update stock
                    db.query(
                        'UPDATE stock SET jumlah = jumlah - ? WHERE produk_id = ?',
                        [jumlah, produk_id],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send('Database error');
                            }

                            // Insert history stock keluar
                            db.query(
                                'INSERT INTO stock_history (produk_id, jenis, jumlah, keterangan) VALUES (?, ?, ?, ?)',
                                [produk_id, 'keluar', jumlah, `Pembelian #${insertResult.insertId}`],
                                (err) => {
                                    if (err) console.error(err);
                                    res.redirect('/purchases');
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});

// ====== POST: Cancel pembelian ======
router.post('/:id/cancel', (req, res) => {
    const purchaseId = req.params.id;

    db.query(
        'SELECT * FROM pembelian WHERE id = ? AND status = "success"',
        [purchaseId],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (results.length === 0) {
                return res.status(404).send('Purchase not found or already cancelled');
            }

            const purchase = results[0];

            // Update status pembelian
            db.query(
                'UPDATE pembelian SET status = "cancelled", cancelled_at = NOW() WHERE id = ?',
                [purchaseId],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }

                    // Return stock
                    db.query(
                        'UPDATE stock SET jumlah = jumlah + ? WHERE produk_id = ?',
                        [purchase.jumlah, purchase.produk_id],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).send('Database error');
                            }

                            // Insert history stock masuk (karena dibatalkan)
                            db.query(
                                'INSERT INTO stock_history (produk_id, jenis, jumlah, keterangan) VALUES (?, ?, ?, ?)',
                                [purchase.produk_id, 'masuk', purchase.jumlah, `Pembatalan pembelian #${purchaseId}`],
                                (err) => {
                                    if (err) console.error(err);
                                    res.redirect('/purchases');
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// ====== POST: Reset semua pembelian ======
router.post('/reset', (req, res) => {
    // Delete semua pembelian
    db.query('DELETE FROM pembelian', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error saat reset pembelian');
        }

        console.log('✅ Semua data pembelian berhasil direset');
        res.redirect('/purchases');
    });
});

module.exports = router;