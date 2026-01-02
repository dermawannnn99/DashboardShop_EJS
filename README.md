# 🛒 Toko Admin - Sistem Inventori Toko

Aplikasi web untuk mengelola inventori toko dengan fitur CRUD produk, pembelian, tracking stock, dan history pergerakan barang.

## 📋 Daftar Isi

- [Requirements](#requirements)
- [Instalasi](#instalasi)
- [Konfigurasi Database](#konfigurasi-database)
- [Struktur Folder](#struktur-folder)
- [Cara Penggunaan](#cara-penggunaan)
- [Fitur Aplikasi](#fitur-aplikasi)
- [Routes dan Endpoint](#routes-dan-endpoint)
- [Troubleshooting](#troubleshooting)

---

## 📦 Requirements

- **Node.js** v14.0 atau lebih tinggi
- **MySQL** v5.7 atau lebih tinggi (atau Laragon/XAMPP)
- **npm** package manager
- **Text Editor** (VS Code, Sublime, dll)

---

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd toko-admin
```

### 2. Install Dependencies
```bash
npm install
```

Ini akan menginstall:
- `express` - Web framework
- `ejs` - Template engine
- `mysql2` - MySQL driver
- `body-parser` - Parse form data
- `method-override` - HTTP method override

### 3. Konfigurasi Database

Buat database MySQL bernama `toko_db`:

```bash
mysql -u root -p
```

Kemudian jalankan SQL berikut:

```sql
CREATE DATABASE toko_db;
USE toko_db;

-- Tabel Produk
CREATE TABLE produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Stock
CREATE TABLE stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Tabel Pembelian
CREATE TABLE pembelian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    jumlah INT NOT NULL,
    total_harga DECIMAL(10,2) NOT NULL,
    status ENUM('success', 'cancelled') DEFAULT 'success',
    tanggal_pembelian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- Tabel History Stock
CREATE TABLE stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    jenis ENUM('masuk', 'keluar') NOT NULL,
    jumlah INT NOT NULL,
    keterangan VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- Insert Data Sample
INSERT INTO produk (nama_produk, harga, deskripsi) VALUES
('Laptop ASUS ROG', 15000000, 'Laptop gaming high-end'),
('Mouse Logitech G502', 750000, 'Mouse gaming wireless'),
('Keyboard Mechanical RGB', 1200000, 'Keyboard gaming mechanical'),
('Monitor LG 27 inch', 3500000, 'Monitor gaming 144Hz'),
('Headset HyperX Cloud', 1500000, 'Headset gaming 7.1 surround'),
('Webcam Logitech C920', 1800000, 'Webcam Full HD 1080p'),
('Microphone Blue Yeti', 2200000, 'Microphone condenser USB'),
('SSD Samsung 1TB', 1800000, 'SSD NVMe Gen 4'),
('RAM Corsair 16GB', 1200000, 'RAM DDR4 3200MHz'),
('Mousepad XL', 250000, 'Mousepad gaming ukuran besar');

-- Insert Stock untuk semua produk
INSERT INTO stock (produk_id, jumlah) VALUES
(1, 10), (2, 25), (3, 15), (4, 8), (5, 20),
(6, 12), (7, 7), (8, 30), (9, 18), (10, 50);

-- Insert History awal
INSERT INTO stock_history (produk_id, jenis, jumlah, keterangan) VALUES
(1, 'masuk', 10, 'Stock awal'),
(2, 'masuk', 25, 'Stock awal'),
(3, 'masuk', 15, 'Stock awal'),
(4, 'masuk', 8, 'Stock awal'),
(5, 'masuk', 20, 'Stock awal'),
(6, 'masuk', 12, 'Stock awal'),
(7, 'masuk', 7, 'Stock awal'),
(8, 'masuk', 30, 'Stock awal'),
(9, 'masuk', 18, 'Stock awal'),
(10, 'masuk', 50, 'Stock awal');
```

### 4. Konfigurasi Koneksi Database

Edit file `config/database.js`:

```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Sesuaikan dengan user MySQL kamu
    password: '',        // Kosong jika menggunakan Laragon/XAMPP
    database: 'toko_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

module.exports = connection;
```

### 5. Jalankan Server

```bash
npm start
```

Atau gunakan nodemon untuk development:

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

---

## 📁 Struktur Folder

```
toko-admin/
├── config/
│   └── database.js              # Konfigurasi database MySQL
├── routes/
│   ├── product.js               # Route untuk CRUD produk
│   ├── purchase.js              # Route untuk CRUD pembelian
│   ├── stock.js                 # Route untuk update stock
│   └── history.js               # Route untuk history stock
├── views/
│   ├── index.ejs                # Dashboard (stats & quick actions)
│   ├── products.ejs             # List semua produk
│   ├── add-product.ejs          # Form tambah produk baru
│   ├── add-stock.ejs            # Form tambah stock produk
│   ├── purchases.ejs            # List pembelian
│   ├── add-purchase.ejs         # Form tambah pembelian
│   └── history.ejs              # History pergerakan stock
├── public/
│   ├── css/
│   │   ├── style.css            # Styling utama
│   │   └── images/
│   │       └── logo.png         # Logo aplikasi
│   └── icons/                   # Icon SVG files
│       ├── dashboard.svg
│       ├── products.svg
│       ├── purchases.svg
│       ├── history.svg
│       ├── add.svg
│       ├── plus.svg
│       ├── cart.svg
│       ├── check.svg
│       ├── close.svg
│       ├── box.svg
│       ├── inventory.svg
│       ├── shopping-cart.svg
│       ├── money.svg
│       └── list.svg
├── app.js                       # Entry point aplikasi
├── package.json                 # Project metadata & dependencies
└── README.md                    # Dokumentasi ini
```

---

## 🎯 Cara Penggunaan

### Dashboard (http://localhost:3000/)

Halaman utama menampilkan:
- **Total Produk** - Jumlah seluruh produk di database
- **Total Stock** - Jumlah unit stock semua produk
- **Total Pembelian** - Jumlah transaksi pembelian yang berhasil
- **Total Pendapatan** - Total revenue dari semua pembelian

### Menu Utama

#### 1. **Produk** (/products)
Menampilkan daftar semua produk dengan informasi:
- ID Produk
- Nama Produk
- Harga per unit
- Stock tersedia
- Deskripsi produk
- Status ketersediaan

**Aksi:**
- 🔗 Klik **"Tambah Stock"** untuk menambah stock produk existing

#### 2. **Pembelian** (/purchases)
Menampilkan daftar semua transaksi pembelian:
- ID Pembelian
- Nama Produk yang dibeli
- Harga satuan
- Jumlah unit
- Total harga
- Tanggal pembelian
- Status (Berhasil/Dibatalkan)

**Aksi:**
- 🔗 Klik **"Batal"** pada pembelian yang berstatus "Berhasil" untuk membatalkan (stock akan dikembalikan)

#### 3. **History** (/history)
Menampilkan riwayat pergerakan stock:
- ID History
- Nama Produk
- Jenis (Masuk ⬆️ atau Keluar ⬇️)
- Jumlah unit
- Keterangan (alasan pergerakan)
- Tanggal dan waktu

### Menu Transaksi

#### 1. **Tambah Produk** (/products/add)
Form untuk menambah produk baru:
- **Nama Produk** ⭐ (wajib)
- **Harga** ⭐ (wajib, format desimal)
- **Deskripsi** (opsional)
- **Jumlah Stock Awal** ⭐ (wajib)

**Proses:**
1. Isi semua field yang bertanda ⭐
2. Klik **"Simpan Produk"**
3. Produk akan dibuat dengan stock awal
4. Otomatis insert ke history sebagai "Stock awal"
5. Redirect ke halaman Produk

#### 2. **Tambah Pembelian** (/purchases/add)
Form untuk mencatat transaksi pembelian:
- **Pilih Produk** ⭐ (dropdown, hanya produk dengan stock > 0)
  - Menampilkan: Nama, Stock tersedia, Harga satuan
- **Jumlah Beli** ⭐ (minimal 1 unit)

**Fitur Otomatis:**
- Live calculation total harga saat jumlah diubah
- Validasi stock (tidak boleh lebih dari stock tersedia)
- Menampilkan ringkasan:
  - Harga per unit
  - Jumlah unit
  - **Total Harga** (tebal dan besar)

**Proses:**
1. Pilih produk dari dropdown
2. Masukkan jumlah yang ingin dibeli
3. Total harga akan otomatis terhitung
4. Klik **"Proses Pembelian"**
5. Sistem akan:
   - Insert record pembelian dengan status 'success'
   - Kurangi stock produk
   - Insert ke history dengan jenis 'keluar'
6. Redirect ke halaman Pembelian

#### 3. **Tambah Stock** (/products/add-stock/:id)
Form untuk menambah stock produk yang sudah ada:
- Menampilkan info produk (nama, harga)
- **Jumlah Penambahan Stock** ⭐ (minimal 1)
- **Keterangan** (opsional, contoh: pembelian dari supplier)

**Proses:**
1. Dari halaman Produk, klik **"Tambah Stock"**
2. Masukkan jumlah yang ditambahkan
3. (Opsional) Isi keterangan
4. Klik **"Tambah Stock"**
5. Sistem akan:
   - Tambah jumlah stock
   - Insert ke history dengan jenis 'masuk'
6. Redirect ke halaman Produk

---

## 🔄 Routes dan Endpoint

### **PRODUK**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/products` | List semua produk |
| GET | `/products/add` | Tampilkan form tambah produk |
| POST | `/products/add` | Proses tambah produk baru |
| GET | `/products/add-stock/:id` | Tampilkan form tambah stock |
| POST | `/products/add-stock/:id` | Proses tambah stock |

### **PEMBELIAN**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/purchases` | List semua pembelian |
| GET | `/purchases/add` | Tampilkan form tambah pembelian |
| POST | `/purchases/add` | Proses tambah pembelian |
| POST | `/purchases/:id/cancel` | Cancel pembelian (return stock) |

### **STOCK**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/stock/update/:id` | Update stock manual |

### **HISTORY**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/history` | List history stock |
| POST | `/history/reset` | Reset semua history |

### **DASHBOARD**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/` | Dashboard dengan stats |

---

## 🎨 Panduan UI/UX

### Warna & Status

**Badge Status Stock:**
- 🟢 **Hijau (Tersedia)** - Stock > 0
- 🟠 **Kuning (Terbatas)** - Stock 1-10 unit
- 🔴 **Merah (Habis)** - Stock = 0

**Badge Status Pembelian:**
- 🟢 **Hijau (Berhasil)** - Status success
- 🔴 **Merah (Dibatalkan)** - Status cancelled

### Tombol

- **Biru (Primary)** - Action utama (Simpan, Proses, Tambah)
- **Abu-abu (Secondary)** - Action alternatif (Batal, Kembali)
- **Merah (Danger)** - Action destruktif (Batal Pembelian)

### Sidebar Menu

- Collapse otomatis saat lebar layar < 768px
- Toggle button untuk buka/tutup sidebar
- Active indicator pada menu yang sedang aktif

---

## 🔧 Fitur Aplikasi

### ✅ CRUD Produk
- ✅ Create produk baru
- ✅ Read list produk
- ✅ Update stock produk
- ✅ Delete otomatis cascading

### ✅ Manajemen Pembelian
- ✅ Catat transaksi pembelian
- ✅ Validasi stock before purchase
- ✅ Cancel pembelian + return stock
- ✅ Tracking status pembelian

### ✅ Tracking Stock
- ✅ Real-time stock calculation
- ✅ History lengkap setiap pergerakan stock
- ✅ Jenis pergerakan: masuk/keluar
- ✅ Keterangan otomatis (produk baru, pembelian, pembatalan)

### ✅ Dashboard Analytics
- ✅ Total produk
- ✅ Total stock
- ✅ Total pembelian
- ✅ Total revenue
- ✅ Quick actions

### ✅ User Interface
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Sidebar navigation dengan collapse
- ✅ Alert error handling
- ✅ Format currency Rupiah otomatis
- ✅ Format datetime lokalisasi Indonesia

---

## ⚠️ Troubleshooting

### Error: "Failed to lookup view 'add-product'"
**Penyebab:** File view tidak ada di folder `views/`
**Solusi:** Pastikan semua file `.ejs` ada di `views/` folder

### Error: "Cannot find module 'mysql2'"
**Penyebab:** Dependencies belum diinstall
**Solusi:** Jalankan `npm install`

### Error: "Error connecting to database"
**Penyebab:** 
- Database tidak running
- Koneksi MySQL config salah
- Database `toko_db` belum dibuat

**Solusi:**
1. Pastikan MySQL/Laragon/XAMPP sudah running
2. Buat database `toko_db`
3. Cek username & password di `config/database.js`

### Error: "Port 3000 already in use"
**Penyebab:** Port 3000 sudah digunakan aplikasi lain
**Solusi:** 
Ubah port di `app.js`:
```javascript
const PORT = 3001; // Ganti ke port lain
```

### Stock tidak berkurang saat pembelian
**Penyebab:** Query update stock gagal
**Solusi:** 
1. Cek console error
2. Pastikan produk_id ada di database
3. Check foreign key constraint

### Icon tidak muncul
**Penyebab:** File SVG icon tidak ada di `/public/icons/`
**Solusi:** 
1. Download icon dari heroicons.com atau svgrepo.com
2. Simpan di folder `/public/icons/`
3. Reload browser

---

## 📝 Contoh Workflow Lengkap

### Scenario: Jual 3 unit Laptop ASUS ROG

**Step 1: Buka Dashboard**
```
Akses http://localhost:3000
Lihat stats produk, stock, pembelian, revenue
```

**Step 2: Tambah Pembelian**
```
Klik "Tambah Pembelian" di menu
Pilih "Laptop ASUS ROG" dari dropdown
Masukkan "3" di field Jumlah Beli
Lihat total harga otomatis: 3 x 15.000.000 = 45.000.000
Klik "Proses Pembelian"
```

**Step 3: Verifikasi**
```
Redirect ke halaman Pembelian
Lihat record baru dengan:
  - Produk: Laptop ASUS ROG
  - Jumlah: 3
  - Total: Rp 45.000.000
  - Status: Berhasil
```

**Step 4: Cek Stock Update**
```
Klik menu "Produk"
Lihat Laptop ASUS ROG stock berkurang:
  - Dari: 10 unit
  - Menjadi: 7 unit
```

**Step 5: Cek History**
```
Klik menu "History"
Lihat record baru:
  - Produk: Laptop ASUS ROG
  - Jenis: Keluar ⬇️
  - Jumlah: 3
  - Keterangan: Pembelian #1 (auto)
```

---

## 📧 Support & Info

**Untuk pertanyaan atau issue:**
- Cek error message di console
- Pastikan semua file ada di struktur folder yang benar
- Verifikasi database sudah tersetting
- Cek koneksi MySQL aktif

---

## 📜 License

MIT License - Bebas digunakan untuk keperluan apapun

---

**Last Updated:** 02 January 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
