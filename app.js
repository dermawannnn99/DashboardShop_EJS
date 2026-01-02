const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes - URUTAN PENTING!
const productRoutes = require('./routes/product');
const purchaseRoutes = require('./routes/purchase');
const stockRoutes = require('./routes/stock');
const historyRoutes = require('./routes/history');

// Register routes
app.use('/products', productRoutes);
app.use('/purchases', purchaseRoutes);
app.use('/stock', stockRoutes);
app.use('/history', historyRoutes);

// Home route
app.get('/', (req, res) => {
    const queries = {
        totalProducts: 'SELECT COUNT(*) as total FROM produk',
        totalStock: 'SELECT SUM(jumlah) as total FROM stock',
        totalPurchases: 'SELECT COUNT(*) as total FROM pembelian WHERE status = "success"',
        totalRevenue: 'SELECT SUM(total_harga) as total FROM pembelian WHERE status = "success"'
    };

    let stats = {};
    let completed = 0;

    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, results) => {
            if (!err) {
                stats[key] = results[0].total || 0;
            }
            completed++;
            
            if (completed === Object.keys(queries).length) {
                res.render('index', { 
                    title: 'Dashboard Admin',
                    stats: stats
                });
            }
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});