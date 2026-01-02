const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products with stock
router.get('/', (req, res) => {
    const query = `
        SELECT p.*, s.jumlah as stock
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

// Get single product detail
router.get('/:id', (req, res) => {
    const query = `
        SELECT p.*, s.jumlah as stock
        FROM produk p
        LEFT JOIN stock s ON p.id = s.produk_id
        WHERE p.id = ?
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.json(results[0]);
    });
});

module.exports = router;