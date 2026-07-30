# PRD: Aplikasi Scraper Jurnal Sinta untuk Dosen (Versi Hybrid + Local LLM)

> **Status:** Active / Revisi  
> **Versi:** 2.1 (Perbaikan Skema Data, Legal, Autentikasi, & i18n)  
> **Target Pengguna:** Dosen Riset Senior, Dosen Muda, Reviewer Jurnal  
> **Arsitektur Utama:** Hybrid Scraping (99% Regex/XPath Klasik + 1% Local LLM Fallback)

---

## Changelog v2.0 → v2.1

- Skema kolom database disinkronkan dengan implementasi frontend yang sudah berjalan (menambahkan `scopus_quartile`, `apc_fee_numeric_idr`, `last_scraped_at`).
- Menambahkan bagian Autentikasi & Otorisasi (sebelumnya tidak ada).
- Menambahkan bagian Kepatuhan Legal & Etika Scraping (sebelumnya tidak ada).
- Menambahkan requirement **dukungan dua bahasa (Bahasa Indonesia & English)** pada antarmuka.
- Menambahkan rekomendasi pentahapan arsitektur (MVP vs versi penuh) agar implementasi lebih realistis untuk tim kecil/individu.

---

## 1. Ringkasan Eksekutif

Aplikasi scraper otomatis ini dirancang khusus untuk membantu dosen dan peneliti mencari data jurnal dari platform Sinta secara efisien. Fokus utama pengembangan meliputi validasi **APC (Article Processing Charge / Biaya Publikasi)**, ekstraksi **kontak jurnal langsung**, serta penelusuran **catatan khusus** (diskon/waiver).

### Pembaruan Arsitektur: Hybrid AI + Local LLM
Sistem menggunakan pendekatan **Hybrid AI**:
- **99% Ekstraksi Klasik:** Menggunakan metode Regex/XPath untuk menjaga kecepatan respon tinggi dan biaya komputasi **nol (Rp 0)**.
- **1% Local LLM Fallback:** Hanya memanggil model bahasa lokal (*Open Source*) ketika menemukan teks naratif, ambigu, atau format kontak/fee non-standar.
- **Keuntungan Utama:** Menghindari ketergantungan pada API berbayar (misal OpenAI/Claude), mencegah kebocoran data keluar, dan menjamin efisiensi biaya operasional jangka panjang.

---

## 2. Target Pengguna & Use Case

| Segment Pengguna | Kebutuhan Utama | Nilai Tambah Aplikasi |
| :--- | :--- | :--- |
| **Dosen Riset Senior** | Membutuhkan data publikasi yang akurat dan bereputasi. | Menyediakan filter Indeks Sinta (S1–S6) & Scopus (Q1–Q4) secara presisi. |
| **Dosen Muda** | Membutuhkan jurnal ber-APC murah atau gratis. | Menangkap status APC, nominal biaya, dan info *waiver* / sponsor. |
| **Reviewer & Editor** | Akses cepat ke kontak resmi pengelola jurnal. | Menangkap No. HP/WhatsApp, Telegram, Form Kontak, dan Email resmi. |

Aplikasi bersifat **read-only publik** untuk seluruh segmen di atas — lihat Bagian 5b (Autentikasi & Otorisasi) untuk batasan akses fitur administratif.

---

## 3. Sumber Data & Kolom Target

### Target URL
- **Sinta Journals:** `https://sinta.kemdikbud.go.id/journals/`
- **Sinta Scopus:** `https://sinta.kemdikbud.go.id/scopus`
- **Website resmi tiap jurnal** (diambil dari `journal_url` hasil crawl Sinta) — sumber utama untuk data APC detail dan kontak, karena info ini jarang lengkap di halaman Sinta itu sendiri.

### Frekuensi Pembaruan
- **Jadwal Scraping:** Mingguan (*Background Job* otomatis).

### Schema Kolom Data (Output Database)

| Nama Kolom | Tipe Data | Keterangan & Aturan Format |
| :--- | :--- | :--- |
| `id` | `Integer` | Primary Key, Auto Increment |
| `journal_name` | `String` | Nama resmi jurnal |
| `journal_url` | `String` | URL website resmi jurnal |
| `index_level` | `String` | Tingkat Akreditasi Sinta (S1–S6), nullable jika tidak terindeks Sinta |
| `scopus_quartile` | `String` | Kuartil Scopus (Q1–Q4), nullable jika tidak terindeks Scopus |
| `apc_fee` | `String` | Nominal mata uang apa adanya (misal: `"500 USD"`, `"Rp 3.500.000"`), `"Gratis"`, `"Hubungi Jurnal"`, atau `"Website tidak bisa diakses"` — untuk ditampilkan ke pengguna |
| `apc_fee_numeric_idr` | `Integer` (nullable) | Nilai APC **dinormalisasi ke Rupiah** menggunakan kurs saat scraping, dipakai khusus untuk sorting "termurah" dan filter numerik. `NULL` jika `apc_fee` bukan angka (Gratis/Hubungi Jurnal/dsb). Field ini wajib ada agar fitur "Berbayar (Termurah)" di frontend bisa mengurutkan data campuran USD/IDR secara benar. |
| `is_free` | `Boolean` | `true` jika APC = 0 atau ada waiver penuh |
| `contact_info` | `JSON/Text` | Daftar kontak terdeteksi: Email, No. WA/HP (`+62...`), Link Telegram, atau Form Kontak. Disimpan sebagai array objek `{type, value}` agar mudah dirender per-jenis kontak di frontend |
| `exception_notes` | `String` | Catatan khusus dari AI / parser (misal: *"Waiver tersedia untuk institusi XYZ"*, *"Biaya khusus penulis lokal"*) |
| `last_scraped_at` | `DateTime` | Timestamp scraping terakhir untuk baris ini. Ditampilkan di UI agar pengguna tahu seberapa baru datanya (misal: "Data diperbarui 3 hari lalu") |
| `source_status` | `String` | `"ok"` / `"unreachable"` / `"partial"` — menandai apakah scraping terakhir untuk jurnal ini berhasil penuh, gagal total, atau sebagian data tidak ditemukan |

> **Catatan implementasi:** kolom `scopus_quartile` dan `apc_fee_numeric_idr` sebelumnya tidak tercantum di draf awal PRD, padahal frontend yang sudah dibuat sudah mengasumsikan keduanya ada (filter kuartil Scopus dan sorting termurah). Tabel di atas sudah disesuaikan agar skema backend dan frontend konsisten.

---

## 4. Algoritma Scraping Hybrid (Logika Scraping + AI)

Alur kerja scraping menggunakan prinsip **Gratis & Cepat Dahulu, AI Kemudian**.

```
                         +-----------------------+
                         | Start Request (Sinta) |
                         +-----------+-----------+
                                     |
                                     v
                        +-------------------------+
                        |   Ekstraksi Klasik      |
                        |   (XPath / Regex)       |
                        +------------+------------+
                                     |
                         [Apakah Regex Berhasil?]
                         /                       \
                      Ya /                         \ Tidak
                        v                           v
             +--------------------+     +-------------------------+
             | Simpan Ke Database |     | Kondisi AI Fallback     |
             | (AI Tidak Dipanggil)     | (Ambil Paragraf Teks)   |
             +--------------------+     +------------+------------+
                                                     |
                                                     v
                                        +-------------------------+
                                        | Diproses Local LLM      |
                                        | (Ollama / Llama 3.1 8B) |
                                        +------------+------------+
                                                     |
                                         [Apakah LLM Berhasil?]
                                         /                      \
                                      Ya /                        \ Tidak
                                        v                          v
                             +---------------------+    +---------------------+
                             | Simpan Data Ekstrak |    | Fallback Manual     |
                             | Ke Database         |    | ("Hubungi Jurnal"/  |
                             +---------------------+    | "Tidak Ditemukan")  |
                                                        +---------------------+
```

### Tahapan Detail:

1. **Ekstraksi Klasik (100% Request Awal):**
   - Menggunakan XPath, CSS Selector, atau Regex sederhana untuk memindai halaman Sinta & Web Jurnal.
   - **Regex Email:** `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
   - **Regex Telepon/WA:** Pola `+62`, `08xx`, `(021)xxxx`.
   - Jika APC dalam USD, dilakukan konversi ke `apc_fee_numeric_idr` menggunakan kurs acuan (lihat Bagian 5, kurs diperbarui otomatis atau manual berkala).
   - *Jika angka APC dan Kontak berformat standar ditemukan, data langsung disimpan tanpa memanggil LLM.*

2. **Kondisi AI Fallback:**
   AI hanya diaktifkan jika salah satu kondisi berikut terpenuhi:
   - Regex gagal membaca APC karena penulisan naratif (contoh: *"APC: Penulis internasional $500, penulis lokal Rp 3.500.000"*).
   - Data fee di Sinta kosong dan bot perlu mengekstraksi teks web jurnal.
   - Regex gagal menemukan kontak langsung, namun terdapat klausa seperti *"Silakan hubungi kami di WhatsApp dengan klik link ini"*.

3. **Proses Ekstraksi oleh Local LLM:**
   - Bot memotong **paragraf spesifik di sekitar teks biaya & kontak** (bukan seluruh dokumen HTML).
   - Mengirim potongan teks ke Local LLM (via Ollama API) dengan prompt terstruktur.
   - **System Prompt LLM:**
     > *"Dari teks publikasi jurnal berikut, ekstrak nominal biaya APC (dalam USD atau IDR) dan semua kontak terdeteksi (Email, No. WhatsApp, Telegram). Jika ada kata 'waiver' atau 'gratis', catat pada kolom exception_notes. Jika kontak berupa tautan URL, catat link tersebut."*
   - Output LLM wajib divalidasi ke format schema (angka, tipe kontak) sebelum disimpan — jika gagal parsing, dianggap LLM gagal dan lanjut ke fallback manual.

4. **Fallback Manual (Jika Gagal Total):**
   - Web Error / Timeout (404/500/Timeout): `apc_fee` = `"Website tidak bisa diakses"`, `contact_info` = kosong, `source_status` = `"unreachable"`.
   - Web Berhasil diakses tetapi tidak ada informasi: `apc_fee` = `"Hubungi Jurnal"`, `contact_info` = `"Tidak ditemukan"`, `source_status` = `"partial"`.

---

## 5. Arsitektur Teknis & Spesifikasi Infrastruktur

- **Backend Framework:** Python (Scrapy + BeautifulSoup4).
- **Task Queue & Scheduler:** Celery + Redis (menjalankan tugas scraping mingguan tanpa memblokir UI).
- **Local LLM Engine:**
  - **Model:** Llama 3.1 8B atau Mistral 7B (Open Source).
  - **LLM Runner:** **Ollama** / **vLLM** (ringan, efisien, REST API lokal).
  - **Alasan Pemilihan:** Bebas biaya token API, tidak ada kebocoran privacy, dapat berjalan penuh offline/on-premise.
- **Anti-Blocking & Resilience:**
  - Rotasi Proxy & User-Agent acak per-request.
  - *Random Delay* (2–5 detik antar request).
  - *Robust Relative XPath Selectors* (tidak bergantung pada CSS class statis).
- **Kurs Mata Uang:** Sumber kurs USD→IDR untuk normalisasi `apc_fee_numeric_idr` diperbarui otomatis (API kurs publik) setiap siklus scraping, dengan fallback ke nilai kurs terakhir yang tersimpan jika API kurs gagal diakses.
- **System Alerting:**
  - Mengirim notifikasi otomatis ke **Telegram Bot / Email Developer** jika scraping gagal 3x berturut-turut.

### 5a. Rekomendasi Pentahapan (untuk tim kecil / solo developer)

Arsitektur di atas (Scrapy + Celery + Redis + Ollama + proxy rotation) cukup berat untuk dibangun sekaligus di awal. Disarankan:

- **Fase MVP:** Scraper sinkron sederhana (Python script terjadwal via cron), simpan ke SQLite/PostgreSQL, tanpa Celery/Redis, tanpa proxy rotation (cukup delay antar-request). LLM fallback tetap ada karena itu nilai jual utama.
- **Fase 2 (setelah MVP tervalidasi):** Migrasi ke Celery + Redis untuk scheduling, tambahkan proxy rotation jika mulai kena rate-limit/block, tambahkan alerting Telegram.

---

## 5b. Autentikasi & Otorisasi

- **Dashboard pencarian & filter (fitur utama):** akses publik, **tanpa login**. Semua pengguna (dosen, reviewer) langsung bisa mencari dan memfilter data begitu membuka halaman.
- **Panel admin (di luar scope frontend saat ini):** fitur seperti memicu re-scraping manual, melihat log kegagalan, atau mengedit data yang salah hasil scraping, **memerlukan login** (role: `admin`). Ini akan menjadi halaman terpisah, tidak tercampur dengan dashboard publik.
- Tidak ada data pribadi pengguna yang dikumpulkan di versi ini (tidak ada akun dosen/reviewer), sehingga tidak ada kebutuhan manajemen user untuk role `dosen`/`reviewer`.

---

## 5c. Kepatuhan Legal & Etika Scraping

- Scraping dilakukan hanya terhadap **data yang secara publik dapat diakses** tanpa login di Sinta maupun website jurnal.
- Sebelum scraping berjalan produksi, wajib dicek `robots.txt` dari `sinta.kemdikbud.go.id` dan domain jurnal yang di-crawl; jika suatu path secara eksplisit di-disallow, path tersebut dikecualikan dari scraping.
- Rate limiting (*random delay* 2–5 detik) diterapkan bukan hanya untuk menghindari blokir, tapi juga sebagai etika dasar agar tidak membebani server pihak ketiga (terutama server jurnal kecil yang mungkin memiliki kapasitas terbatas).
- Data yang ditampilkan (APC, kontak) adalah data yang sudah dipublikasikan jurnal untuk keperluan penulis — bukan data pribadi/sensitif individu, sehingga risiko privasi rendah. Kontak yang disimpan (email/WA editor) adalah kontak institusional/profesional, bukan personal.
- Aplikasi mencantumkan disclaimer di footer bahwa data bersifat hasil crawling otomatis dan dapat memiliki jeda waktu (lihat `last_scraped_at`), sehingga pengguna disarankan mengecek langsung ke website jurnal untuk keputusan final.

---

## 6. Fitur Antarmuka Pengguna (Frontend)

- **Filter Biaya (APC):**
  - Toggle **Gratis** (Fee = 0 atau memiliki catatan Waiver).
  - Toggle **Berbayar** (diurutkan dari yang termurah, menggunakan `apc_fee_numeric_idr`).
- **Filter Akreditasi / Indeks:**
  - Pilihan tingkat Sinta (S1–S6) dan Scopus (Q1–Q4).
- **Filter Catatan Khusus (Waiver / Diskon):**
  - Fitur pencarian berbasis kata kunci pada kolom `exception_notes`.
- **Display Kontak Langsung:**
  - Menampilkan alamat Email, No. WA, dan Telegram di kartu/tabel hasil tanpa mengharuskan pengguna membuka link jurnal.
- **Indikator Kesegaran Data:**
  - Menampilkan `last_scraped_at` per jurnal (misal: "Diperbarui 3 hari lalu") agar pengguna tahu keakuratan waktu data.
- **Dukungan Dua Bahasa (i18n):**
  - Pengguna dapat memilih antara **Bahasa Indonesia** (default) dan **English** melalui language switcher di navbar.
  - Yang diterjemahkan: seluruh teks antarmuka (label, tombol, filter, pesan kosong, footer, hero section).
  - Yang **tidak** diterjemahkan: data hasil scraping itu sendiri (nama jurnal, `exception_notes`, `apc_fee`) — ini adalah data apa adanya dari sumber, tidak dialihbahasakan otomatis, untuk menghindari makna yang berubah/tidak akurat.
  - Pilihan bahasa pengguna disimpan secara lokal di browser (`localStorage`) agar tidak perlu memilih ulang setiap kunjungan.
  - Bahasa default mengikuti preferensi tersimpan pengguna; jika belum pernah memilih, default ke Bahasa Indonesia (mengingat target pengguna utama adalah dosen di Indonesia).

---

## 7. Fitur Ekspor Data

Menyediakan 2 opsi unduhan data:
1. **Excel (.xlsx):** Format lembar kerja lengkap beserta seluruh kolom database untuk analisis riset mandiri.
2. **BibTeX (.bib):** Format referensi standar untuk langsung di-import ke aplikasi manajemen referensi seperti Mendeley, Zotero, atau EndNote.

---

## 8. Estimasi Biaya & Infrastruktur

- **Biaya API LLM:** Rp 0 (Menggunakan Local LLM di server internal).
- **Biaya Rotasi Proxy:** ~Rp 200.000 / bulan (Proxy perumahan/residential) — *hanya diperlukan mulai Fase 2, lihat Bagian 5a*.
- **Kebutuhan Server:** VPS dengan spesifikasi CPU 8-Core + RAM 16GB atau VPS GPU entry-level untuk menjalankan Ollama 8B secara optimal (Fase 2). Untuk MVP, VPS 2-4 core / 8GB RAM cukup untuk scraping sinkron skala kecil.
- **Biaya Pemeliharaan (Maintenance):** Sangat minim (hanya intervensi manual jika terdapat notifikasi alert dari Telegram).

---

## 9. Metrik Keberhasilan Produk (UAT Criteria)

1. **Akurasi Filter Waiver:** 100% jurnal dengan syarat waiver/diskon teridentifikasi dan masuk dalam filter "Gratis/Diskon".
2. **Kelengkapan Kontak:** Pengguna dapat memperoleh kontak (WA/Email) langsung dari dasbor tanpa perlu navigasi manual ke web jurnal.
3. **Performa Sistem:** Pencarian & filtering pada dashboard merespon dalam waktu **< 1 detik** (karena membaca data terindeks di DB).
4. **Efisiensi Operasional:** Bebas biaya kredit API LLM komersial.
5. **Konsistensi Bahasa:** 100% elemen UI statis (bukan data hasil scraping) berhasil diterjemahkan saat pengguna beralih bahasa, tanpa ada teks yang tertinggal dalam bahasa sebelumnya.
