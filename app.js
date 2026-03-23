const SUPABASE_URL = 'https://zlyvcvgystrqrgrcrala.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpseXZjdmd5c3RycXJncmNyYWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDAwNDEsImV4cCI6MjA4OTg3NjA0MX0.syAtrCFZD72vgrZl0pIfmDT_AOTuyimhayXyhC5GBz4';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let entries = [];
let editingId = null;
let dateType = 'single';

// DOM elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailSpan = document.getElementById('userEmail');

const form = document.getElementById('entryForm');
const tableBody = document.getElementById('tableBody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const exportBtn = document.getElementById('exportBtn');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const singleDateWrapper = document.getElementById('singleDateWrapper');
const rangeDateWrapper = document.getElementById('rangeDateWrapper');

// ========== AUTH ==========

async function checkSession() {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        showApp(session.user);
    } else {
        showLogin();
    }
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showApp(user) {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userEmailSpan.textContent = user.email;
    loadEntries();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        loginError.textContent = 'Email veya şifre hatalı.';
        loginError.classList.remove('hidden');
        return;
    }

    showApp(data.user);
});

signupBtn.addEventListener('click', async () => {
    loginError.classList.add('hidden');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (password.length < 6) {
        loginError.textContent = 'Şifre en az 6 karakter olmalı.';
        loginError.classList.remove('hidden');
        return;
    }

    // Check whitelist first
    const { data: allowed } = await db
        .from('allowed_users')
        .select('email')
        .eq('email', email)
        .single();

    if (!allowed) {
        loginError.textContent = 'Bu email adresi yetkili değil.';
        loginError.classList.remove('hidden');
        return;
    }

    const { data, error } = await db.auth.signUp({ email, password });

    if (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
        return;
    }

    if (data.user && data.session) {
        showApp(data.user);
    } else {
        loginError.textContent = 'Kayıt başarılı! Email adresinize gelen doğrulama linkine tıklayın.';
        loginError.classList.remove('hidden');
        loginError.style.background = 'rgba(34, 197, 94, 0.15)';
        loginError.style.color = '#4ade80';
    }
});

logoutBtn.addEventListener('click', async () => {
    await db.auth.signOut();
    showLogin();
});

// Listen for auth changes
db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        showApp(session.user);
    } else if (event === 'SIGNED_OUT') {
        showLogin();
    }
});

// ========== CRUD ==========

async function loadEntries() {
    const { data, error } = await db
        .from('entries')
        .select('*')
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Load error:', error);
        return;
    }
    entries = data;
    render();
}

async function insertEntry(entry) {
    const { data, error } = await db
        .from('entries')
        .insert([entry])
        .select();

    if (error) {
        console.error('Insert error:', error);
        alert('Kayıt eklenirken hata oluştu.');
        return null;
    }
    return data[0];
}

async function updateEntry(id, entry) {
    const { data, error } = await db
        .from('entries')
        .update(entry)
        .eq('id', id)
        .select();

    if (error) {
        console.error('Update error:', error);
        alert('Kayıt güncellenirken hata oluştu.');
        return null;
    }
    return data[0];
}

async function removeEntry(id) {
    const { error } = await db
        .from('entries')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete error:', error);
        alert('Kayıt silinirken hata oluştu.');
        return false;
    }
    return true;
}

// ========== FORMATTING ==========

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function formatDateDisplay(entry) {
    if (entry.date_type === 'single') {
        return formatDate(entry.start_date);
    }
    const s = new Date(entry.start_date + 'T00:00:00');
    const e = new Date(entry.end_date + 'T00:00:00');
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

function getDayCount(entry) {
    if (entry.date_type === 'single') return 1;
    const s = new Date(entry.start_date + 'T00:00:00');
    const e = new Date(entry.end_date + 'T00:00:00');
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function formatEuro(value) {
    if (value == null || value === '' || isNaN(value)) return '';
    return Number(value).toFixed(2) + ' \u20AC';
}

function calcTotal(entry) {
    if (entry.euro == null || entry.euro === '' || isNaN(entry.euro)) return '';
    return (getDayCount(entry) * Number(entry.euro)).toFixed(2) + ' \u20AC';
}

function statusBadge(value) {
    if (value === '\u2705') return '<span class="status-badge yes">\u2705</span>';
    if (value === '\u0130ptal' || value === 'İptal') return '<span class="status-badge cancelled">İptal</span>';
    return '<span class="status-badge no">\u2014</span>';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== RENDER ==========

function render() {
    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="9" class="empty-state">
                <span>📋</span>Henüz kayıt yok
            </td></tr>`;
        return;
    }

    tableBody.innerHTML = entries.map(entry => `
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
                <button class="action-btn edit" onclick="editEntryUI(${entry.id})" title="Düzenle">✏️</button>
                <button class="action-btn delete" onclick="deleteEntryUI(${entry.id})" title="Sil">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ========== UI EVENTS ==========

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

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const start_date = dateType === 'single'
        ? document.getElementById('singleDate').value
        : document.getElementById('startDate').value;
    const end_date = dateType === 'range'
        ? document.getElementById('endDate').value
        : null;

    if (!start_date) {
        alert('Lütfen bir tarih girin.');
        return;
    }
    if (dateType === 'range' && !end_date) {
        alert('Lütfen bitiş tarihini girin.');
        return;
    }

    const euroVal = document.getElementById('euro').value;

    const entry = {
        date_type: dateType,
        start_date,
        end_date,
        purpose: document.getElementById('purpose').value.trim(),
        asked: document.getElementById('asked').checked ? '✅' : '',
        confirmed: document.getElementById('confirmed').checked ? '✅' : '',
        paid: document.getElementById('paid').checked ? '✅' : '',
        euro: euroVal !== '' ? parseFloat(euroVal) : null,
        notes: document.getElementById('notes').value.trim(),
    };

    submitBtn.disabled = true;

    if (editingId) {
        const result = await updateEntry(editingId, entry);
        if (result) {
            editingId = null;
            submitBtn.textContent = 'Ekle';
            cancelBtn.classList.add('hidden');
        }
    } else {
        await insertEntry(entry);
    }

    submitBtn.disabled = false;
    await loadEntries();
    resetForm();
});

function editEntryUI(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    editingId = id;
    submitBtn.textContent = 'Güncelle';
    cancelBtn.classList.remove('hidden');

    dateType = entry.date_type;
    toggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === dateType);
    });

    if (dateType === 'single') {
        singleDateWrapper.classList.remove('hidden');
        rangeDateWrapper.classList.add('hidden');
        document.getElementById('singleDate').value = entry.start_date;
    } else {
        singleDateWrapper.classList.add('hidden');
        rangeDateWrapper.classList.remove('hidden');
        document.getElementById('startDate').value = entry.start_date;
        document.getElementById('endDate').value = entry.end_date;
    }

    document.getElementById('purpose').value = entry.purpose || '';
    document.getElementById('asked').checked = entry.asked === '✅';
    document.getElementById('confirmed').checked = entry.confirmed === '✅';
    document.getElementById('paid').checked = entry.paid === '✅';
    document.getElementById('euro').value = entry.euro != null ? entry.euro : '';
    document.getElementById('notes').value = entry.notes || '';

    form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteEntryUI(id) {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    const success = await removeEntry(id);
    if (success) await loadEntries();
}

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

exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freedom_dates.json';
    a.click();
    URL.revokeObjectURL(url);
});

// ========== INIT ==========

checkSession();
