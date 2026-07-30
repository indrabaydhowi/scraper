// Data Fetching Simulation
const mockJournals = [
    {
        id: 1,
        journal_name: "Indonesian Journal of Computer Science",
        journal_url: "https://ejournal.unsri.ac.id/index.php/ijcs",
        index_level: "S1",
        scopus_quartile: "Q2",
        apc_fee: "Gratis",
        apc_fee_numeric_idr: null,
        is_free: true,
        contact_info: [
            { type: "email", value: "editor@ijcs.ac.id" },
            { type: "whatsapp", value: "+62 812-3456-7890" }
        ],
        exception_notes: "Waiver tersedia untuk penulis dari negara berkembang.",
        last_scraped_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        source_status: "ok"
    },
    {
        id: 2,
        journal_name: "Journal of Artificial Intelligence Research",
        journal_url: "https://jair.org/index.php/jair",
        index_level: "S2",
        scopus_quartile: null,
        apc_fee: "Rp 1.500.000",
        apc_fee_numeric_idr: 1500000,
        is_free: false,
        contact_info: [
            { type: "telegram", value: "t.me/jair_editor" }
        ],
        exception_notes: "Diskon 50% untuk mahasiswa S3.",
        last_scraped_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        source_status: "ok"
    },
    {
        id: 3,
        journal_name: "Medical Science Journal of Indonesia",
        journal_url: "https://mji.ui.ac.id/journal/index.php/mji",
        index_level: "S1",
        scopus_quartile: "Q3",
        apc_fee: "500 USD",
        apc_fee_numeric_idr: 7500000, 
        is_free: false,
        contact_info: [
            { type: "email", value: "contact@msji.org" }
        ],
        exception_notes: "Biaya khusus penulis lokal Rp 3.500.000.",
        last_scraped_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        source_status: "ok"
    },
    {
        id: 4,
        journal_name: "Jurnal Pendidikan dan Kebudayaan",
        journal_url: "https://jurnaldikbud.kemdikbud.go.id/index.php/jpnk",
        index_level: "S3",
        scopus_quartile: null,
        apc_fee: "Gratis",
        apc_fee_numeric_idr: null,
        is_free: true,
        contact_info: [
            { type: "whatsapp", value: "+62 855-1122-3344" }
        ],
        exception_notes: "Sepenuhnya didanai oleh kementerian.",
        last_scraped_at: new Date().toISOString(), // Today
        source_status: "partial" // Show partial badge
    },
    {
        id: 5,
        journal_name: "International Journal of Engineering",
        journal_url: "https://ije.ir/index.php/ije",
        index_level: "S6", // Testing S6 badge
        scopus_quartile: "Q4",
        apc_fee: "Website tidak bisa diakses",
        apc_fee_numeric_idr: null,
        is_free: false,
        contact_info: [],
        exception_notes: "",
        last_scraped_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        source_status: "unreachable" // Show unreachable badge
    }
];

let globalJournals = [];

async function fetchJournals() {
    // Simulate API delay
    return new Promise(resolve => setTimeout(() => resolve([...mockJournals]), 300));
}

// i18n Dictionary
const translations = {
    id: {
        page_title: "Sinta AI Scraper | Arsitektur Hybrid Premium",
        nav_features: "Fitur",
        nav_dashboard: "Dasbor",
        export_excel: "Ekspor .xlsx",
        hero_badge: "Arsitektur Hybrid AI v2.0",
        hero_title_1: "Pencarian Jurnal Cerdas dengan",
        hero_title_2: "Kecerdasan Local LLM",
        hero_subtitle: "Ekstrak data jurnal Sinta & Scopus, biaya APC, waiver, dan kontak langsung dengan sangat cepat. Didukung 99% ekstraksi Regex presisi dan 1% AI cerdas.",
        cta_explore: "Mulai Jelajahi",
        cta_learn: "Pelajari Cara Kerjanya",
        stat_indexed: "Jurnal Terindeks",
        stat_cost: "Bebas Biaya API",
        stat_ai: "AI Lokal Gratis",
        feature_heading_1: "Dibuat untuk",
        feature_heading_2: "Peneliti & Dosen",
        feature_subheading: "Semua yang Anda butuhkan untuk menemukan wadah publikasi yang tepat.",
        feat_1_title: "Scraping Hybrid",
        feat_1_desc: "Memprioritaskan ekstraksi klasik yang secepat kilat (XPath/Regex). Hanya memanggil Local LLM ketika menemukan biaya berformat naratif kompleks atau kontak yang ambigu.",
        feat_2_title: "Privasi Penuh",
        feat_2_desc: "Berjalan sepenuhnya pada infrastruktur Anda melalui Ollama (Llama 3.1). Tanpa biaya API, tanpa kebocoran data. 100% aman dan gratis selamanya.",
        feat_3_title: "Kontak Instan",
        feat_3_desc: "Hindari pencarian manual. Secara otomatis mengekstrak email Editor, nomor WhatsApp, dan tautan Telegram langsung ke dasbor Anda.",
        filter_explore: "Eksplorasi Data",
        filter_search_placeholder: "Cari waiver, diskon...",
        filter_apc: "Biaya Publikasi (APC)",
        filter_free: "Gratis / Waiver",
        filter_paid: "Berbayar (Termurah)",
        filter_sinta: "Akreditasi Sinta",
        filter_scopus: "Kuartil Scopus",
        results_title: "Repositori Langsung",
        results_loading: "Memuat data...",
        footer_copyright: "© 2026 Sinta AI Scraper. Dibuat untuk Peneliti Indonesia.",
        footer_disclaimer: "Disclaimer: Data diperoleh melalui metode crawling otomatis dan mungkin memiliki jeda waktu pembaruan. Silakan verifikasi langsung ke situs web jurnal untuk keputusan final.",
        msg_no_results: "Tidak ada jurnal yang sesuai dengan kriteria Anda.",
        msg_results_found: "data ditemukan",
        label_apc: "Biaya Publikasi (APC)",
        label_updated: "Diperbarui",
        time_today: "hari ini",
        time_yesterday: "kemarin",
        time_days_ago: "hari lalu",
        status_unreachable: "Situs tidak dapat diakses",
        status_partial: "Data sebagian",
        export_alert: "Mensimulasikan ekspor ke Excel (.xlsx) menggunakan data Hybrid AI premium..."
    },
    en: {
        page_title: "Sinta AI Scraper | Premium Hybrid Architecture",
        nav_features: "Features",
        nav_dashboard: "Dashboard",
        export_excel: "Export .xlsx",
        hero_badge: "Hybrid AI Architecture v2.0",
        hero_title_1: "Smarter Journal Discovery with",
        hero_title_2: "Local LLM Intelligence",
        hero_subtitle: "Effortlessly extract Sinta & Scopus journal data, APC fees, waivers, and direct contacts at lightning speed. Powered by 99% precise Regex and 1% smart AI fallback.",
        cta_explore: "Start Exploring",
        cta_learn: "Learn How It Works",
        stat_indexed: "Indexed Journals",
        stat_cost: "Zero API Cost",
        stat_ai: "Free Local AI",
        feature_heading_1: "Built for",
        feature_heading_2: "Researchers & Lecturers",
        feature_subheading: "Everything you need to find the perfect publication venue.",
        feat_1_title: "Hybrid Scraping",
        feat_1_desc: "Prioritizes lightning-fast classic extraction (XPath/Regex). Only calls the Local LLM when encountering complex narrative fees or ambiguous contacts.",
        feat_2_title: "Absolute Privacy",
        feat_2_desc: "Runs entirely on your infrastructure via Ollama (Llama 3.1). No API fees, no data leaks. 100% secure and free forever.",
        feat_3_title: "Instant Contacts",
        feat_3_desc: "Skips the manual digging. Automatically extracts direct Editor emails, WhatsApp numbers, and Telegram links right to your dashboard.",
        filter_explore: "Explore Data",
        filter_search_placeholder: "Search waiver, discount...",
        filter_apc: "Publication Fee (APC)",
        filter_free: "Free / Waiver",
        filter_paid: "Paid (Sort Cheapest)",
        filter_sinta: "Sinta Accreditation",
        filter_scopus: "Scopus Quartile",
        results_title: "Live Repository",
        results_loading: "Loading data...",
        footer_copyright: "© 2026 Sinta AI Scraper. Built for Indonesian Researchers.",
        footer_disclaimer: "Disclaimer: Data is obtained via automated crawling methods and may have update delays. Please verify directly with the journal website for final decisions.",
        msg_no_results: "No journals match your criteria.",
        msg_results_found: "entries found",
        label_apc: "Article Processing Charge (APC)",
        label_updated: "Updated",
        time_today: "today",
        time_yesterday: "yesterday",
        time_days_ago: "days ago",
        status_unreachable: "Site unreachable",
        status_partial: "Partial data",
        export_alert: "Simulating export to Excel (.xlsx) using premium Hybrid AI data..."
    }
};

let currentLang = localStorage.getItem('sinta-scraper-lang') || 'id';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('sinta-scraper-lang', lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key]; 
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    if (globalJournals.length > 0) {
        applyFilters(); 
    }
}

document.getElementById('lang-id').addEventListener('click', () => applyLanguage('id'));
document.getElementById('lang-en').addEventListener('click', () => applyLanguage('en'));

const journalsGrid = document.getElementById('journals-grid');
const resultsCount = document.getElementById('results-count');
const searchNotes = document.getElementById('search-notes');
const filterFree = document.getElementById('filter-free');
const filterPaid = document.getElementById('filter-paid');
const sintaCheckboxes = document.querySelectorAll('#sinta-filters input');
const scopusCheckboxes = document.querySelectorAll('#scopus-filters input');
const exportExcelBtn = document.getElementById('export-excel');

const icons = {
    email: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    whatsapp: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    telegram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'
};

// Relative time formatting
function getRelativeTimeText(isoString, lang) {
    if (!isoString) return '';
    const scrapedDate = new Date(isoString);
    const now = new Date();
    // Start of current day vs start of scraped day to avoid time-of-day offsets
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(scrapedDate.getFullYear(), scrapedDate.getMonth(), scrapedDate.getDate());
    
    const diffTime = Math.abs(today - targetDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 0) {
        return translations[lang].time_today;
    } else if (diffDays === 1) {
        return translations[lang].time_yesterday;
    } else {
        return `${diffDays} ${translations[lang].time_days_ago}`;
    }
}

function renderJournals(data) {
    journalsGrid.style.opacity = '0';
    
    setTimeout(() => {
        journalsGrid.innerHTML = '';
        
        if (data.length === 0) {
            journalsGrid.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p class="empty-state-text">${translations[currentLang].msg_no_results}</p>
                </div>`;
            resultsCount.textContent = '0 ' + translations[currentLang].msg_results_found;
            journalsGrid.style.opacity = '1';
            return;
        }

        resultsCount.textContent = `${data.length} ${translations[currentLang].msg_results_found}`;

        data.forEach(journal => {
            const card = document.createElement('div');
            card.className = 'journal-card glass-panel';
            
            // Dynamic badges based on PRD requirements
            let badgesHtml = '';
            if (journal.index_level) {
                const sintaClass = `badge-${journal.index_level.toLowerCase()}`;
                badgesHtml += `<span class="j-badge ${sintaClass}">${journal.index_level}</span>`;
            }
            
            if (journal.scopus_quartile) {
                const scopusClass = `badge-${journal.scopus_quartile.toLowerCase()}`;
                badgesHtml += `<span class="j-badge ${scopusClass}">${journal.scopus_quartile}</span>`;
            }

            // Status Badges
            if (journal.source_status === 'unreachable') {
                badgesHtml += `<span class="j-badge badge-warning">${translations[currentLang].status_unreachable}</span>`;
            } else if (journal.source_status === 'partial') {
                badgesHtml += `<span class="j-badge badge-neutral">${translations[currentLang].status_partial}</span>`;
            }

            let contactsHtml = (journal.contact_info || []).map(contact => `
                <div class="contact-row">
                    ${icons[contact.type] || icons.email}
                    <span>${contact.value}</span>
                </div>
            `).join('');

            let notesHtml = journal.exception_notes 
                ? `<div class="ai-note"><span>AI:</span> ${journal.exception_notes}</div>` 
                : '';

            const relativeTimeText = getRelativeTimeText(journal.last_scraped_at, currentLang);

            card.innerHTML = `
                <div class="j-header">
                    <a href="${journal.journal_url}" target="_blank" rel="noopener noreferrer" class="j-title" title="Buka website ${journal.journal_name}">
                        ${journal.journal_name}
                        <svg class="external-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; opacity: 0.6; display: inline-block; vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                    <div class="j-badges">
                        ${badgesHtml}
                    </div>
                </div>
                
                <div class="j-body">
                    <span class="fee-label">${translations[currentLang].label_apc}</span>
                    <span class="fee-amount ${journal.is_free ? 'fee-free' : 'fee-paid'}">
                        ${journal.apc_fee}
                    </span>
                </div>

                <div class="j-footer">
                    ${contactsHtml}
                    ${notesHtml}
                    <div class="timestamp">${translations[currentLang].label_updated} ${relativeTimeText}</div>
                </div>
            `;
            
            journalsGrid.appendChild(card);
        });
        
        journalsGrid.style.transition = 'opacity 0.3s ease';
        journalsGrid.style.opacity = '1';
    }, 150);
}

function applyFilters() {
    let filtered = [...globalJournals];

    const searchTerm = searchNotes.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(j => 
            (j.exception_notes && j.exception_notes.toLowerCase().includes(searchTerm)) ||
            j.journal_name.toLowerCase().includes(searchTerm)
        );
    }

    const isFreeChecked = filterFree.checked;
    const isPaidChecked = filterPaid.checked;
    
    if (isFreeChecked && !isPaidChecked) {
        filtered = filtered.filter(j => j.is_free);
    } else if (isPaidChecked && !isFreeChecked) {
        filtered = filtered.filter(j => !j.is_free);
    }
    
    if (isPaidChecked) {
        filtered.sort((a, b) => {
            if (a.is_free && !b.is_free) return -1;
            if (!a.is_free && b.is_free) return 1;
            if (!a.is_free && !b.is_free) return (a.apc_fee_numeric_idr || 0) - (b.apc_fee_numeric_idr || 0);
            return 0;
        });
    }

    const selectedSinta = Array.from(sintaCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedSinta.length > 0) {
        filtered = filtered.filter(j => selectedSinta.includes(j.index_level));
    }

    const selectedScopus = Array.from(scopusCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedScopus.length > 0) {
        filtered = filtered.filter(j => j.scopus_quartile && selectedScopus.includes(j.scopus_quartile));
    }

    renderJournals(filtered);
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const debouncedApplyFilters = debounce(applyFilters, 300);

searchNotes.addEventListener('input', debouncedApplyFilters);
filterFree.addEventListener('change', applyFilters);
filterPaid.addEventListener('change', applyFilters);
sintaCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
scopusCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

exportExcelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert(translations[currentLang].export_alert);
});

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(5, 5, 5, 0.9)';
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
    } else {
        nav.style.background = 'rgba(5, 5, 5, 0.7)';
        nav.style.boxShadow = 'none';
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialization
applyLanguage(currentLang);

fetchJournals().then(data => {
    globalJournals = data;
    applyFilters();
});
