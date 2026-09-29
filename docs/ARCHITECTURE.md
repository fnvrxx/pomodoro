# Struktur aplikasi

`app/page.tsx` menyambungkan fitur dan menangani aksi pengguna. Komponen di `app/components` menampilkan UI. Logika yang bisa diuji tanpa browser berada di `app/lib`.

## Alur timer

`useTimer` mengelola efek browser: interval, tab yang kembali aktif, suara, dan notifikasi. `timerReducer` di `app/lib/timer.ts` menentukan transisi timer tanpa menyentuh browser. Sesi berjalan menyimpan waktu akhir (`deadline`); sisa waktu dihitung dari selisih jam saat ini sehingga tab yang berada di latar belakang tetap akurat. Hanya transisi `complete` yang mencatat progres. `skip` berpindah sesi tanpa mencatat sesi selesai.

Setelah sesi fokus selesai, halaman memanggil `recordFocusSession` dan menambah sesi pada tugas yang aktif. Statistik harian tetap memakai tanggal UTC agar data lokal lama terbaca dengan arti yang sama.

## Penyimpanan

`useAppPersistence` memuat data dari `localStorage` setelah render pertama agar HTML server dan browser cocok. Kunci tugas, pengaturan, progres, playlist, tugas aktif, dan ringtone tetap sama seperti v1. Tema lama tidak lagi dibaca, tetapi data lain tidak dihapus. Gunakan *Clear All Data* di pengaturan jika ingin menghapus semuanya.

## Memperluas aplikasi

- Tambah mode timer di tipe `TimerMode`, lalu perbarui `durationFor`, `nextMode`, dan pilihan mode pada `TimerCard`.
- Tambah ringkasan progres di `app/lib/stats.ts`, kemudian tampilkan di `ProgressModal`.
- Tambah ringtone di `app/data/ringtones.ts`; pengaturan akan menampilkan daftar itu otomatis.

Jalankan `npm test`, `npm run lint`, `npm run typecheck`, dan `npm run build` sebelum merilis perubahan.
