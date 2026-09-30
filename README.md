# Pomodoro

Aplikasi timer fokus dengan tugas, musik YouTube, dan catatan progres yang tersimpan di browser.

## Menjalankan

Gunakan Node.js 20.9 atau lebih baru.

```bash
npm ci
npm run dev
```

Buka `http://localhost:3001`. Port dev menggunakan 3001 karena WhatsApp bridge Hermes pada mesin ini memakai port 3000 dan dapat menghentikan proses lain di port tersebut (exit code 143 / SIGTERM). Untuk memeriksa perubahan, jalankan `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build`.

Data localStorage mengikuti alamat dan port browser. Data dari `localhost:3000` tetap tersimpan di alamat lama dan tidak otomatis terbaca di `localhost:3001`.

## v2.0

- Tema terang dengan aksen jingga, dinosaurus, dan love penanda sesi fokus dalam satu siklus. Animasi mengikuti pengaturan pengurangan gerak pada perangkat.
- Timer menggunakan waktu akhir sesi sehingga tetap akurat saat tab berada di latar belakang.
- Pesan motivasi berganti setelah setiap sesi fokus selesai.
- Sesi fokus yang selesai mendapat pop-up motivasi dan perayaan partikel singkat. Partikel mengikuti preferensi Reduce Motion perangkat.
- Pengingat motivasi muncul tiap 10 menit saat tab atau aplikasi lain aktif, selama halaman tetap terbuka dan izin notifikasi browser diberikan. Bisa dimatikan di Pengaturan.
- Panel progres dan musik dimuat saat dibuka. Kalender aktivitas satu tahun dan histogram yang bisa diketuk menampilkan durasi fokus dari data tersimpan.
- Fitur tugas, playlist, ringtone, dan pintasan keyboard tetap tersedia. Data lokal tetap memakai format v1.

Pilihan visual dicatat di [DESIGN.md](DESIGN.md). Alur kode untuk pengembangan berikutnya dijelaskan di [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Untuk belajar dari implementasinya, baca [panduan AntiVibe end-to-end](deep-dive/pomodoro-end-to-end-2026-09-30.md), lalu [bedah fitur perayaan](deep-dive/focus-celebration-2026-09-30.md). Panduan mencakup alasan keputusan, batas aplikasi, tes, dan latihan pengembangan.
