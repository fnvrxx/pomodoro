# Pomodoro App — Dokumentasi End-to-End

## Daftar Isi
1. [Tech Stack](#1-tech-stack)
2. [Struktur Folder](#2-struktur-folder)
3. [Arsitektur & Alur Data](#3-arsitektur--alur-data)
4. [Types](#4-types)
5. [Hooks](#5-hooks)
6. [Components](#6-components)
7. [Cara Menambah Fitur](#7-cara-menambah-fitur)
8. [Aturan Penting (SSR / Hydration)](#8-aturan-penting-ssr--hydration)
9. [Keputusan Desain](#9-keputusan-desain)

---

## 1. Tech Stack

| Layer | Library | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| UI Library | React | 19 |
| Styling | Tailwind CSS | 4 |
| Komponen UI | Radix UI + shadcn/ui | — |
| Animasi | Framer Motion | 12 |
| Icons | Lucide React | — |
| State | React hooks + localStorage | — |
| Language | TypeScript | 5 |

Tidak ada state manager eksternal (Redux, Zustand, dll). Semua state dikelola lewat custom hooks + `localStorage`.

---

## 2. Struktur Folder

```
app/
├── page.tsx                  # Root page — orchestrator utama
├── layout.tsx                # HTML shell, font, metadata
├── globals.css               # CSS global, Tailwind base
│
├── types/
│   └── index.ts              # Semua type & interface + default values
│
├── hooks/
│   ├── useLocalStorage.ts    # Persistence ke localStorage (SSR-safe)
│   ├── useTimer.ts           # Logic countdown timer
│   └── useWeeklyProgress.ts  # (dihapus, tidak dipakai)
│
├── components/
│   ├── TimerCard.tsx         # Kartu timer utama (ring SVG + controls)
│   ├── TaskList.tsx          # Daftar task + CRUD
│   ├── TaskModal.tsx         # Form add/edit task
│   ├── ProgressModal.tsx     # Modal statistik
│   ├── SettingsModal.tsx     # Modal pengaturan durasi
│   ├── MusicPlayer.tsx       # Pemutar musik via YouTube embed
│   ├── TaskCompletionProgress.tsx  # Progress bar selesai task
│   ├── MotivationalQuote.tsx # Kutipan saat semua task selesai
│   └── ui/                   # Base components shadcn/ui (jangan diubah)
│
└── data/
    └── motivationalQuotes.ts # Array kutipan motivasi
```

---

## 3. Arsitektur & Alur Data

```
page.tsx (Client Component)
│
├── useAppPersistence()        → tasks, settings, progress, activeTaskId
├── useTimer()                 → formattedTime, progress, start/pause/reset/skip
│
├── TimerCard                  ← menerima timer + settings (read-only)
├── TaskList                   ← menerima tasks + callbacks
├── MusicPlayer                ← state internal sendiri
│
└── Modals: Task, Progress, Settings
```

**Prinsip alur data:**
- State satu arah: `page.tsx` pegang semua state, komponen cukup terima props + panggil callback.
- Tidak ada prop drilling lebih dari 2 level.
- Setiap handler di `page.tsx` dibungkus `useCallback` untuk stabilitas referensi.

---

## 4. Types

File: `app/types/index.ts`

```ts
// Mode timer
type TimerMode = 'focus' | 'break' | 'longBreak';

// Satu task
interface Task {
  id: string;              // UUID, dibuat saat add
  title: string;
  estimatedPomodoros: number;
  actualPomodoros: number; // otomatis naik saat focus selesai
  completed: boolean;
  createdAt: number;       // timestamp ms
}

// Pengaturan durasi (disimpan di localStorage)
interface TimerSettings {
  focusDuration: number;     // menit, default 25
  breakDuration: number;     // menit, default 5
  longBreakDuration: number; // menit, default 15
  longBreakInterval: number; // tiap N focus → long break, default 4
}

// Statistik user (disimpan di localStorage)
interface UserProgress {
  totalFocusTime: number;        // total menit focus
  totalPomodorosCompleted: number;
  currentStreak: number;         // hari berturut-turut aktif
  lastActiveDate: string | null; // format YYYY-MM-DD
  dailyStats: DailyStat[];
}

interface DailyStat {
  date: string;              // YYYY-MM-DD
  focusTime: number;         // menit
  pomodorosCompleted: number;
}
```

Untuk menambah field baru, edit `index.ts` lalu update `useAppPersistence` default value-nya.

---

## 5. Hooks

### `useLocalStorage<T>(key, initialValue)`

File: `app/hooks/useLocalStorage.ts`

**SSR-safe**: render pertama (server + client) selalu pakai `initialValue`. Setelah mount, nilai dari localStorage di-load lewat `useEffect`. Ini mencegah hydration mismatch.

```ts
const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);
```

`setValue` mendukung functional update:
```ts
setTasks(prev => [...prev, newTask]);
```

**Aturan**: Jangan pernah akses `localStorage` langsung di luar hook ini. Selalu lewat `useLocalStorage` atau `useAppPersistence`.

---

### `useAppPersistence()`

File: `app/hooks/useLocalStorage.ts`

Wrapper yang mengumpulkan semua state persisten:

| Return | Key localStorage | Default |
|---|---|---|
| `tasks` / `setTasks` | `pomodoro-tasks` | `[]` |
| `settings` / `setSettings` | `pomodoro-settings` | 25/5/15/4 menit |
| `progress` / `setProgress` | `pomodoro-progress` | semua 0 |
| `activeTaskId` / `setActiveTaskId` | `pomodoro-active-task` | `null` |

---

### `useTimer(settings, _tasks, _activeTaskId, onComplete)`

File: `app/hooks/useTimer.ts`

**Core logic timer Pomodoro.**

```
Focus (25m) → Break (5m) → Focus → Break → ... → setiap 4 Focus → Long Break (15m)
```

Alur internal:
1. State: `{ mode, timeRemaining, isRunning, completedSessions }`
2. Countdown berjalan via `setInterval` 1000ms
3. Saat `timeRemaining` mencapai 0:
   - Panggil `onComplete(mode, duration)` → update progress di `page.tsx`
   - Mainkan ring 3-tone (C5→E5→G5) via Web Audio API
   - Tampilkan browser notification
   - Hitung mode berikutnya, set `isRunning: false`
4. `settings` dibaca via `useRef` di dalam interval — tidak perlu restart interval saat settings berubah

**Penting:** `settings` dan `onComplete` diakses via ref di dalam callback interval. Ini menghindari stale closure dan mencegah interval restart yang tidak perlu setiap render.

Return value:
```ts
{
  mode, timeRemaining, isRunning, completedSessions,
  formattedTime,  // "25:00"
  progress,       // 0–100 (persentase yang sudah berjalan)
  start, pause, reset, switchMode, skip,
}
```

---

## 6. Components

### `TimerCard`

Props: `{ timer, settings }`

- SVG ring progress: radius 46, circumference dihitung dari `2 * Math.PI * 46`
- Arc opacity lebih terang saat `isRunning`
- Mode label ditampilkan di dalam circle
- Tombol: Reset (kiri), Start/Pause (tengah, lebar fixed `w-36`), Skip (kanan)
- Running dots animasi (3 titik fade in/out)

Untuk mengubah warna: semua warna ada di className Tailwind, tidak ada variabel terpisah.

---

### `TaskList`

Props: `{ tasks, activeTaskId, onAddTask, onEditTask, onDeleteTask, onToggleComplete, onClearFinished, onClearAll, onSelectTask }`

- `TaskItem` di-`memo()` — tidak re-render jika task lain berubah
- Klik task → jadi active task (dipakai timer untuk increment pomodoro)
- Klik lagi task yang sama → deselect
- Dropdown edit/delete: styling custom dengan hover hijau (edit) dan merah (delete)
- `TaskCompletionProgress` muncul di bawah jika ada task
- `MotivationalQuote` muncul jika semua task selesai

---

### `TaskModal`

Props: `{ isOpen, onClose, onSave, task }`

- `task = null` → mode Add (hanya estimated pomodoros)
- `task = Task` → mode Edit (tampilkan actual/estimated)
- Enter untuk save, Escape untuk close
- `onSave` menerima `Task | NewTask`, dibedakan via `'id' in task`

---

### `ProgressModal`

Props: `{ isOpen, onClose, progress, tasks, settings }`

- Waktu per pomodoro dihitung dari `settings.focusDuration` (bukan hardcode 25)
- Menampilkan: total jam fokus, streak hari, pomodoro hari ini, breakdown per task (top 5)

---

### `SettingsModal`

Props: `{ isOpen, onClose, settings, onSave }`

- Edit lokal dulu, baru disimpan saat klik OK
- Cancel → discard perubahan
- Validasi: focus 1–60m, break 1–30m, long break 1–60m, interval 1–10

---

### `MusicPlayer`

Internal state saja, tidak ada props.

- 4 playlist YouTube yang bisa dipilih
- Play/pause menggunakan `key` prop pada `<iframe>` untuk force re-mount (YouTube iframe API tidak support kontrol programatik tanpa SDK)
- Mute/unmute juga trigger re-mount via key
- `iframeKey = ${id}-${isPlaying}-${isMuted}`

---

## 7. Cara Menambah Fitur

### Menambah field baru di Task

1. Tambah field di `Task` interface (`app/types/index.ts`)
2. Set nilai default saat `handleAddTask` di `page.tsx`
3. Tampilkan/edit di `TaskModal.tsx`
4. Data sudah otomatis tersimpan ke localStorage karena `useLocalStorage` serialize seluruh array

### Menambah mode timer baru

1. Tambah value di `TimerMode` type
2. Update `getDurationForMode` di `useTimer.ts`
3. Update `getNextMode` sesuai urutan yang diinginkan
4. Tambah tab di `TimerCard.tsx`

### Menambah statistik baru di Progress

1. Tambah field di `UserProgress` interface dan default di `useAppPersistence`
2. Update `handleTimerComplete` di `page.tsx` untuk mengisi field baru
3. Tampilkan di `ProgressModal.tsx`

### Menambah playlist musik

Di `MusicPlayer.tsx`, tambah objek ke array `PLAYLISTS`:
```ts
{
  id: 'YOUTUBE_VIDEO_ID',
  name: 'Nama Playlist',
  description: 'Deskripsi singkat',
  type: 'playlist', // atau 'livestream'
}
```

### Menambah kutipan motivasi

Di `app/data/motivationalQuotes.ts`, tambah string ke array.

---

## 8. Aturan Penting (SSR / Hydration)

Next.js merender halaman di server terlebih dahulu, lalu client "hydrate" HTML tersebut. Jika output server dan client berbeda → error hydration.

**Penyebab umum dan cara menghindarinya:**

| Penyebab | Salah | Benar |
|---|---|---|
| Akses `window`/`localStorage` saat render | `const val = localStorage.getItem(...)` di top-level | Akses hanya di `useEffect` |
| Nilai berubah tiap render | `useState(Date.now())` | `useState(0)`, isi di `useEffect` |
| Format tanggal locale | `date.toLocaleDateString()` di render | Gunakan format ISO manual atau render di `useEffect` |
| Kondisi berdasarkan window | `if (typeof window !== 'undefined')` di render | Pindahkan ke `useEffect` |

**Pattern yang sudah diterapkan di project ini:**

```ts
// useLocalStorage.ts — BENAR
const [storedValue, setStoredValue] = useState<T>(initialValue); // server: initialValue

useEffect(() => {
  // Hanya jalan di client, setelah hydration selesai
  const item = window.localStorage.getItem(key);
  if (item !== null) setStoredValue(JSON.parse(item));
}, [key]);
```

---

## 9. Keputusan Desain

### Mengapa tidak pakai Redux/Zustand?

App ini cukup sederhana — satu halaman, state tidak perlu dibagi antar route. `useCallback` + prop drilling maksimal 2 level sudah cukup. Menambahkan state manager akan menambah boilerplate tanpa manfaat nyata.

### Mengapa `useRef` untuk settings di dalam timer interval?

```ts
const settingsRef = useRef(settings);
settingsRef.current = settings; // selalu update

useEffect(() => {
  const interval = setInterval(() => {
    const s = settingsRef.current; // baca nilai terbaru
  }, 1000);
}, [state.isRunning]); // tidak perlu settings di deps
```

Jika `settings` masuk deps, interval akan restart setiap kali settings berubah — menyebabkan timer "loncat". Dengan ref, interval stabil tapi tetap baca nilai terbaru.

### Mengapa iframe YouTube di-re-mount untuk play/pause?

YouTube iframe API memerlukan JS SDK (`postMessage`) untuk kontrol programatik. Menggunakan SDK akan menambah kompleksitas dan bergantung pada library eksternal. Re-mount iframe via `key` lebih sederhana dan tidak ada dependency tambahan.

### Mengapa `memo()` di beberapa komponen?

Timer update setiap detik → `page.tsx` re-render setiap detik → semua children ikut render. `MusicPlayer`, `TaskItem`, `WeeklyProgressBar` tidak berubah tiap detik, jadi diberi `memo()` untuk skip render yang tidak perlu.

### Mengapa animasi infinite dihapus?

Animasi `repeat: Infinity` (shimmer, pulse, bounce) berjalan di GPU/CPU terus-menerus meski tidak ada perubahan state. Pada device low-end ini menyebabkan battery drain dan frame drop. Diganti animasi satu kali (entry animation) yang jauh lebih ringan.
