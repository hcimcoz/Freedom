const STORAGE_KEY = 'freedom_dates_v2';

const initialData = [
    { id: 1, dateType: 'range', startDate: '2025-04-19', endDate: '2025-04-27', purpose: 'Kreta', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 2, dateType: 'range', startDate: '2025-05-03', endDate: '2025-05-04', purpose: 'Eva&Markus DG', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 3, dateType: 'single', startDate: '2025-05-16', endDate: '', purpose: 'Yeşim', asked: '✅', confirmed: '✅', paid: '✅', notes: "Üstteki iptal oldu, onun yerine 21'inde Hamdi'ye gitti" },
    { id: 4, dateType: 'single', startDate: '2025-05-20', endDate: '', purpose: 'Sean DG', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 5, dateType: 'range', startDate: '2025-05-23', endDate: '2025-05-25', purpose: 'OMTC maç ve Köln', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 6, dateType: 'range', startDate: '2025-06-03', endDate: '2025-06-04', purpose: 'Ismo - Frankfurt', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 7, dateType: 'range', startDate: '2025-06-12', endDate: '2025-06-16', purpose: 'Londra', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 8, dateType: 'range', startDate: '2025-07-03', endDate: '2025-07-04', purpose: 'Holger ÖYD - Köln', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 9, dateType: 'single', startDate: '2025-07-08', endDate: '', purpose: 'Kolonoskopi', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 10, dateType: 'single', startDate: '2025-07-15', endDate: '', purpose: 'Kolonoskopi', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 11, dateType: 'range', startDate: '2025-07-21', endDate: '2025-07-30', purpose: 'Scotland', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 12, dateType: 'range', startDate: '2025-08-09', endDate: '2025-08-12', purpose: "Yamanel'ler", asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 13, dateType: 'range', startDate: '2025-08-15', endDate: '2025-08-18', purpose: "Yusuf'larla Paris", asked: 'İptal', confirmed: '', paid: '', notes: '' },
    { id: 14, dateType: 'range', startDate: '2025-09-28', endDate: '2025-10-06', purpose: "Burak'larla tekne", asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 15, dateType: 'range', startDate: '2025-10-21', endDate: '2025-10-27', purpose: "Saadet'lerle Belçika", asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 16, dateType: 'single', startDate: '2025-10-17', endDate: '', purpose: 'Frankfurter Buchmesse', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 17, dateType: 'range', startDate: '2025-11-27', endDate: '2025-12-01', purpose: 'Londra', asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 18, dateType: 'range', startDate: '2026-02-15', endDate: '2026-02-26', purpose: 'François - Benin', asked: '✅', confirmed: '✅', paid: '✅', notes: "15.10.25'te, bir üstteki 1 tek gün + bu seyahatin 5 gününü ödedim. 02.12.25'te de bu seyahatin kalan 7 gününü ödedim." },
    { id: 19, dateType: 'single', startDate: '2026-04-18', endDate: '', purpose: "IKEA'ya gittik", asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 20, dateType: 'single', startDate: '2026-03-02', endDate: '', purpose: "Markus'larla sinema", asked: '✅', confirmed: '✅', paid: '✅', notes: '' },
    { id: 21, dateType: 'range', startDate: '2026-03-05', endDate: '2026-03-10', purpose: 'Londra', asked: '✅', confirmed: '✅', paid: '✅', notes: 'İptal olan 12 günlük Benin seyahatinin 6 gününü buraya kullandık. 6 gün daha alacağımız var.' },
    { id: 22, dateType: 'single', startDate: '2026-03-24', endDate: '', purpose: "Yeşim'le sinema", asked: '✅', confirmed: '✅', paid: '✅', notes: "17.03.2026'da bugünün parasını ve Nisan'daki Krakow seyahati için kalan 2 gün borcumuzu, üstüne de Şubat'ı iptal ettiğimiz için üzülüp 100€ gönderdim." },
    { id: 23, dateType: 'range', startDate: '2026-04-20', endDate: '2026-04-27', purpose: 'Prag-Krakow-Dresden', asked: '✅', confirmed: '✅', paid: '', notes: '' },
];

let entries = [];
let editingId = null;
let nextId = 100;

// DOM elements
const form = document.getElementById('entryForm');
const tableBody = document.getElementById('tableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const exportBtn = document.getElementById('exportBtn');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const singleDateWrapper = document.getElementById('singleDateWrapper');
const rangeDateWrapper = document.getElementById('rangeDateWrapper');

// State
let dateType = 'single';

// Init
function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        entries = JSON.parse(stored);
        nextId = Math.max(...entries.map(e => e.id), 99) + 1;
    } else {
        entries = initialData;
        nextId = 100;
        save();
    }
    render();
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Date formatting
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function formatDateDisplay(entry) {
    if (entry.dateType === 'single') {
        return formatDate(entry.startDate);
    }
    const s = new Date(entry.startDate + 'T00:00:00');
    const e = new Date(entry.endDate + 'T00:00:00');
    const sd = String(s.getDate()).padStart(2, '0');
    const sm = String(s.getMonth() + 1).padStart(2, '0');
    const ed = String(e.getDate()).padStart(2, '0');
    const em = String(e.getMonth() + 1).padStart(2, '0');
    const ey = e.getFullYear();

    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${sd}-${ed}.${em}.${ey}`;
    }
    return `${sd}.${sm}-${ed}.${em}.${ey}`;
}

function statusBadge(value) {
    if (value === '✅') return '<span class="status-badge yes">✅</span>';
    if (value === 'İptal') return '<span class="status-badge cancelled">İptal</span>';
    return '<span class="status-badge no">—</span>';
}

function getDayCount(entry) {
    if (entry.dateType === 'single') return 1;
    const s = new Date(entry.startDate + 'T00:00:00');
    const e = new Date(entry.endDate + 'T00:00:00');
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function formatEuro(value) {
    if (value == null || value === '' || isNaN(value)) return '';
    return Number(value).toFixed(2) + ' €';
}

function calcTotal(entry) {
    if (entry.euro == null || entry.euro === '' || isNaN(entry.euro)) return '';
    return (getDayCount(entry) * Number(entry.euro)).toFixed(2) + ' €';
}

// Render table
function render() {
    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="9" class="empty-state">
                <span>📋</span>Henüz kayıt yok
            </td></tr>`;
        return;
    }

    const sorted = [...entries].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
    });

    tableBody.innerHTML = sorted.map(entry => `
        <tr data-id="${entry.id}">
            <td class="date-cell">${formatDateDisplay(entry)}</td>
            <td class="purpose-cell">${escapeHtml(entry.purpose)}</td>
            <td class="status-cell">${statusBadge(entry.asked)}</td>
            <td class="status-cell">${statusBadge(entry.confirmed)}</td>
            <td class="status-cell">${statusBadge(entry.paid)}</td>
            <td class="euro-cell">${formatEuro(entry.euro)}</td>
            <td class="total-cell">${calcTotal(entry)}</td>
            <td class="notes-cell">${escapeHtml(entry.notes)}</td>
            <td class="actions-cell">
                <button class="action-btn edit" onclick="editEntry(${entry.id})" title="Düzenle">✏️</button>
                <button class="action-btn delete" onclick="deleteEntry(${entry.id})" title="Sil">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Toggle date type
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dateType = btn.dataset.type;

        if (dateType === 'single') {
            singleDateWrapper.classList.remove('hidden');
            rangeDateWrapper.classList.add('hidden');
        } else {
            singleDateWrapper.classList.add('hidden');
            rangeDateWrapper.classList.remove('hidden');
        }
    });
});

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const startDate = dateType === 'single'
        ? document.getElementById('singleDate').value
        : document.getElementById('startDate').value;
    const endDate = dateType === 'range'
        ? document.getElementById('endDate').value
        : '';

    if (!startDate) {
        alert('Lütfen bir tarih girin.');
        return;
    }
    if (dateType === 'range' && !endDate) {
        alert('Lütfen bitiş tarihini girin.');
        return;
    }

    const purpose = document.getElementById('purpose').value.trim();
    const asked = document.getElementById('asked').checked ? '✅' : '';
    const confirmed = document.getElementById('confirmed').checked ? '✅' : '';
    const paid = document.getElementById('paid').checked ? '✅' : '';
    const euro = document.getElementById('euro').value;
    const notes = document.getElementById('notes').value.trim();

    const entry = {
        id: editingId || nextId++,
        dateType,
        startDate,
        endDate,
        purpose,
        asked,
        confirmed,
        paid,
        euro: euro !== '' ? parseFloat(euro) : '',
        notes,
    };

    if (editingId) {
        const idx = entries.findIndex(e => e.id === editingId);
        if (idx !== -1) entries[idx] = entry;
        editingId = null;
        submitBtn.textContent = 'Ekle';
        cancelBtn.classList.add('hidden');
    } else {
        entries.push(entry);
    }

    save();
    render();
    resetForm();
});

// Edit
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    editingId = id;
    submitBtn.textContent = 'Güncelle';
    cancelBtn.classList.remove('hidden');

    // Set date type
    dateType = entry.dateType;
    toggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === dateType);
    });

    if (dateType === 'single') {
        singleDateWrapper.classList.remove('hidden');
        rangeDateWrapper.classList.add('hidden');
        document.getElementById('singleDate').value = entry.startDate;
    } else {
        singleDateWrapper.classList.add('hidden');
        rangeDateWrapper.classList.remove('hidden');
        document.getElementById('startDate').value = entry.startDate;
        document.getElementById('endDate').value = entry.endDate;
    }

    document.getElementById('purpose').value = entry.purpose;
    document.getElementById('asked').checked = entry.asked === '✅';
    document.getElementById('confirmed').checked = entry.confirmed === '✅';
    document.getElementById('paid').checked = entry.paid === '✅';
    document.getElementById('euro').value = entry.euro != null && entry.euro !== '' ? entry.euro : '';
    document.getElementById('notes').value = entry.notes || '';

    form.scrollIntoView({ behavior: 'smooth' });
}

// Delete
function deleteEntry(id) {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    entries = entries.filter(e => e.id !== id);
    save();
    render();
}

// Cancel edit
cancelBtn.addEventListener('click', () => {
    editingId = null;
    submitBtn.textContent = 'Ekle';
    cancelBtn.classList.add('hidden');
    resetForm();
});

function resetForm() {
    form.reset();
    dateType = 'single';
    toggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'single');
    });
    singleDateWrapper.classList.remove('hidden');
    rangeDateWrapper.classList.add('hidden');
}

// Export
exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freedom_dates.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Start
init();
