/* ===================================================
   Expense & Budget Visualizer — app.js
   Data disimpan di localStorage key: "ebv_transactions"
=================================================== */

'use strict';

// ── Constants ──────────────────────────────────────
const STORAGE_KEY = 'ebv_transactions';
const CATEGORIES  = ['Food', 'Transport', 'Fun'];
const CAT_COLORS  = {
  Food:      '#f59e0b',
  Transport: '#3b82f6',
  Fun:       '#ec4899',
};

// ── State ──────────────────────────────────────────
let transactions = [];   // array of { id, name, amount, category, date }
let pieChart     = null; // Chart.js instance

// ── DOM refs ───────────────────────────────────────
const form         = document.getElementById('expense-form');
const inputName    = document.getElementById('input-name');
const inputAmount  = document.getElementById('input-amount');
const inputCat     = document.getElementById('input-category');
const errName      = document.getElementById('err-name');
const errAmount    = document.getElementById('err-amount');
const errCat       = document.getElementById('err-category');
const txList       = document.getElementById('transaction-list');
const chartCanvas  = document.getElementById('pie-chart');

// Summary elements
const totalEl     = document.getElementById('summary-total');
const foodEl      = document.getElementById('summary-food');
const transportEl = document.getElementById('summary-transport');
const funEl       = document.getElementById('summary-fun');

// ── localStorage helpers ───────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ── Validation ─────────────────────────────────────
function clearErrors() {
  [inputName, inputAmount, inputCat].forEach(el => el.classList.remove('error'));
  [errName, errAmount, errCat].forEach(el => el.classList.remove('visible'));
}

function showError(inputEl, msgEl, message) {
  inputEl.classList.add('error');
  msgEl.textContent = message;
  msgEl.classList.add('visible');
}

function validateForm() {
  clearErrors();
  let valid = true;

  const name   = inputName.value.trim();
  const amount = inputAmount.value.trim();
  const cat    = inputCat.value;

  if (!name) {
    showError(inputName, errName, 'Nama item tidak boleh kosong.');
    valid = false;
  } else if (name.length > 60) {
    showError(inputName, errName, 'Nama terlalu panjang (maks 60 karakter).');
    valid = false;
  }

  if (!amount) {
    showError(inputAmount, errAmount, 'Jumlah tidak boleh kosong.');
    valid = false;
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    showError(inputAmount, errAmount, 'Jumlah harus berupa angka positif.');
    valid = false;
  } else if (Number(amount) > 1_000_000_000) {
    showError(inputAmount, errAmount, 'Jumlah terlalu besar (maks 1.000.000.000).');
    valid = false;
  }

  if (!cat || !CATEGORIES.includes(cat)) {
    showError(inputCat, errCat, 'Pilih salah satu kategori.');
    valid = false;
  }

  return valid;
}

// ── Format helpers ─────────────────────────────────
function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Render transaction list ─────────────────────────
function renderList() {
  txList.innerHTML = '';

  if (transactions.length === 0) {
    txList.innerHTML = '<li class="empty-state">Belum ada transaksi. Tambahkan yang pertama! 🎉</li>';
    return;
  }

  // Newest first
  [...transactions].reverse().forEach(tx => {
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.dataset.id = tx.id;

    li.innerHTML = `
      <span class="category-dot ${tx.category}" aria-hidden="true"></span>
      <div class="tx-info">
        <div class="tx-name" title="${escapeHtml(tx.name)}">${escapeHtml(tx.name)}</div>
        <div class="tx-meta">${tx.category} &middot; ${formatDate(tx.date)}</div>
      </div>
      <span class="tx-amount">${formatRupiah(tx.amount)}</span>
      <button class="btn-delete" aria-label="Hapus transaksi ${escapeHtml(tx.name)}" data-id="${tx.id}">
        ✕
      </button>
    `;

    txList.appendChild(li);
  });
}

// ── Compute totals ──────────────────────────────────
function computeTotals() {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  transactions.forEach(tx => { totals[tx.category] += tx.amount; });
  const grand = totals.Food + totals.Transport + totals.Fun;
  return { grand, ...totals };
}

// ── Render summary ──────────────────────────────────
function renderSummary() {
  const { grand, Food, Transport, Fun } = computeTotals();
  totalEl.textContent     = formatRupiah(grand);
  foodEl.textContent      = formatRupiah(Food);
  transportEl.textContent = formatRupiah(Transport);
  funEl.textContent       = formatRupiah(Fun);
}

// ── Render / update pie chart ───────────────────────
function renderChart() {
  const { Food, Transport, Fun } = computeTotals();
  const data   = [Food, Transport, Fun];
  const labels = ['Food', 'Transport', 'Fun'];
  const colors = [CAT_COLORS.Food, CAT_COLORS.Transport, CAT_COLORS.Fun];
  const total  = data.reduce((a, b) => a + b, 0);

  if (pieChart) {
    // Update existing chart
    pieChart.data.datasets[0].data = data;
    pieChart.update();
  } else {
    // Create chart
    pieChart = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive:  true,
        cutout:      '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const val = ctx.parsed;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${formatRupiah(val)} (${pct}%)`;
              },
            },
          },
        },
        animation: { animateRotate: true, duration: 500 },
      },
    });
  }

  // Update custom legend values
  CATEGORIES.forEach(cat => {
    const el = document.getElementById(`legend-val-${cat.toLowerCase()}`);
    if (el) {
      const catTotals = { Food, Transport, Fun };
      const pct = total > 0 ? ((catTotals[cat] / total) * 100).toFixed(1) : 0;
      el.textContent = `${formatRupiah(catTotals[cat])} (${pct}%)`;
    }
  });
}

// ── Add transaction ─────────────────────────────────
function addTransaction(name, amount, category) {
  const tx = {
    id:       crypto.randomUUID(),
    name:     name.trim(),
    amount:   Math.round(Number(amount)),
    category,
    date:     new Date().toISOString(),
  };
  transactions.push(tx);
  saveToStorage();
}

// ── Delete transaction ──────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToStorage();
}

// ── Full re-render (list + summary + chart) ─────────
function renderAll() {
  renderList();
  renderSummary();
  renderChart();
}

// ── XSS helper ─────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Event: form submit ──────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;

  addTransaction(inputName.value, inputAmount.value, inputCat.value);
  renderAll();

  // Reset form
  form.reset();
  clearErrors();
  inputName.focus();
});

// ── Event: clear individual field error on input ────
inputName.addEventListener('input', () => {
  inputName.classList.remove('error');
  errName.classList.remove('visible');
});
inputAmount.addEventListener('input', () => {
  inputAmount.classList.remove('error');
  errAmount.classList.remove('visible');
});
inputCat.addEventListener('change', () => {
  inputCat.classList.remove('error');
  errCat.classList.remove('visible');
});

// ── Event: delete (event delegation on list) ───────
txList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;

  const id = btn.dataset.id;
  deleteTransaction(id);
  renderAll();
});

// ── Init ────────────────────────────────────────────
(function init() {
  transactions = loadFromStorage();
  renderAll();
})();
