# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi single-page web application (SPA) pure frontend — HTML + CSS + Vanilla JavaScript — tanpa bundler atau framework. State tunggal (`transactions[]`) disinkronisasi ke `localStorage` dan dirender ulang sepenuhnya setiap kali state berubah. Visualisasi menggunakan Chart.js 4.x via CDN.

---

## Tasks

- [ ] 1. Setup markup HTML (index.html)
  - [ ] 1.1 Buat struktur HTML lengkap dengan semantic elements
    - Buat `index.html` dengan elemen: `<header>`, `<main class="app-grid">`, dan empat section: summary-card, form input, transaction list, dan chart
    - Tambahkan semua DOM element yang dibutuhkan app.js: `#expense-form`, `#input-name`, `#input-amount`, `#input-category`, `#err-name`, `#err-amount`, `#err-category`, `#transaction-list`, `#pie-chart`
    - Tambahkan elemen summary: `#summary-total`, `#summary-food`, `#summary-transport`, `#summary-fun`
    - Tambahkan elemen legend chart: `#legend-val-food`, `#legend-val-transport`, `#legend-val-fun`
    - Tambahkan atribut aksesibilitas: `aria-label`, `role="alert"` pada error messages, `aria-live="polite"` pada transaction list
    - Tambahkan Chart.js CDN sebelum `app.js`: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.3, 5.1, 7.1, 7.5_

- [ ] 2. Implementasi CSS dan responsive layout (style.css)
  - [ ] 2.1 Buat CSS variables, reset, dan base styles
    - Definisikan CSS custom properties di `:root`: `--bg`, `--surface`, `--primary`, `--primary-dark`, `--danger`, `--text`, `--text-muted`, `--border`, `--radius`, `--shadow`, dan warna kategori `--food`, `--transport`, `--fun`
    - Tambahkan box-sizing reset dan base `body` styles
    - _Requirements: 7.2, 9.1_

  - [ ] 2.2 Implementasi layout dan komponen cards
    - Buat `.app-grid` dengan CSS Grid dua kolom untuk viewport > 768px
    - Buat `.card` component styles dengan shadow dan border-radius
    - Buat `.summary-card` yang full-width (`grid-column: 1 / -1`) dengan flex wrap untuk summary items
    - _Requirements: 9.2_

  - [ ] 2.3 Implementasi form styles dan validasi visual
    - Style untuk `.form-group`, `input`, `select`, `label`
    - Style state error: `input.error` dan `select.error` dengan border merah dan box-shadow
    - Style `.error-msg` dengan `display: none` default dan `.error-msg.visible` untuk menampilkan error
    - Style `.btn-add` dengan hover dan active states
    - _Requirements: 2.1–2.8_

  - [ ] 2.4 Implementasi transaction list styles
    - Style `.transaction-list` sebagai scrollable list (`max-height`, `overflow-y: auto`) dengan custom scrollbar
    - Style `.transaction-item` dengan layout flex, animasi fadeIn
    - Style `.category-dot` dengan warna per kategori: `.Food`, `.Transport`, `.Fun`
    - Style `.btn-delete` dengan hover state merah
    - Style `.empty-state` untuk pesan kosong
    - _Requirements: 4.1–4.5, 5.1_

  - [ ] 2.5 Implementasi chart dan responsive styles
    - Style `.chart-wrapper`, `.chart-legend`, `.legend-item`, `.legend-dot`
    - Tambahkan `@media (max-width: 768px)` yang mengubah grid menjadi satu kolom
    - _Requirements: 7.1, 7.5, 9.1, 9.3_

- [ ] 3. Setup module app.js: konstanta, state, DOM refs, dan utilitas
  - [ ] 3.1 Inisialisasi konstanta, state, dan DOM references
    - Tambahkan `'use strict'` di baris pertama
    - Definisikan konstanta: `STORAGE_KEY`, `CATEGORIES`, `CAT_COLORS`
    - Deklarasikan module-level state: `let transactions = []` dan `let pieChart = null`
    - Cache semua DOM references: form, input fields, error elements, list, canvas, summary elements
    - _Requirements: 3.1, 3.3_

  - [ ] 3.2 Implementasi fungsi utilitas `escapeHtml` dan `formatRupiah`
    - Implementasi `escapeHtml(str)`: terima non-string tanpa throw, escape lima karakter: `&`, `<`, `>`, `"`, `'`
    - Implementasi `formatRupiah(num)`: return `'Rp ' + Number(num).toLocaleString('id-ID')`
    - Implementasi `formatDate(iso)`: parse ISO string, return format `id-ID` dengan day/month/year
    - _Requirements: 4.2, 6.4, 8.1, 8.2, 8.3_

  - [ ]* 3.3 Tulis property test untuk `escapeHtml`
    - **Property 12: escapeHtml mencegah XSS**
    - **Validates: Requirements 8.1, 8.2**
    - Setup Vitest dan fast-check: buat `package.json` dengan dev dependencies `vitest` dan `fast-check`, tambahkan script `test: vitest --run`
    - Buat `tests/utils.test.js`, generate string yang mengandung karakter `&<>"'` dan verifikasi tidak ada karakter literal tersisa di output
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 12: escapeHtml mencegah XSS`

  - [ ]* 3.4 Tulis property test untuk `formatRupiah`
    - **Property 9: Format Rupiah konsisten**
    - **Validates: Requirements 4.2, 6.4**
    - Generate bilangan bulat non-negatif, verifikasi output selalu diawali `"Rp "` dan berisi representasi locale `id-ID`
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 9: Format Rupiah konsisten`

- [ ] 4. Implementasi Storage
  - [ ] 4.1 Implementasi `loadFromStorage` dan `saveToStorage`
    - Implementasi `loadFromStorage()`: baca `localStorage.getItem(STORAGE_KEY)`, kembalikan `[]` jika null, kembalikan `[]` jika JSON.parse gagal (silent fail)
    - Implementasi `saveToStorage()`: tulis `localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))` — boleh throw DOMException (ditangani caller)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Tulis property test untuk `loadFromStorage` dan `saveToStorage`
    - **Property 6: Round-trip penyimpanan transaksi**
    - **Validates: Requirements 3.1, 3.2**
    - Generate array Transaction acak dengan fast-check, simpan via mock localStorage, load kembali, verifikasi data identik
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 6: Round-trip penyimpanan transaksi`
    - Tambahkan juga unit test untuk JSON corrupt (3.4) dan missing key (3.3)

- [ ] 5. Implementasi Validator
  - [ ] 5.1 Implementasi `clearErrors`, `showError`, dan `validateForm`
    - Implementasi `clearErrors()`: hapus class `error` dari semua inputs, hapus class `visible` dari semua error messages
    - Implementasi `showError(inputEl, msgEl, message)`: tambah class `error`, set `textContent`, tambah class `visible`
    - Implementasi `validateForm()`: panggil `clearErrors()` di awal, periksa semua field tanpa short-circuit (semua error tampil bersamaan), kembalikan `boolean`
    - Terapkan semua aturan validasi sesuai tabel di design: name (kosong, > 60 char), amount (kosong, non-positif, > 1.000.000.000), category (tidak dipilih)
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9_

  - [ ] 5.2 Implementasi inline error clearing pada event input/change
    - Tambahkan event listener `input` pada `inputName` dan `inputAmount`: hapus class `error` dan `visible`
    - Tambahkan event listener `change` pada `inputCat`: hapus class `error` dan `visible`
    - _Requirements: 2.7_

  - [ ]* 5.3 Tulis property test untuk `validateForm` — validasi nama
    - **Property 1: Validasi panjang nama**
    - **Validates: Requirements 1.1, 2.2**
    - Generate string dengan panjang > 60 karakter, verifikasi `validateForm()` return `false` dan pesan error yang tepat muncul
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 1: Validasi panjang nama`

  - [ ]* 5.4 Tulis property test untuk `validateForm` — validasi amount
    - **Property 2: Validasi rentang amount**
    - **Validates: Requirements 1.2, 2.4, 2.5**
    - Generate nilai di luar rentang (< 1 atau > 1.000.000.000), verifikasi `validateForm()` return `false` dengan pesan error yang sesuai
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 2: Validasi rentang amount`

  - [ ]* 5.5 Tulis property test untuk simultaneous errors
    - **Property 3: Semua error tampil bersamaan**
    - **Validates: Requirements 2.8**
    - Generate kombinasi field invalid, verifikasi semua pesan error yang relevan muncul bersamaan (tidak hanya satu)
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 3: Semua error tampil bersamaan`

  - [ ]* 5.6 Tulis property test untuk validasi input valid selalu lolos
    - **Property 4: Validasi input valid selalu lolos**
    - **Validates: Requirements 2.9**
    - Generate kombinasi valid (name 1–60 char, amount 1–1.000.000.000, category valid), verifikasi `validateForm()` selalu return `true`
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 4: Validasi input valid selalu lolos`

  - [ ]* 5.7 Tulis property test untuk inline error clearing
    - **Property 5: Error field dibersihkan saat input**
    - **Validates: Requirements 2.7**
    - Set field ke state error, dispatch event `input`/`change`, verifikasi class error dan visibilitas pesan dihapus
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 5: Error field dibersihkan saat input`

- [ ] 6. Checkpoint — Pastikan semua tests validator dan utilitas lolos
  - Jalankan `npm test` (atau `npx vitest --run`), pastikan semua property tests dan unit tests lolos sebelum lanjut.

- [ ] 7. Implementasi TransactionList
  - [ ] 7.1 Implementasi `renderList`
    - Implementasi `renderList()`: bersihkan `txList.innerHTML`, tampilkan empty-state jika `transactions` kosong, render item dengan `[...transactions].reverse().forEach()`
    - Setiap item berisi: `category-dot`, `tx-name` (escaped), `tx-meta` (kategori + tanggal), `tx-amount`, `btn-delete`
    - Gunakan `escapeHtml()` pada semua user content: `tx.name` di `innerHTML`, `title` attribute, dan `aria-label`
    - Set `data-id` pada `btn-delete` dan `li` element
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 8.1, 8.2_

  - [ ] 7.2 Implementasi delete dengan event delegation dan konfirmasi dialog
    - Tambahkan event listener `click` pada `txList` menggunakan delegation: `e.target.closest('.btn-delete')`
    - Tampilkan `window.confirm()` sebelum menghapus
    - Pada konfirmasi: simpan snapshot `prev = [...transactions]`, panggil `deleteTransaction(id)`, coba `saveToStorage()`, jika catch rollback ke `prev`, panggil `renderAll()` di kedua kasus
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.8_

  - [ ]* 7.3 Tulis property test untuk `renderList` — urutan daftar
    - **Property 8: Urutan daftar selalu descending by timestamp**
    - **Validates: Requirements 4.1**
    - Generate array transaksi dengan date berbeda, panggil `renderList()`, verifikasi urutan DOM items dari terbaru ke terlama
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 8: Urutan daftar selalu descending by timestamp`

  - [ ]* 7.4 Tulis property test untuk `renderList` — setiap item punya tombol hapus
    - **Property 14: Setiap item transaksi memiliki tombol hapus**
    - **Validates: Requirements 5.1**
    - Generate array transaksi non-kosong, panggil `renderList()`, verifikasi setiap `li` mengandung tepat satu `.btn-delete` dengan `data-id` yang sesuai
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 14: Setiap item transaksi memiliki tombol hapus`

  - [ ]* 7.5 Tulis property test untuk delete
    - **Property 7: Penghapusan transaksi menghilangkan dari state dan storage**
    - **Validates: Requirements 3.5, 5.3**
    - Generate array transaksi, pilih id acak, jalankan delete, verifikasi `transactions[]` dan `loadFromStorage()` tidak mengandung id tersebut
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 7: Penghapusan transaksi menghilangkan dari state dan storage`

- [ ] 8. Implementasi SummaryBar
  - [ ] 8.1 Implementasi `computeTotals` dan `renderSummary`
    - Implementasi `computeTotals()`: reduce `transactions[]` menjadi `{ grand, Food, Transport, Fun }` — `grand = Food + Transport + Fun`
    - Implementasi `renderSummary()`: panggil `computeTotals()`, update `textContent` keempat elemen summary dengan `formatRupiah()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 8.2 Tulis property test untuk `computeTotals` — grand total
    - **Property 10: Agregasi grand total akurat**
    - **Validates: Requirements 6.1**
    - Generate array transaksi, verifikasi `grand === transactions.reduce((sum, tx) => sum + tx.amount, 0)`
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 10: Agregasi grand total akurat`

  - [ ]* 8.3 Tulis property test untuk `computeTotals` — subtotal per kategori
    - **Property 11: Agregasi subtotal per kategori akurat**
    - **Validates: Requirements 6.2**
    - Generate array transaksi, verifikasi setiap subtotal kategori identik dengan hasil filter + reduce manual per kategori
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 11: Agregasi subtotal per kategori akurat`

- [ ] 9. Implementasi Chart
  - [ ] 9.1 Implementasi `renderChart` dengan Chart.js doughnut
    - Implementasi `renderChart()`: jika `pieChart === null` buat instance `Chart` baru dengan konfigurasi doughnut (type, data, backgroundColor, borderColor, cutout `65%`, legend `display: false`, tooltip callback, animasi)
    - Jika instance sudah ada: update `pieChart.data.datasets[0].data` dan panggil `pieChart.update()` — jangan buat instance baru
    - Wrap dalam try-catch: jika Chart.js tidak termuat (CDN gagal), tampilkan pesan fallback di canvas container
    - _Requirements: 7.1, 7.4_

  - [ ] 9.2 Implementasi tooltip callback dan custom legend
    - Implementasi tooltip `label` callback: hitung `pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0`, return ` ${formatRupiah(val)} (${pct}%)`
    - Setelah update chart, iterasi `CATEGORIES` dan update `#legend-val-{cat}` dengan `formatRupiah(catTotal) + ' (' + pct + '%)'`
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ]* 9.3 Tulis property test untuk tooltip callback chart
    - **Property 13: Tooltip chart menampilkan format yang benar**
    - **Validates: Requirements 7.3, 7.5**
    - Generate nilai `amount` dan `total` acak (total > 0), panggil tooltip callback secara langsung, verifikasi output mengandung representasi Rupiah dan persentase 1 desimal
    - Tambahkan komentar: `// Feature: expense-budget-visualizer, Property 13: Tooltip chart menampilkan format yang benar`

- [ ] 10. Implementasi Form submit handler, `addTransaction`, `renderAll`, dan inisialisasi
  - [ ] 10.1 Implementasi `addTransaction` dan `renderAll`
    - Implementasi `addTransaction(name, amount, category)`: buat objek Transaction dengan `crypto.randomUUID()`, `name.trim()`, `Math.round(Number(amount))`, dan `new Date().toISOString()`; push ke `transactions[]`; panggil `saveToStorage()`
    - Implementasi `renderAll()`: panggil `renderList()`, `renderSummary()`, `renderChart()` secara sinkron
    - _Requirements: 1.4, 3.1, 4.5, 5.6, 5.7, 6.3, 7.4_

  - [ ] 10.2 Implementasi form submit event listener dan inisialisasi
    - Tambahkan event listener `submit` pada `form`: `e.preventDefault()`, panggil `validateForm()`, jika false return, panggil `addTransaction()`, `renderAll()`, `form.reset()`, `clearErrors()`, `inputName.focus()`
    - Tambahkan IIFE `init()`: set `transactions = loadFromStorage()`, panggil `renderAll()`
    - _Requirements: 1.4, 1.7, 3.2, 3.3, 3.4_

- [ ] 11. Checkpoint akhir — Pastikan semua tests lolos dan aplikasi berjalan
  - Jalankan `npm test` (atau `npx vitest --run`), pastikan semua property tests dan unit tests lolos.
  - Buka `index.html` di browser, verifikasi semua fitur berfungsi: tambah transaksi, validasi error, hapus dengan confirm, summary update, chart update, localStorage persist saat refresh.

---

## Notes

- Task bertanda `*` bersifat opsional dan bisa dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoint memastikan validasi incremental di tengah proses
- Property tests menggunakan **fast-check** + **Vitest** sesuai testing strategy di design.md
- Unit tests dan property tests saling melengkapi — bukan pengganti
- Karena tidak ada bundler, fungsi yang ditest perlu diekspor atau dites via JSDOM environment
- Vitest mendukung JSDOM via `testEnvironment: 'jsdom'` di konfigurasi

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["3.3", "3.4", "4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7"] },
    { "id": 5, "tasks": ["7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "7.5", "8.2", "8.3", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["9.3", "10.2"] }
  ]
}
```
