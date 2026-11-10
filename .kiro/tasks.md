# Tasks — Rumah Hantu: Pesta Kostum

> Daftar tugas implementasi untuk Kiro spec execution. Kerjakan berurutan, satu tugas selesai (terverifikasi) sebelum lanjut ke tugas berikutnya.
> Tiap tugas kecil dan incremental: satu perubahan yang bisa diuji sendiri.
> Acuan: `requirements.md` (REQ-xx) dan `design.md` (§ bagian).
> Aturan kualitas yang mengikat semua tugas: aset 3D langsung kualitas hero (geometri multi-part + tekstur lukis). Jangan buat versi kotak polos dulu dengan alasan "nanti diperbaiki".

---

## Fase 1 — Fondasi (tugas 01–06)

### TASK-01 — Kerangka halaman dan import map Three.js
- **Apa yang dibuat:** `index.html` dengan import map Three.js dari CDN, elemen `<canvas>`, dan struktur DOM kosong untuk HUD/menu/layar hasil. `css/style.css` dengan gaya dasar (layar gelap, teks putih, tombol).
- **File yang disentuh:** `index.html` (baru), `css/style.css` (baru).
- **Requirement:** REQ-38, REQ-39.
- **Cara verifikasi:** Buka `index.html` di browser — halaman tampil tanpa error di console; Three.js ter-load (cek `console` tidak ada error 404/CDN).

### TASK-02 — Scene dasar: renderer, kamera, kabut, cahaya
- **Apa yang dibuat:** `js/scene.js` (renderer + kamera first-person + `FogExp2` + cahaya ambient redup) dan `js/main.js` (init + loop `requestAnimationFrame` yang me-render scene kosong).
- **File yang disentuh:** `js/scene.js` (baru), `js/main.js` (baru).
- **Requirement:** REQ-36, REQ-38.
- **Cara verifikasi:** Buka halaman — layar menampilkan latar gelap berkabut (bukan hitam polos atau error); tidak ada error di console; FPS stabil saat halaman dibiarkan terbuka 30 detik.

### TASK-03 — Tekstur lukis prosedural
- **Apa yang dibuat:** `js/textures.js` dengan pembuat tekstur canvas: kayu, wallpaper, karpet, batu, kertas. Tiap tekstur punya variasi warna, serat/noda/goresan.
- **File yang disentuh:** `js/textures.js` (baru).
- **Requirement:** REQ-35.
- **Cara verifikasi:** Tampilkan tiap tekstur sementara di halaman tes (atau tempelkan ke satu bidang di scene) — tiap tekstur terlihat punya pola dan variasi, bukan warna datar; tidak ada file gambar eksternal di repo.

### TASK-04 — Lantai, dinding, dan denah 5 ruangan (tanpa furnitur)
- **Apa yang dibuat:** `js/rooms.js` bagian 1: denah lobi, perpustakaan, dapur, basement, loteng (lantai + dinding + plafon + tangga naik/turun), dengan data dinding untuk tabrakan dan nama ruangan dari posisi.
- **File yang disentuh:** `js/rooms.js` (baru).
- **Requirement:** REQ-16.
- **Cara verifikasi:** Buka halaman, gerakkan kamera (sementara pakai kontrol bebas) ke tiap ruangan — kelima ruangan terlihat dan terhubung; nama ruangan berubah sesuai posisi saat dicek lewat console.

### TASK-05 — Pemain: gerak first-person + tabrakan dinding
- **Apa yang dibuat:** `js/player.js` (posisi, arah pandang yaw/pitch, kecepatan jalan 3,5 m/detik, tabrakan lingkaran radius 0,4 m terhadap daftar dinding dari `rooms.js`) dan `js/controls.js` bagian 1 (WASD + mouse dengan Pointer Lock + tombol E).
- **File yang disentuh:** `js/player.js` (baru), `js/controls.js` (baru).
- **Requirement:** REQ-06, REQ-32, REQ-34.
- **Cara verifikasi:** WASD bergerak maju/mundur/geser; mouse memutar pandangan; pemain tidak bisa menembus dinding di semua ruangan; kecepatan terasa sama ke segala arah.

### TASK-06 — HUD dasar + menu utama + state machine
- **Apa yang dibuat:** `js/game.js` (state `menu | bermain | menang | kalah`, fungsi `mulai()`/`reset()`) dan `js/hud.js` bagian 1 (menu utama dengan judul + tombol "Mulai" + cara bermain; HUD kosong: jam, lilin, kostum, ruangan).
- **File yang disentuh:** `js/game.js` (baru), `js/hud.js` (baru), `index.html` (tambah elemen menu/HUD).
- **Requirement:** REQ-07, REQ-42.
- **Cara verifikasi:** Saat dibuka, menu utama tampil dan dunia diam; klik "Mulai" → menu hilang, HUD tampil, pemain bisa bergerak; semua teks berbahasa Indonesia.

---

## Fase 2 — Dunia dan konten (tugas 07–12)

### TASK-07 — Furnitur hero lobi + pintu keluar
- **Apa yang dibuat:** Furnitur lobi kualitas hero (meja resepsionis multi-part, karpet, lampu gantung, pintu keluar besar berbingkai + gagang) + dekorasi Halloween lobi (labu, poster pesta, lilin kecil).
- **File yang disentuh:** `js/rooms.js` (tambah furnitur lobi).
- **Requirement:** REQ-17, REQ-23, REQ-35, REQ-36.
- **Cara verifikasi:** Masuk lobi, lihat dari dekat — tiap furnitur terdiri dari beberapa bagian, tekstur lukis terlihat, pintu keluar jelas berbeda dari pintu biasa; tangkapan layar sebagai bukti.

### TASK-08 — Furnitur hero perpustakaan + dapur
- **Apa yang dibuat:** Perpustakaan (rak buku + deretan buku + meja baca + lampu meja) dan dapur (meja + kompor multi-part + rak piring), masing-masing dengan dekorasi Halloween.
- **File yang disentuh:** `js/rooms.js` (tambah furnitur perpustakaan dan dapur).
- **Requirement:** REQ-18, REQ-19, REQ-23, REQ-35.
- **Cara verifikasi:** Jelajahi kedua ruangan — rak buku membentuk lorong, kompor terlihat sebagai kompor (bukan kotak); tiap ruangan punya minimal 3 jenis dekorasi yang terlihat.

### TASK-09 — Furnitur hero basement + loteng
- **Apa yang dibuat:** Basement (peti, tong, pipa, meja kerja; pencahayaan paling gelap) dan loteng (tumpukan peti tua, kursi tua, cermin retak, sarang laba-laba), masing-masing dengan dekorasi Halloween.
- **File yang disentuh:** `js/rooms.js` (tambah furnitur basement dan loteng).
- **Requirement:** REQ-20, REQ-21, REQ-23, REQ-35, REQ-36.
- **Cara verifikasi:** Basement jelas lebih gelap dari ruangan lain; loteng terlihat penuh barang tua; kedua ruangan bisa dijelajahi tanpa tersangkut furnitur.

### TASK-10 — Lilin: 6 lilin + pengambilan + cahaya berkedip
- **Apa yang dibuat:** `js/candles.js` — 6 lilin di posisi tetap (lobi 1, perpustakaan 1, dapur 1, basement 2, loteng 1), model lilin multi-part + api + cahaya titik berkedip; interaksi ambil (jarak ≤ 2 m + tombol aksi) yang menghilangkan lilin dan menambah hitungan HUD.
- **File yang disentuh:** `js/candles.js` (baru), `js/hud.js` (tambah hitungan `Lilin: X/6`), `js/player.js` (deteksi objek dalam jarak interaksi, bila belum ada).
- **Requirement:** REQ-01, REQ-05, REQ-22, REQ-36.
- **Cara verifikasi:** Ambil tiap lilin satu per satu — HUD naik 0→6, lilin hilang dari ruangan, cahaya padam; lilin yang sudah diambil tidak bisa diambil lagi.

### TASK-11 — Pintu biasa, pintu terkunci, dan lemari (tanpa kostum dulu)
- **Apa yang dibuat:** Pintu biasa antar-ruangan (buka/tutup dengan tombol aksi), 2 pintu terkunci (perpustakaan, basement) dengan gembok visual + pesan "Terkunci — butuh kostum Penyihir" saat dicoba, dan 5 lemari kostum (1 per ruangan, model multi-part) yang saat ini hanya menampilkan pesan "Lemari kostum" saat diinteraksi.
- **File yang disentuh:** `js/rooms.js` (pintu + lemari), `js/hud.js` (prompt interaksi + pesan).
- **Requirement:** REQ-04, REQ-05, REQ-13 (bagian pesan terkunci), REQ-14 (bagian lemari ada).
- **Cara verifikasi:** Pintu biasa terbuka dengan tombol aksi; pintu terkunci menampilkan pesan dan tetap tertutup; tiap ruangan punya 1 lemari yang memunculkan prompt saat didekati.

### TASK-12 — Timer tengah malam + HUD jam + layar kalah timer
- **Apa yang dibuat:** Timer di `js/game.js` (mulai 23:00, berjalan ke 00:00 dalam 8–10 menit waktu nyata), tampilan jam di HUD, dan transisi ke layar kalah "Tengah malam tiba" saat timer habis.
- **File yang disentuh:** `js/game.js` (timer), `js/hud.js` (tampilan jam + layar kalah).
- **Requirement:** REQ-02, REQ-03, REQ-30.
- **Cara verifikasi:** Mulai permainan, biarkan berjalan — jam HUD bergerak maju; saat mencapai 00:00 (untuk tes, boleh percepat timer sementara lalu kembalikan) layar kalah tampil dengan alasan tengah malam; tombol "Main Lagi" mereset timer.

---

## Fase 3 — Kostum (tugas 13–18)

### TASK-13 — Sistem kostum dasar + panel pilih kostum di lemari
- **Apa yang dibuat:** `js/costumes.js` (state `kostumAktif`, `gantiKostum()`, kostum awal `biasa`) + panel pilih kostum di HUD yang terbuka dari lemari (4 tombol: Hantu, Vampir, Labu, Penyihir + tutup). HUD menampilkan nama kostum aktif.
- **File yang disentuh:** `js/costumes.js` (baru), `js/hud.js` (panel kostum + nama kostum), `js/rooms.js` (lemari memicu panel).
- **Requirement:** REQ-09, REQ-14.
- **Cara verifikasi:** Buka lemari di tiap ruangan — panel muncul dengan 4 kostum; pilih satu — HUD menampilkan nama kostum itu; ganti lagi di lemari lain — kostum berubah.

### TASK-14 — Kostum Hantu: tembus dinding
- **Apa yang dibuat:** Kemampuan Hantu di `costumes.js` + `player.js`: saat aktif, pemeriksaan tabrakan dinding dimatikan maksimal 5 detik (atau sampai pemain kembali ke ruang terbuka), lalu menyala lagi; indikator durasi di HUD; cooldown 10 detik; efek tepi layar berkabut.
- **File yang disentuh:** `js/costumes.js`, `js/player.js`, `js/hud.js`.
- **Requirement:** REQ-10.
- **Cara verifikasi:** Pakai kostum Hantu, aktifkan kemampuan di depan dinding — pemain menembus ke sisi lain; setelah ≤ 5 detik tabrakan kembali normal; cooldown mencegah pemakaian langsung lagi.

### TASK-15 — Kostum Vampir: lihat dalam gelap
- **Apa yang dibuat:** Kemampuan Vampir: saklar nyala/mati yang menambah cahaya di sekitar pemain (radius ~6 m); efek tepi layar merah gelap saat aktif; indikator status di HUD.
- **File yang disentuh:** `js/costumes.js`, `js/scene.js` (cahaya pengikut pemain), `js/hud.js`.
- **Requirement:** REQ-11.
- **Cara verifikasi:** Masuk basement tanpa Vampir — gelap, sulit melihat jalan; nyalakan Vampir — area sekitar terang, jalan dan lilin terlihat; matikan — kembali gelap.

### TASK-16 — Kostum Labu: menakuti hantu kecil
- **Apa yang dibuat:** Kemampuan Labu: saat dipakai, hantu kecil dalam radius 6 m berbalik arah dan menjauh minimal 5 m; cooldown 8 detik; efek visual oranye + suara. (Butuh hantu kecil dari TASK-20 — jika dikerjakan berurutan, tugas ini diuji penuh setelah TASK-20; sebelum itu, uji logika pemicu + cooldown + efek visualnya saja.)
- **File yang disentuh:** `js/costumes.js`, `js/ghosts.js` (fungsi `takuti()` pada hantu kecil — dibuat di sini sebagai stub, diisi penuh di TASK-20), `js/hud.js`.
- **Requirement:** REQ-12.
- **Cara verifikasi:** Saat hantu kecil dekat, pakai kemampuan — hantu kecil menjauh ≥ 5 m dan tidak menangkap selama efek; cooldown 8 detik terlihat di HUD; hantu patroli tidak terpengaruh.

### TASK-17 — Kostum Penyihir: membuka pintu terkunci
- **Apa yang dibuat:** Logika buka pintu terkunci di `costumes.js` + `rooms.js`: interaksi pintu terkunci saat memakai kostum Penyihir membuka pintu secara permanen untuk sesi itu; tanpa kostum Penyihir tetap menampilkan pesan terkunci.
- **File yang disentuh:** `js/costumes.js`, `js/rooms.js`, `js/hud.js`.
- **Requirement:** REQ-13.
- **Cara verifikasi:** Coba pintu terkunci perpustakaan/basement dengan kostum lain — tetap terkunci + pesan; ganti ke Penyihir, coba lagi — pintu terbuka dan tetap terbuka; ulangi untuk pintu kedua.

### TASK-18 — Tombol kemampuan + efek visual tiap kostum
- **Apa yang dibuat:** Tombol kemampuan: `Q`/klik kanan di desktop dan tombol kemampuan di HP; efek visual tepi layar per kostum (Hantu: kabut putih, Vampir: merah, Labu: oranye, Penyihir: ungu) + ikon status di HUD.
- **File yang disentuh:** `js/controls.js` (tombol kemampuan), `js/costumes.js`, `js/hud.js`, `css/style.css`.
- **Requirement:** REQ-15, REQ-37.
- **Cara verifikasi:** Tiap kostum dipakai bergantian — efek tepi layar dan ikon HUD berbeda dan sesuai kostum; memakai satu kostum tidak memberi kekuatan kostum lain (cek satu per satu).

---

## Fase 4 — Hantu AI (tugas 19–22)

### TASK-19 — Hantu patroli: model + rute waypoint
- **Apa yang dibuat:** `js/ghosts.js` bagian 1: 3 hantu patroli dengan model berjubah multi-part + mata menyala + efek melayang; tiap hantu mengikuti rute waypoint (lobi–perpustakaan, lobi–dapur, tangga basement–loteng), berhenti ±1 detik di tiap waypoint.
- **File yang disentuh:** `js/ghosts.js` (baru).
- **Requirement:** REQ-24, REQ-35, REQ-37.
- **Cara verifikasi:** Amati 60 detik — ketiga hantu bergerak mengikuti rute, berhenti sebentar di waypoint, tidak diam di tempat; model hantu terlihat jelas berbeda dari furnitur.

### TASK-20 — Hantu kecil: gerak acak + fungsi takuti
- **Apa yang dibuat:** `js/ghosts.js` bagian 2: 4 hantu kecil (lebih kecil, lebih cepat, warna berbeda) yang bergerak acak di ruangannya masing-masing (perpustakaan, dapur, basement, loteng); lengkapi fungsi `takuti()` dari TASK-16 agar hantu kecil benar-benar menjauh saat kostum Labu dipakai.
- **File yang disentuh:** `js/ghosts.js`, `js/costumes.js` (sambungkan pemicu Labu ke `takuti()`).
- **Requirement:** REQ-25, REQ-12 (verifikasi penuh).
- **Cara verifikasi:** Amati hantu kecil — bergerak acak, tidak mengikuti rute tetap; pakai kostum Labu di dekatnya — hantu kecil menjauh ≥ 5 m (verifikasi penuh TASK-16).

### TASK-21 — Mode kejar hantu patroli (garis pandang + kembali patroli)
- **Apa yang dibuat:** Logika kejar di `ghosts.js`: raycast garis pandang hantu→pemain; jika pemain terlihat dalam jarak ≤ 8 m, hantu mengejar (kecepatan naik ~60%); jika pemain lolos dari pandangan/jarak selama 3 detik, hantu kembali ke waypoint terdekat dan lanjut patroli.
- **File yang disentuh:** `js/ghosts.js`.
- **Requirement:** REQ-26.
- **Cara verifikasi:** Berdiri di depan hantu patroli — hantu berbelok dan mengejar; sembunyi di balik dinding 3 detik — hantu kembali ke rute; berdiri di balik dinding sejak awal — hantu tidak mengejar.

### TASK-22 — Tertangkap hantu + peringatan hantu dekat
- **Apa yang dibuat:** Deteksi tangkap (jarak hantu–pemain < 1 m → `game.kalah("tertangkap")`) + peringatan: tepi layar merah berdenyut + suara saat hantu terdekat ≤ 6 m.
- **File yang disentuh:** `js/ghosts.js`, `js/game.js`, `js/hud.js`, `js/audio.js` (suara peringatan — dibuat di sini atau di TASK-25, pilih satu dan catat).
- **Requirement:** REQ-27, REQ-28, REQ-31.
- **Cara verifikasi:** Biarkan hantu menyentuh pemain — layar kalah "Tertangkap hantu"; dekati hantu tanpa tertangkap — peringatan visual + suara muncul sebelum kontak.

---

## Fase 5 — Menang, kontrol HP, audio, polish (tugas 23–28)

### TASK-23 — Kondisi menang: pintu keluar + layar menang
- **Apa yang dibuat:** Logika menang di `game.js`: interaksi pintu keluar dengan lilin = 6 sebelum 00:00 → layar menang (teks menang + lilin 6/6 + sisa waktu + tombol "Main Lagi"); interaksi dengan lilin < 6 → pesan "Butuh 6 lilin untuk membuka pintu ini".
- **File yang disentuh:** `js/game.js`, `js/hud.js`, `js/rooms.js` (pintu keluar sebagai objek interaksi).
- **Requirement:** REQ-04, REQ-29.
- **Cara verifikasi:** Coba pintu keluar dengan 0 lilin — pesan butuh 6 lilin; kumpulkan 6 lilin, ke pintu keluar — layar menang + sisa waktu benar; tombol "Main Lagi" mereset permainan.

### TASK-24 — Reset penuh permainan ("Main Lagi")
- **Apa yang dibuat:** Fungsi `reset()` lengkap di `game.js`: timer kembali ke awal, 6 lilin kembali ke posisi awal, pemain kembali ke lobi, hantu kembali ke waypoint awal, pintu terkunci kembali terkunci, kostum kembali ke `biasa`, HUD kembali ke 0/6.
- **File yang disentuh:** `js/game.js`, `js/candles.js`, `js/ghosts.js`, `js/costumes.js`, `js/rooms.js`, `js/hud.js`.
- **Requirement:** REQ-08.
- **Cara verifikasi:** Main sampai menang/kalah, klik "Main Lagi" — semua kembali ke kondisi awal (cek: lilin 0/6, jam awal, pintu terkunci menutup lagi, hantu di posisi awal); mainkan sesi kedua sampai selesai tanpa error.

### TASK-25 — Kontrol HP: joystick virtual + tombol aksi + putar pandang
- **Apa yang dibuat:** `js/controls.js` bagian 2: deteksi sentuh → joystick virtual kiri bawah (seret = gerak), tombol aksi kanan bawah, tombol kemampuan; seret di area layar lain = putar pandangan; HUD menyesuaikan teks prompt untuk HP.
- **File yang disentuh:** `js/controls.js`, `css/style.css`, `index.html` (elemen joystick/tombol).
- **Requirement:** REQ-33, REQ-34.
- **Cara verifikasi:** Buka di HP (atau emulator sentuh browser) — joystick dan tombol aksi muncul; seret joystick menggerakkan pemain; tombol aksi mengambil lilin/membuka pintu; seret layar memutar pandangan; kecepatan jalan sama dengan desktop.

### TASK-26 — Audio sintetis WebAudio + tombol bisu
- **Apa yang dibuat:** `js/audio.js`: suara langkah, ambil lilin, buka pintu, ganti kostum, peringatan hantu, kemampuan kostum, menang, kalah, dan dengung latar mansion — semua sintetis (osilator/noise), tanpa file audio; tombol bisu di HUD.
- **File yang disentuh:** `js/audio.js` (baru), `js/hud.js` (tombol bisu).
- **Requirement:** REQ-43.
- **Cara verifikasi:** Mainkan satu sesi dengan suara nyala — tiap aksi terdengar suaranya; klik bisu — semua suara berhenti; tidak ada file `.mp3`/`.wav`/`.ogg` di repo.

### TASK-27 — Polish visual: kabut, cahaya lilin, bayangan, prompt
- **Apa yang dibuat:** Penyetelan akhir suasana: densitas kabut, intensitas + kedip cahaya lilin, bayangan furnitur/hantu, prompt interaksi yang muncul/hilang tepat pada jarak ≤ 2 m, dan teks prompt yang benar di desktop vs HP.
- **File yang disentuh:** `js/scene.js`, `js/candles.js`, `js/hud.js`, `css/style.css`.
- **Requirement:** REQ-05, REQ-36.
- **Cara verifikasi:** Jelajahi tiap ruangan dari dekat — kabut terlihat di koridor, cahaya lilin berkedip, bayangan terlihat di lantai; prompt muncul hanya dalam jarak interaksi dan hilang di luar jarak.

### TASK-28 — Sapu teks: semua UI Bahasa Indonesia
- **Apa yang dibuat:** Pemeriksaan dan perbaikan semua teks yang dilihat pemain (menu, HUD, prompt, pesan, panel kostum, layar menang/kalah) menjadi Bahasa Indonesia.
- **File yang disentuh:** `index.html`, `js/hud.js`, `js/game.js`, `js/rooms.js` (teks pesan), `css/style.css` (bila ada teks di CSS).
- **Requirement:** REQ-42.
- **Cara verifikasi:** Baca semua layar satu per satu (menu, HUD, prompt, panel kostum, menang, kalah) — tidak ada teks Inggris di UI pemain; judul game tetap "Rumah Hantu: Pesta Kostum".

---

## Fase 6 — Verifikasi akhir

### TASK-29 — Verifikasi akhir: sesi penuh desktop + HP + repo publik
- **Apa yang dibuat:** Bukan fitur baru — putaran verifikasi akhir atas seluruh game + penyiapan repo: file spec ini disalin ke folder `/.kiro` di repo GitHub publik, dan game diuji dari repo tersebut.
- **File yang disentuh:** `.kiro/requirements.md`, `.kiro/design.md`, `.kiro/tasks.md` (salinan file spec ini); `index.html` + `js/` + `css/` (hanya perbaikan bug yang ditemukan saat verifikasi, tidak ada fitur baru).
- **Requirement:** REQ-40, REQ-41, dan semua requirement sebagai daftar periksa.
- **Cara verifikasi (semua harus lolos):**
  1. **Game ke-load:** buka `index.html` di Chrome desktop dan di browser HP — menu utama tampil, tidak ada error di console.
  2. **Gerak jalan:** WASD/mouse (desktop) dan joystick (HP) menggerakkan pemain; tidak menembus dinding.
  3. **Kostum jalan:** keempat kostum bisa dipilih di lemari; keempat kekuatan bekerja (tembus dinding, lihat gelap, takuti hantu kecil, buka pintu terkunci).
  4. **Hantu jalan:** hantu patroli mengikuti rute, mengejar saat melihat pemain, kembali patroli saat lolos; hantu kecil bergerak acak; tertangkap = kalah.
  5. **Lilin jalan:** 6 lilin bisa diambil, HUD 0→6, pintu keluar terkunci sampai 6 lilin.
  6. **Menang/kalah jalan:** menang lewat pintu keluar dengan 6 lilin; kalah lewat timer habis; kalah lewat tertangkap hantu; "Main Lagi" mereset penuh.
  7. **Kualitas visual:** tiap ruangan diperiksa dari dekat — furnitur multi-part, tekstur lukis, kabut + cahaya lilin + bayangan.
  8. **Repo publik:** repo GitHub bisa dibuka tanpa login; folder `/.kiro` berisi ketiga file spec ini.
  9. **Teks Indonesia + audio:** semua UI Bahasa Indonesia; suara sintetis terdengar; tombol bisu berfungsi.
- **Bukti:** tangkapan layar/video tiap poin di atas disimpan sebagai bukti verifikasi sebelum game dinyatakan selesai.

---

## Ringkasan Jumlah

| Fase | Tugas |
|---|---|
| Fase 1 — Fondasi | TASK-01 s.d. TASK-06 (6) |
| Fase 2 — Dunia dan konten | TASK-07 s.d. TASK-12 (6) |
| Fase 3 — Kostum | TASK-13 s.d. TASK-18 (6) |
| Fase 4 — Hantu AI | TASK-19 s.d. TASK-22 (4) |
| Fase 5 — Menang, kontrol HP, audio, polish | TASK-23 s.d. TASK-28 (6) |
| Fase 6 — Verifikasi akhir | TASK-29 (1) |
| **Total** | **29 tugas** |
