const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ====== GET: Tampilkan semua produk dengan stock ======
router.get('/', (req, res) => {
    const query = `
        SELECT p.*, COALESCE(s.jumlah, 0) as stock
        FROM produk p
        LEFT JOIN stock s ON p.id = s.produk_id
        ORDER BY p.id
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('products', { 
            title: 'Daftar Produk',
            products: results 
        });
    });
});

// ====== GET: Form tambah produk baru ======
router.get('/add', (req, res) => {
    res.render('add-product', { 
        title: 'Tambah Produk',
        error: null
    });
});

// ====== POST: Proses tambah produk baru ======
router.post('/add', (req, res) => {
    const { nama_produk, harga, deskripsi, jumlah_stock } = req.body;

    // Validasi input
    if (!nama_produk || !harga || !jumlah_stock) {
        return res.render('add-product', {
            title: 'Tambah Produk',
            error: 'Nama produk, harga, dan jumlah stock harus diisi!'
        });
    }

    // Insert produk baru
    db.query(
        'INSERT INTO produk (nama_produk, harga, deskripsi) VALUES (?, ?, ?)',
        [nama_produk, harga, deskripsi || ''],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            const produkId = result.insertId;

            // Insert stock untuk produk baru
            db.query(
                'INSERT INTO stock (produk_id, jumlah) VALUES (?, ?)',
                [produkId, jumlah_stock],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }

                    // Insert history stock masuk
                    db.query(
                        'INSERT INTO stock_history (produk_id, jenis, jumlah, keterangan) VALUES (?, ?, ?, ?)',
                        [produkId, 'masuk', jumlah_stock, 'Produk baru ditambahkan'],
                        (err) => {
                            if (err) console.error(err);
                            console.log(`✅ Produk baru "${nama_produk}" ditambahkan dengan stock ${jumlah_stock}`);
                            res.redirect('/products');
                        }
                    );
                }
            );
        }
    );
});

// ====== GET: Form tambah stock produk existing ======
router.get('/add-stock/:id', (req, res) => {
    const produkId = req.params.id;
    
    db.query('SELECT * FROM produk WHERE id = ?', [produkId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Produk tidak ditemukan');
        }
        
        res.render('add-stock', {
            title: 'Tambah Stock',
            product: results[0],
            error: null
        });
    });
});

// ====== POST: Proses tambah stock produk existing ======
router.post('/add-stock/:id', (req, res) => {
    const produkId = req.params.id;
    const { jumlah, keterangan } = req.body;

    if (!jumlah || jumlah <= 0) {
        return db.query('SELECT * FROM produk WHERE id = ?', [produkId], (err, results) => {
            res.render('add-stock', {
                title: 'Tambah Stock',
                product: results[0],
                error: 'Jumlah harus lebih dari 0!'
            });
        });
    }

    // Update stock
    db.query(
        'UPDATE stock SET jumlah = jumlah + ? WHERE produk_id = ?',
        [jumlah, produkId],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            // Insert history
            db.query(
                'INSERT INTO stock_history (produk_id, jenis, jumlah, keterangan) VALUES (?, ?, ?, ?)',
                [produkId, 'masuk', jumlah, keterangan || 'Penambahan stock'],
                (err) => {
                    if (err) console.error(err);
                    console.log(`✅ Stock produk ID ${produkId} bertambah ${jumlah} unit`);
                    res.redirect('/products');
                }
            );
        }
    );
});

module.exports = router;