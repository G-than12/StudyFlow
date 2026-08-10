<div align="center">

# 📚 StudyFlow

### Personal Study Management Dashboard

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

> Aplikasi manajemen belajar untuk mahasiswa yang membantu mengatur tugas, jadwal,
> sesi fokus, dan memantau progres belajar — **tanpa backend, tanpa registrasi, langsung pakai.**

<br/>

[🚀 Live Demo](#-cara-menjalankan) · [✨ Fitur](#-fitur) · [📁 Struktur Folder](#-struktur-folder) · [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) · [📖 Cara Pakai](#-cara-pakai)

</div>

---

## 📸 Preview

![Dashboard](<img width="1731" height="977" alt="image" src="https://github.com/user-attachments/assets/44c2f3d0-0848-4dab-a96f-3efc72909e86" />
![Tasks](<img width="1731" height="1313" alt="image" src="https://github.com/user-attachments/assets/969f3626-faff-4d56-a977-aed2c87e7a4e" />
![Focus](<img width="1731" height="1076" alt="image" src="https://github.com/user-attachments/assets/ab3d4494-b812-4638-8ee1-f717f41f278a" />


![Schedule](<img width="1731" height="864" alt="image" src="https://github.com/user-attachments/assets/36b04044-326e-4279-a535-4478491b7335" />
![Stats](<img width="1731" height="1095" alt="image" src="https://github.com/user-attachments/assets/37ceafe1-e4e3-4627-bc41-907d4506ec01" />
![Dark](<img width="1731" height="1027" alt="image" src="https://github.com/user-attachments/assets/cd3836b0-2759-43d4-8815-43deaf6531a1" />

---

## ✨ Fitur

### 🏠 Dashboard
- Greeting dinamis berdasarkan waktu (Good Morning / Afternoon / Evening)
- Statistik real-time: total tugas, selesai, pending, focus sessions
- Progress bar penyelesaian tugas keseluruhan
- Preview tugas mendatang & jadwal hari ini
- Quick start tombol Focus Mode

### ✅ Task Management
- **CRUD Lengkap** — Create, Read, Update, Delete tugas
- Priority level: `High` · `Medium` · `Low`
- Status tracking: `Todo` · `In Progress` · `Completed`
- Search real-time berdasarkan judul, kategori, atau deskripsi
- Filter berdasarkan status & priority
- Sort berdasarkan deadline, priority, atau tanggal dibuat
- Validasi form (title & deadline wajib diisi)
- Confirmation dialog sebelum menghapus

### 📅 Study Schedule
- Jadwal belajar mingguan (Senin–Minggu)
- Tambah, edit, hapus jadwal per hari
- Input jam mulai & selesai dengan validasi urutan waktu
- Tampilan tab per hari aktif
- Jadwal hari ini ditampilkan di dashboard

### 🎯 Focus Mode (Pomodoro Timer)
- Timer dengan tiga mode: **Focus** (25 min) · **Short Break** (5 min) · **Long Break** (15 min)
- SVG ring progress yang bergerak real-time
- Kontrol: Start / Pause / Resume / Reset / Skip
- Auto-advance ke mode berikutnya setelah sesi selesai
- Long break otomatis setiap 4 sesi fokus
- Browser notification saat sesi selesai
- Kustomisasi durasi timer yang dapat disimpan
- Counter total sesi fokus yang terakumulasi

### 📊 Statistics
- Total waktu belajar kumulatif
- Weekly focus sessions bar chart (pure CSS/JS, tanpa library chart)
- Task breakdown: Completed / In Progress / Todo
- Priority distribution visualization
- Completion rate real-time

### ⚙️ Settings
- Ganti nama pengguna yang ditampilkan di greeting
- Toggle Dark Mode / Light Mode (persisten)
- Clear completed tasks
- Reset semua data dengan konfirmasi

### 🎨 UI/UX
- **Dark Mode** penuh dengan toggle ☀️/🌙
- **Responsive** — Desktop sidebar · Mobile hamburger menu
- Animasi CSS: fade-in, slide-up, toast notifications
- Toast notification untuk setiap aksi (add, edit, delete, complete)
- Empty state yang informatif dengan CTA button
- Accessible: semantic HTML, aria-label, keyboard-friendly modal

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5** | Struktur halaman & semantic markup |
| **Tailwind CSS** (CDN Play) | Utility-first styling, dark mode |
| **Vanilla JavaScript** | Logika aplikasi, CRUD, timer, routing |
| **localStorage** | Persistensi data tanpa backend |
| **SVG** | Animasi ring progress timer |
| **Web Notifications API** | Notifikasi browser saat sesi selesai |

> ⚠️ **Tidak menggunakan:** React, Vue, Angular, Node.js, PHP, database eksternal, atau framework CSS apapun selain Tailwind.

---

## 📁 Struktur Folder

```
studyflow/
│
├── index.html              # Entry point — Single Page Application
│
├── css/
│   └── style.css           # Custom utilities (komponen yang tidak bisa pure Tailwind)
│
├── js/
│   ├── storage.js          # Abstraksi localStorage (get/set/reset semua keys)
│   ├── tasks.js            # CRUD tugas + rendering + validasi form
│   ├── schedule.js         # CRUD jadwal + rendering per hari
│   ├── timer.js            # Pomodoro timer logic + SVG ring + session tracking
│   ├── statistics.js       # Kalkulasi & rendering chart statistik
│   └── app.js              # Navigation, Dashboard, Settings, Toast, Modal utils, init
│
└── assets/
    └── icons/              # (opsional) ikon lokal jika diperlukan
```

### localStorage Keys

| Key | Isi |
|-----|-----|
| `studyflow_tasks` | Array objek task (id, title, desc, category, deadline, priority, status, created) |
| `studyflow_schedule` | Array objek jadwal (id, subject, day, start, end, note) |
| `studyflow_settings` | Objek settings (username, darkMode, focusDuration, shortBreak, longBreak) |
| `studyflow_sessions` | Objek sesi (totalSessions, totalMinutes, weekly map) |

---

## 🚀 Cara Menjalankan

### Langsung di Browser (Cara Tercepat)

```bash
# 1. Clone repository
git clone https://github.com/G-than12/studyflow.git

# 2. Masuk ke folder project
cd studyflow

# 3. Buka index.html di browser
# Windows:
start index.html

# macOS:
open index.html

# Linux:
xdg-open index.html
```

> **Atau:** Langsung double-click file `index.html` — tidak perlu install apapun, tidak perlu server lokal.

### Dengan Live Server (Opsional untuk Development)

```bash
# Jika menggunakan VS Code, install extension "Live Server"
# Klik kanan index.html → "Open with Live Server"

# Atau menggunakan Node.js serve:
npx serve .
```

---

## 📖 Cara Pakai

### 1. Pertama Kali Membuka Aplikasi
Saat pertama kali dibuka dan `localStorage` masih kosong, aplikasi otomatis mengisi **5 demo task** dan **6 demo jadwal** agar tampilan tidak kosong. Data demo ini dapat dihapus atau diedit sesuai kebutuhan.

### 2. Mengelola Tugas
1. Pergi ke halaman **Tasks**
2. Klik tombol **`+ Add Task`** di pojok kanan atas
3. Isi form: Judul *(wajib)*, Deskripsi, Kategori/Mata Kuliah, Deadline *(wajib)*, Priority, Status
4. Klik **Save Task**
5. Untuk mengedit: klik ✏️ pada task yang ingin diubah
6. Untuk menandai selesai: klik lingkaran di sebelah kiri task
7. Untuk menghapus: klik 🗑️ → konfirmasi dialog

### 3. Mengatur Jadwal Belajar
1. Pergi ke halaman **Schedule**
2. Pilih hari melalui tab hari (Mon–Sun)
3. Klik **`+ Add Schedule`**
4. Isi Subject, Hari, Jam Mulai, Jam Selesai, dan Catatan opsional
5. Klik **Save Schedule**

### 4. Menggunakan Focus Mode
1. Pergi ke halaman **Focus**
2. Pilih mode: **Focus**, **Short Break**, atau **Long Break**
3. Klik **`▶ Start`** untuk memulai countdown
4. Klik **`⏸ Pause`** untuk jeda, **`▶ Resume`** untuk lanjut
5. Klik **`↺ Reset`** untuk mengulang dari awal
6. Setelah 4 sesi fokus, Long Break otomatis tersedia
7. Untuk mengubah durasi: scroll ke bawah → ubah nilai → klik **Save Settings**

### 5. Melihat Statistik
Halaman **Statistics** menampilkan:
- Total waktu belajar (dari akumulasi sesi fokus)
- Bar chart sesi fokus per hari dalam seminggu terakhir
- Breakdown task berdasarkan status dan priority

### 6. Pengaturan
1. Pergi ke halaman **Settings**
2. Ubah nama pengguna → klik **Save Settings**
3. Toggle **Dark Mode** untuk mengubah tema
4. **Clear Completed** — hapus semua task yang sudah selesai
5. **Reset All Data** — hapus seluruh data (memerlukan konfirmasi)

---

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                     index.html (SPA)                    │
│  ┌──────────┐  ┌───────────────────────────────────┐   │
│  │ Sidebar  │  │           Main Content             │   │
│  │  (Nav)   │  │  Dashboard | Tasks | Schedule |    │   │
│  │          │  │  Focus     | Stats | Settings      │   │
│  └──────────┘  └───────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         app.js        tasks.js    schedule.js
      (Nav, UI,        (CRUD,      (CRUD,
       Settings,       Render,     Render,
       Toast,          Filter,     Calendar)
       Modal)          Sort)
              │            │            │
              └────────────┼────────────┘
                           ▼
                      storage.js
                   (localStorage API)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Tasks        Schedule     Sessions
        (Array)         (Array)     (Object)
```

### Alur Data

```
User Action
    │
    ▼
Event Handler (tasks.js / schedule.js / timer.js)
    │
    ▼
Update JavaScript State (in-memory array/object)
    │
    ├──► Storage.set() ──► localStorage (persisten)
    │
    └──► render() ──► Re-render DOM (tanpa reload)
```

---

## 🧩 Cara Kerja Fitur Utama

### CRUD Tasks

```javascript
// Tambah task baru
Tasks.add({ title, description, category, deadline, priority, status })
// → generate ID unik → push ke array → simpan ke localStorage → re-render

// Edit task
Tasks.update(id, { ...newData })
// → cari index → spread merge → simpan → re-render

// Hapus task
Tasks.remove(id)
// → filter out → simpan → re-render

// Toggle selesai
Tasks.toggleComplete(id)
// → status 'completed' ↔ 'todo' → simpan → re-render
```

### Pomodoro Timer

```javascript
// Tick setiap 1 detik via setInterval
tick() {
  remaining--
  updateDisplay()          // update teks "MM:SS"
  updateRing(remaining / totalSeconds)  // update SVG stroke-dashoffset
  if (remaining <= 0) onSessionEnd()
}

// Session end
onSessionEnd() {
  cycleCount++
  saveSession()            // simpan ke localStorage.sessions
  setMode(cycleCount % 4 === 0 ? 'long' : 'short')  // auto-advance
}
```

### Statistik Real-time

```javascript
// Semua kalkulasi dari data aktual, tidak ada hardcode
getStats() {
  return {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === 'completed').length,
    progress:   Math.round(completed / total * 100),
    // ...
  }
}
```

---

## 🔧 Kustomisasi

### Mengganti Warna Accent

Edit nilai di `tailwind.config` dalam `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#4f6ef7' },   // ← ganti warna utama
        secondary: { DEFAULT: '#7c5cd8' }, // ← ganti warna sekunder
      }
    }
  }
}
```

### Menambah Demo Data

Edit fungsi `seedDemo()` di [`js/tasks.js`](js/tasks.js) atau [`js/schedule.js`](js/schedule.js):

```javascript
// Tambahkan objek baru ke array tasks di seedDemo()
{
  id: generateId(),
  title: 'Nama Tugas Baru',
  category: 'Mata Kuliah',
  deadline: addDays(5),
  priority: 'high',   // 'high' | 'medium' | 'low'
  status: 'todo',     // 'todo' | 'in-progress' | 'completed'
  created: new Date().toISOString(),
}
```

> ⚠️ Demo data hanya di-seed saat localStorage **benar-benar kosong**. Hapus data via Settings → Reset All Data untuk melihat seed data baru.

---

## 🤝 Kontribusi

Kontribusi sangat terbuka! Berikut cara berkontribusi:

```bash
# 1. Fork repository ini
# 2. Buat branch baru
git checkout -b feature/nama-fitur-baru

# 3. Commit perubahan
git commit -m "feat: tambah fitur [nama fitur]"

# 4. Push ke branch
git push origin feature/nama-fitur-baru

# 5. Buka Pull Request
```

### Konvensi Commit

| Prefix | Kegunaan |
|--------|----------|
| `feat:` | Menambah fitur baru |
| `fix:` | Memperbaiki bug |
| `style:` | Perubahan styling/UI |
| `refactor:` | Refactoring kode tanpa perubahan fungsional |
| `docs:` | Perubahan dokumentasi |

---

## 📋 Roadmap

- [x] Task Management (CRUD + filter + search)
- [x] Study Schedule (weekly view)
- [x] Pomodoro Timer + SVG ring
- [x] Statistics (bar chart, breakdown)
- [x] Dark Mode
- [x] Responsive Design
- [x] localStorage persistence
- [x] Toast notifications
- [x] Tailwind CSS migration
- [ ] PWA support (Service Worker + offline)
- [ ] Export data ke CSV/JSON
- [ ] Import data dari file
- [ ] Kategori / label kustom
- [ ] Recurring schedule (jadwal berulang mingguan)
- [ ] Integrasi IBM Watsonx AI untuk rekomendasi jadwal

---

## 🐛 Troubleshooting

**Data hilang setelah refresh?**
> Pastikan browser tidak dalam mode Private/Incognito. localStorage tidak tersimpan di sesi private.

**Dark mode tidak tersimpan?**
> Cek apakah browser mengizinkan localStorage. Buka DevTools → Application → Local Storage → cari key `studyflow_settings`.

**Timer tidak akurat saat browser di-minimize?**
> Beberapa browser membatasi `setInterval` pada tab tidak aktif. Ini perilaku normal browser untuk menghemat baterai. Fokus kembali ke tab untuk akurasi maksimal.

**Tailwind classes tidak muncul?**
> Pastikan koneksi internet aktif saat pertama kali membuka (Tailwind CDN Play perlu diunduh). Setelah itu bisa digunakan offline.

---

## 📄 Lisensi

Project ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License © 2025 [Nama Kamu]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software...
```

---

## 👤 Author

**Gathan Hilabi**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/[G-than12])

---

<div align="center">

**Dibuat dengan ❤️ menggunakan [IBM Bob](https://ibm.com) AI Agent**

*Capstone Project — IBM SkillsBuild 2025*

⭐ **Jika project ini bermanfaat, berikan star di GitHub!** ⭐

</div>
