# Pomodoro

Aplikasi timer fokus dengan tugas, musik YouTube, dan catatan progres yang tersimpan di browser.

## Menjalankan

Gunakan Node.js 20.9 atau lebih baru.

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Untuk memeriksa perubahan, jalankan `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build`.

## v2.0

- Tema terang dengan aksen jingga, dinosaurus, dan love penanda sesi fokus dalam satu siklus. Animasi mengikuti pengaturan pengurangan gerak pada perangkat.
- Timer menggunakan waktu akhir sesi sehingga tetap akurat saat tab berada di latar belakang.
- Panel progres dan musik dimuat saat dibuka. Kalender aktivitas satu tahun dan histogram yang bisa diketuk menampilkan durasi fokus dari data tersimpan.
- Fitur tugas, playlist, ringtone, dan pintasan keyboard tetap tersedia. Data lokal tetap memakai format v1.

Pilihan visual dicatat di [DESIGN.md](DESIGN.md). Alur kode untuk pengembangan berikutnya dijelaskan di [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
