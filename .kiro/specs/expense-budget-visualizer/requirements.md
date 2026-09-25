# Requirements Document

## Introduction

Expense & Budget Visualizer adalah web app berbasis HTML, CSS, dan Vanilla JavaScript yang memungkinkan pengguna mencatat pengeluaran harian, mengkategorikannya, dan memvisualisasikan distribusi pengeluaran secara real-time melalui pie chart. Data disimpan secara persisten di localStorage browser sehingga tidak hilang saat halaman di-refresh. Aplikasi berjalan sepenuhnya di sisi klien tanpa memerlukan backend.

## Glossary

- **App**: Aplikasi Expense & Budget Visualizer secara keseluruhan
- **Form**: Komponen input pada halaman untuk menambah transaksi baru
- **Transaction**: Satu catatan pengeluaran yang memiliki nama, jumlah, kategori, dan tanggal
- **TransactionList**: Komponen daftar yang menampilkan semua transaksi yang telah ditambahkan
- **SummaryBar**: Komponen yang menampilkan total pengeluaran keseluruhan dan per kategori
- **Chart**: Komponen doughnut/pie chart berbasis Chart.js yang memvisualisasikan pengeluaran per kategori
- **Storage**: Mekanisme penyimpanan data berbasis localStorage browser
- **Validator**: Modul yang memeriksa keabsahan input pada Form sebelum transaksi disimpan
- **Category**: Klasifikasi transaksi; salah satu dari tiga nilai: Food, Transport, atau Fun

---

## Requirements

### Requirement 1: Tambah Transaksi Melalui Form

**User Story:** Sebagai pengguna, saya ingin mengisi form untuk mencatat pengeluaran baru, sehingga saya dapat merekam setiap transaksi dengan detail yang cukup.

#### Acceptance Criteria

1. THE Form SHALL menyediakan field teks untuk nama transaksi dengan panjang maksimal 60 karakter.
2. THE Form SHALL menyediakan field angka untuk jumlah pengeluaran (amount) dalam rentang 1 hingga 999.999.999 dalam satuan Rupiah.
3. THE Form SHALL menyediakan dropdown pemilihan kategori dengan pilihan: Food, Transport, dan Fun.
4. WHEN pengguna menekan tombol submit, THE Form SHALL meneruskan data ke Validator sebelum menyimpan transaksi.
5. IF nama transaksi kosong atau melebihi 60 karakter, THEN THE Validator SHALL menolak pengiriman form dan menampilkan pesan kesalahan yang mengindikasikan field nama tidak valid.
6. IF jumlah pengeluaran kosong, bukan angka, atau di luar rentang 1 hingga 999.999.999, THEN THE Validator SHALL menolak pengiriman form dan menampilkan pesan kesalahan yang mengindikasikan field jumlah tidak valid.
7. WHEN transaksi berhasil disimpan, THE Form SHALL mereset semua field ke nilai awal dan memindahkan fokus ke field nama transaksi.

---

### Requirement 2: Validasi Input Form

**User Story:** Sebagai pengguna, saya ingin mendapat pesan error yang jelas ketika mengisi form dengan data tidak valid, sehingga saya tahu persis apa yang perlu diperbaiki.

#### Acceptance Criteria

1. WHEN field nama transaksi kosong saat submit, THE Validator SHALL menampilkan pesan error "Nama item tidak boleh kosong." pada field tersebut.
2. WHEN field nama transaksi melebihi 60 karakter saat submit, THE Validator SHALL menampilkan pesan error "Nama terlalu panjang (maks 60 karakter)." pada field tersebut.
3. WHEN field jumlah kosong saat submit, THE Validator SHALL menampilkan pesan error "Jumlah tidak boleh kosong." pada field tersebut.
4. WHEN field jumlah berisi nilai bukan bilangan bulat positif antara 1 hingga 1.000.000.000 saat submit, THE Validator SHALL menampilkan pesan error "Jumlah harus berupa angka positif." pada field tersebut.
5. WHEN field jumlah berisi nilai lebih dari 1.000.000.000 saat submit, THE Validator SHALL menampilkan pesan error "Jumlah terlalu besar (maks 1.000.000.000)." pada field tersebut.
6. WHEN field kategori belum dipilih saat submit, THE Validator SHALL menampilkan pesan error "Pilih salah satu kategori." pada field tersebut.
7. WHEN pengguna memicu event input pada field yang sebelumnya error, THE Validator SHALL menghapus tampilan error pada field tersebut.
8. IF lebih dari satu field tidak valid saat submit, THEN THE Validator SHALL menampilkan semua pesan error secara bersamaan.
9. WHEN semua field lolos validasi, THE Form SHALL melanjutkan proses penyimpanan transaksi.

---

### Requirement 3: Penyimpanan dan Pemuatan Data Transaksi

**User Story:** Sebagai pengguna, saya ingin data transaksi saya tetap tersimpan setelah browser di-refresh, sehingga saya tidak kehilangan catatan pengeluaran.

#### Acceptance Criteria

1. WHEN transaksi baru berhasil divalidasi dan disimpan, THE Storage SHALL memperbarui localStorage dengan key `ebv_transactions` sebagai JSON array lengkap yang mencerminkan seluruh state terkini.
2. WHEN halaman dimuat pertama kali dan data berhasil dibaca, THE App SHALL merender TransactionList, SummaryBar, dan Chart berdasarkan transaksi yang dimuat dari localStorage.
3. IF localStorage tidak mengandung key `ebv_transactions` saat halaman dimuat, THEN THE Storage SHALL menginisialisasi state dengan array kosong tanpa error.
4. IF data di localStorage tidak dapat di-parse sebagai JSON valid saat halaman dimuat, THEN THE Storage SHALL menginisialisasi state dengan array kosong dan tidak menampilkan error ke pengguna.
5. WHEN transaksi dihapus, THE Storage SHALL menimpa nilai key `ebv_transactions` dengan JSON array baru yang tidak mengandung transaksi yang dihapus.

---

### Requirement 4: Tampilan Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang telah saya catat dalam bentuk daftar yang terurut, sehingga saya dapat memeriksa riwayat pengeluaran.

#### Acceptance Criteria

1. THE TransactionList SHALL menampilkan semua transaksi yang tersimpan, diurutkan berdasarkan waktu pencatatan (entry timestamp) dari yang paling baru ke yang paling lama.
2. WHEN daftar transaksi tidak kosong, THE TransactionList SHALL menampilkan setiap transaksi dengan informasi: nama, kategori, tanggal, dan jumlah dengan format "Rp" diikuti angka dengan pemisah ribuan titik (contoh: Rp 150.000).
3. WHEN daftar transaksi kosong, THE TransactionList SHALL menampilkan pesan "Belum ada transaksi. Tambahkan yang pertama! 🎉".
4. THE TransactionList SHALL menampilkan indikator warna (color dot) untuk setiap transaksi sesuai kategorinya: warna kuning untuk Food, biru untuk Transport, dan merah muda untuk Fun. IF kategori tidak dikenal, THEN THE TransactionList SHALL menampilkan color dot berwarna abu-abu.
5. WHEN sebuah transaksi ditambahkan, THE TransactionList SHALL memperbarui tampilan daftar dalam waktu ≤ 1 detik tanpa reload halaman.

---

### Requirement 5: Hapus Transaksi

**User Story:** Sebagai pengguna, saya ingin menghapus transaksi yang tidak saya inginkan, sehingga data pengeluaran saya tetap akurat.

#### Acceptance Criteria

1. THE TransactionList SHALL menyediakan tombol hapus pada setiap item transaksi.
2. WHEN pengguna menekan tombol hapus pada sebuah transaksi, THE App SHALL menampilkan dialog konfirmasi sebelum menghapus transaksi secara permanen.
3. WHEN pengguna mengonfirmasi penghapusan, THE App SHALL menghapus transaksi tersebut dari state dan Storage secara permanen.
4. WHEN sebuah transaksi dihapus, THE TransactionList SHALL memperbarui tampilan daftar dalam waktu ≤ 500ms tanpa reload halaman.
5. WHEN sebuah transaksi dihapus sehingga daftar menjadi kosong, THE TransactionList SHALL menampilkan pesan empty-state.
6. WHEN sebuah transaksi dihapus, THE SummaryBar SHALL memperbarui tampilan total pengeluaran dalam waktu ≤ 500ms.
7. WHEN sebuah transaksi dihapus, THE Chart SHALL memperbarui visualisasi dalam waktu ≤ 500ms.
8. IF Storage gagal menyimpan perubahan penghapusan, THEN THE App SHALL membatalkan penghapusan dari state dan mengembalikan tampilan ke kondisi sebelum penghapusan.

---

### Requirement 6: Summary Bar Total Pengeluaran

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan total pengeluaran secara keseluruhan dan per kategori, sehingga saya bisa memantau anggaran sekilas.

#### Acceptance Criteria

1. THE SummaryBar SHALL menampilkan total pengeluaran keseluruhan dari semua transaksi yang tersimpan. IF tidak ada transaksi, THEN THE SummaryBar SHALL menampilkan "Rp 0".
2. THE SummaryBar SHALL menampilkan subtotal pengeluaran terpisah untuk setiap Category: Food, Transport, dan Fun. IF tidak ada transaksi untuk suatu Category, THEN subtotal Category tersebut SHALL ditampilkan sebagai "Rp 0".
3. WHEN transaksi ditambahkan atau dihapus, THE SummaryBar SHALL memperbarui semua nilai total secara sinkron dalam satu render cycle yang sama.
4. THE SummaryBar SHALL menampilkan semua nilai dalam format mata uang Rupiah dengan pemisah ribuan titik (contoh: "Rp 25.000").

---

### Requirement 7: Visualisasi Pie Chart per Kategori

**User Story:** Sebagai pengguna, saya ingin melihat distribusi pengeluaran per kategori dalam bentuk grafik, sehingga saya dapat memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. THE Chart SHALL menampilkan doughnut chart menggunakan library Chart.js yang memvisualisasikan proporsi pengeluaran per Category.
2. THE Chart SHALL menggunakan warna yang konsisten per Category: warna kuning untuk Food, warna biru untuk Transport, dan warna merah muda untuk Fun — warna yang sama digunakan di Chart, TransactionList, dan SummaryBar.
3. WHEN pengguna mengarahkan kursor ke sebuah segmen chart, THE Chart SHALL menampilkan tooltip berisi jumlah dalam format Rupiah dan persentase dari total dengan 1 angka desimal (contoh: "Rp 50.000 (33.3%)").
4. WHEN transaksi ditambahkan atau dihapus, THE Chart SHALL memperbarui data visualisasi dalam waktu ≤ 1 detik tanpa reload halaman.
5. THE Chart SHALL menyertakan legend yang menampilkan nama kategori, jumlah dalam format Rupiah, dan persentase dengan 1 angka desimal untuk setiap Category.
6. IF tidak ada transaksi, THEN THE Chart SHALL menampilkan pesan atau placeholder yang mengindikasikan tidak ada data untuk ditampilkan.

---

### Requirement 8: Keamanan Output Data

**User Story:** Sebagai pengguna, saya ingin aplikasi menampilkan nama transaksi yang saya input dengan aman, sehingga karakter khusus tidak menyebabkan masalah tampilan atau keamanan.

#### Acceptance Criteria

1. WHEN nama transaksi yang mengandung karakter `&`, `<`, `>`, `"`, atau `'` ditampilkan di TransactionList, THE App SHALL merender karakter tersebut sebagai teks literal yang terlihat oleh pengguna, bukan sebagai markup HTML.
2. IF nama transaksi digunakan sebagai nilai atribut HTML `title`, `aria-label`, atau `data-id`, THEN THE App SHALL melakukan HTML escaping pada nilai tersebut sebelum dirender.
3. IF nama transaksi berupa string kosong atau bukan string, THEN THE App SHALL menggunakan fallback string kosong tanpa melempar error.

---

### Requirement 9: Responsivitas Tampilan

**User Story:** Sebagai pengguna, saya ingin menggunakan aplikasi di perangkat mobile maupun desktop, sehingga tampilan tetap nyaman di berbagai ukuran layar.

#### Acceptance Criteria

1. WHILE lebar viewport kurang dari atau sama dengan 768px, THE App SHALL menampilkan summary bar, form input, daftar transaksi, dan chart dalam satu kolom vertikal.
2. WHILE lebar viewport lebih dari 768px, THE App SHALL menampilkan form input dan daftar transaksi berdampingan dalam dua kolom dengan lebar masing-masing 50%, sementara summary bar dan chart ditampilkan dengan lebar penuh.
3. WHILE lebar viewport kurang dari atau sama dengan 768px, THE TransactionList SHALL memiliki tinggi maksimum sehingga konten tidak meluap keluar dari viewport.
