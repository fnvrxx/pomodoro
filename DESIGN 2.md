# Arah visual Pomodoro v2.0

**Pembacaan desain:** aplikasi timer untuk orang yang ingin mulai bekerja tanpa banyak pilihan; retro pixel halus dengan ENERGY 2 / RHYTHM 2 / MOTION 2.

- `#FDF4E3` adalah dasar yang hangat dan nyaman dibaca. Turunan warna krem dipakai untuk permukaan dan input.
- `#134686` membangun struktur, teks, dan panel timer agar hitungan waktu menjadi titik fokus.
- `#ED3F27` menandai aksi mulai atau jeda. Warna ini tidak diulang sebagai dekorasi.
- `#FEB21A` menandai progres dan maskot dinosaurus. Detail pixel sengaja dibatasi pada maskot.
- Kalender fokus memakai `#FFF1D1` untuk hari kosong, `#FEB21A` dan `#FF9100` untuk sesi hingga satu jam, lalu `#DF301C` untuk lebih dari satu jam. `#00B7CD` menandai hari ini.
- Georgia memberi rasa poster cetak pada judul; sans sistem menjaga kontrol tetap jelas; angka timer memakai monospace agar tidak bergeser tiap detik.
- Seperti v1, timer dan tugas ditumpuk dalam satu kolom di tengah. Musik muncul di antaranya saat dibuka; tombol alat berada di kanan atas. Di dalam kartu, mode dan lingkaran timer mendahului kontrol, sedangkan progres tugas ada di atas dan tombol tambah di bawah daftar.
- Kartu timer dan Tugas memakai kembali sudut membulat seperti v1. Motivasi tampil di atas Tugas selama ada tugas.
- Tugas selesai memakai kuning hangat dengan garis oranye gelap. Motivasi pendek juga tampil selama masih ada tugas yang belum selesai.
- Dinosaurus bereaksi sekali saat mulai, jeda, dan sesi selesai. Tidak ada gerak yang berulang; `prefers-reduced-motion` mematikan animasi.
- Saat fokus berjalan, tampilan menjadi hitam-putih untuk mengurangi gangguan seperti perilaku v1.1.
