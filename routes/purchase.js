const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all purchases
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

// Show add purchase form
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

// Process add purchase
router.post('/add', (req, res) => {
    const { produk_id, jumlah } = req.body;
    
    // Validate input
    if (!produk_id || !jumlah || jumlah <= 0) {
        return res.status(400).send('Invalid input');
    }

    // Check stock availability
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

        // Get product price
        db.query('SELECT harga FROM produk WHERE id = ?', [produk_id], (err, productResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            const harga = productResults[0].harga;
            const total_harga = harga * jumlah;

            // Insert purchase
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
                            res.redirect('/purchases');
                        }
                    );
                }
            );
        });
    });
});

// Cancel purchase
router.post('/:id/cancel', (req, res) => {
    const purchaseId = req.params.id;

    // Get purchase details
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

            // Update purchase status
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
                            res.redirect('/purchases');
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;