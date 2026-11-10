# Design — Rumah Hantu: Pesta Kostum

> Desain teknis untuk game 3D first-person (Three.js) hackathon Kiroween 2026.
> Dokumen ini adalah jawaban atas `requirements.md`: tiap bagian menunjuk ke requirement yang dipenuhinya.
> Aturan kualitas yang mengikat seluruh dokumen ini: aset 3D langsung kualitas hero — geometri detail multi-part + tekstur lukis + pencahayaan atmosferik. Tidak ada versi kotak polos/low-poly sebagai tahap awal.

---

## 1. Gambaran Umum

**Judul:** Rumah Hantu: Pesta Kostum
**Genre:** Horor ringan / eksplorasi first-person dengan mekanik kostum.
**Cerita singkat:** Pemain datang ke pesta kostum Halloween di sebuah mansion. Saat tiba, pesta sudah bubar dan para tamu berubah jadi hantu. Pemain harus mengumpulkan 6 lilin, menghindari hantu patroli, dan keluar lewat pintu utama sebelum tengah malam.
**Platform:** Web, satu halaman. Desktop (keyboard + mouse) dan HP (layar sentuh).
**Teknologi:** Three.js (CDN + import map, tanpa build step), JavaScript module (ESM), WebAudio untuk suara sintetis, tanpa file audio eksternal, tanpa backend/server.

### Aliran game (state machine)

```
MENU UTAMA → BERMAIN → MENANG
                  ↘ KALAH (timer habis / tertangkap hantu)
MENANG / KALAH → (tombol "Main Lagi") → BERMAIN (reset penuh)
```

| State | Yang berjalan | Yang diam |
|---|---|---|
| Menu Utama | Render adegan lobi sebagai latar (kamera diam, kabut + lilin menyala) | Timer, hantu, input pemain |
| Bermain | Timer, hantu patroli + hantu kecil, input pemain, deteksi tabrakan, HUD | — |
| Menang | Layar hasil menang, render adegan diam | Timer, hantu, input pemain |
| Kalah | Layar hasil kalah + alasan, render adegan diam | Timer, hantu, input pemain |

Transisi state diatur oleh satu modul `game.js` (lihat §2). Tidak ada state lain. Reset permainan (tombol "Main Lagi") mengembalikan: timer ke awal, lilin ke posisi awal (6 lilin), pemain ke lobi, hantu ke titik patroli awal, pintu terkunci kembali terkunci, kostum kembali ke kostum biasa.

---

## 2. Struktur File

```
rumah-hantu-pesta-kostum/
├── index.html            # Satu-satunya halaman: import map Three.js, kanvas, HUD, menu, layar hasil
├── css/
│   └── style.css         # Gaya HUD, menu, prompt, joystick virtual, layar menang/kalah
├── js/
│   ├── main.js           # Titik masuk: init renderer, loop game, hubungkan semua modul
│   ├── game.js           # State machine (menu/bermain/menang/kalah), timer tengah malam, reset
│   ├── scene.js          # Renderer, kamera, kabut, pencahayaan dasar, langit-langit/lantai mansion
│   ├── rooms.js          # 5 ruangan + denah + furnitur hero + dekorasi + lemari + pintu
│   ├── player.js         # Gerakan first-person, tabrakan dinding, kamera, deteksi ruangan aktif
│   ├── costumes.js       # 4 kostum + kekuatan + cooldown + efek visual per kostum
│   ├── ghosts.js         # Hantu patroli (rute, kejar, kembali) + hantu kecil + deteksi tangkap
│   ├── candles.js        # 6 lilin: posisi, pengambilan, cahaya berkedip, hitungan HUD
│   ├── hud.js            # HUD: jam, lilin X/6, nama kostum, nama ruangan, prompt, tombol bisu
│   ├── controls.js       # Input desktop (WASD + mouse + E) dan HP (joystick virtual + tombol aksi)
│   ├── audio.js          # Suara sintetis WebAudio: langkah, ambil lilin, peringatan, menang/kalah
│   └── textures.js       # Pembuat tekstur lukis prosedural (canvas): kayu, dinding, kain, kertas
└── .kiro/
    ├── requirements.md   # (file ini adalah salinan spec — lihat requirements.md)
    ├── design.md         # (dokumen ini)
    └── tasks.md          # (daftar tugas implementasi)
```

**Prinsip pembagian modul:**
- Satu modul = satu tanggung jawab. Modul tidak saling mengimpor secara melingkar; `main.js` yang merangkai semuanya.
- Data dunia (denah ruangan, posisi lilin, rute hantu, posisi lemari/pintu) hidup di modul pemiliknya (`rooms.js`, `candles.js`, `ghosts.js`), bukan tersebar di `main.js`.
- Tidak ada file HTML kedua. Semua layar (menu, HUD, menang/kalah) adalah elemen DOM di `index.html` yang ditampilkan/disembunyikan oleh `hud.js` + `game.js`.

---

## 3. Modul — Tanggung Jawab dan Antarmuka

### 3.1 `scene.js` — Renderer dan suasana
- Membuat `WebGLRenderer` (antialias aktif, bayangan aktif), `Scene`, kamera perspektif (FOV 70, near 0,1, far 100).
- Kabut: `THREE.FogExp2` warna gelap keunguan, densitas sedang — cukup pekat di ujung koridor, tidak menutup jalan di depan pemain.
- Pencahayaan dasar: cahaya ambient sangat redup + cahaya titik dari tiap lilin yang menyala (berkedip) + satu cahaya bulan redup dari jendela lobi.
- Bayangan: lampu utama tiap ruangan melempar bayangan (`castShadow` pada furnitur, `receiveShadow` pada lantai/dinding).
- Menyediakan fungsi `getScene()`, `getCamera()`, `getRenderer()` untuk modul lain.
- Memenuhi REQ-36.

### 3.2 `rooms.js` — Denah, ruangan, furnitur, pintu
- Denah (satu lantai + basement di bawah + loteng di atas, terhubung tangga):
  - **Lobi** (tengah, titik awal pemain + pintu keluar di dinding depan).
  - **Perpustakaan** (sayap kiri lobi, lewat pintu biasa).
  - **Dapur** (sayap kanan lobi, lewat pintu biasa).
  - **Basement** (bawah lobi, lewat tangga turun; ruangan paling gelap).
  - **Loteng** (atas lobi, lewat tangga naik).
- Tiap ruangan dibangun dari geometri multi-part: lantai papan kayu (tekstur lukis), dinding panel + wallpaper, plafon, jendela, pintu berbingkai dengan gagang.
- Furnitur hero per ruangan (tiap furnitur = beberapa mesh, bukan satu kotak):
  - Lobi: meja resepsionis, karpet merah, lampu gantung, lemari kostum, pintu keluar besar.
  - Perpustakaan: rak buku (rak + deretan buku warna-warni + tangga kecil), meja baca, lampu meja, lemari kostum.
  - Dapur: meja dapur, kompor (badan + tungku + kenop), lemari dapur, rak piring, lemari kostum.
  - Basement: peti kayu, tong, pipa di dinding, meja kerja, lemari kostum.
  - Loteng: tumpukan peti, kursi tua, cermin retak, sarang laba-laba di sudut, lemari kostum.
- Dekorasi Halloween (REQ-23): labu berukir (badan + mata + mulut + cahaya dalam), sarang laba-laba, poster pesta, lilin-lilin kecil — minimal 3 jenis per ruangan.
- Pintu: pintu biasa (terbuka dengan tombol aksi) dan pintu terkunci (2 buah: perpustakaan dan basement, hanya dibuka kostum Penyihir — REQ-13). Pintu terkunci memakai gembok visual + pesan saat dicoba tanpa kostum Penyihir.
- Lemari kostum: 1 per ruangan (total 5). Model lemari: badan + 2 pintu + gagang + gantungan baju di dalam. Interaksi lemari membuka panel pilih kostum (DOM, 4 tombol).
- Menyediakan data untuk modul lain: daftar dinding/penghalang (untuk tabrakan), posisi lemari, posisi pintu, nama ruangan dari posisi pemain.
- Memenuhi REQ-16 s.d. REQ-23, REQ-35.

### 3.3 `player.js` — Gerakan first-person dan tabrakan
- Posisi pemain: vektor (x, z) di lantai + ketinggian mata tetap 1,6 m. Arah pandang: yaw (mouse/seret) + pitch (dibatasi ±80° agar tidak jungkir).
- Kecepatan jalan: sama di desktop dan HP (nilai tunggal di satu konstanta, mis. 3,5 m/detik). Tidak ada lari — kecepatan tunggal menjaga keseimbangan lawan hantu.
- Tabrakan: pemain adalah lingkaran radius 0,4 m di bidang lantai. Tiap frame, gerakan diuji terhadap daftar dinding/penghalang dari `rooms.js`; gerakan yang menabrak dibatalkan pada sumbu tersebut (pemain bisa meluncur menyusuri dinding, tidak menembus).
- Pengecualian: saat kemampuan Hantu aktif, pemeriksaan tabrakan dinding dimatikan sementara (lihat §4.1).
- Deteksi ruangan aktif: dari posisi pemain, tentukan ruangan saat ini untuk HUD (nama ruangan) dan untuk logika gelap basement.
- Memenuhi REQ-06, REQ-32, REQ-33, REQ-34.

### 3.4 `costumes.js` — Empat kostum dan kekuatannya
- State: `kostumAktif` (satu dari: `biasa | hantu | vampir | labu | penyihir`), `cooldown` per kemampuan, `durasiAktif` untuk kemampuan berdurasi.
- Fungsi: `gantiKostum(nama)`, `pakaiKemampuan()`, `kostumAktif()`, `statusKemampuan()` (untuk HUD: nama kostum, sisa durasi/cooldown).
- Efek visual per kostum (agar pemain tahu kostumnya tanpa membuka menu — REQ-37):
  - Hantu: tepi layar berkabut putih transparan saat kemampuan aktif.
  - Vampir: tepi layar merah gelap + kecerahan area sekitar naik saat kemampuan aktif.
  - Labu: tepi layar oranye + ikon labu di HUD menyala.
  - Penyihir: tepi layar ungu + ikon topi di HUD menyala.
- Detail tiap kekuatan ada di §4. Memenuhi REQ-09 s.d. REQ-15.

### 3.5 `ghosts.js` — Hantu patroli dan hantu kecil
- **Hantu patroli (minimal 3):** tiap hantu punya rute waypoint (daftar titik di koridor/ruangan). Bergerak dari waypoint ke waypoint dengan kecepatan patroli; di tiap waypoint berhenti sebentar (±1 detik) lalu lanjut. Model: badan berjubah (kerucut/bola bertumpuk, multi-part) + mata menyala + efek melayang (naik-turun halus).
- **Hantu kecil (minimal 4):** lebih kecil, lebih cepat, bergerak acak di dalam satu ruangan (pilih titik acak, bergerak ke sana, ulangi). Model serupa tapi lebih kecil dan warna berbeda.
- **Mode kejar (hantu patroli):** jika pemain dalam jarak kejar (mis. ≤ 8 m) dan garis pandang bersih (raycast dari hantu ke pemain tidak terhalang dinding), hantu masuk mode kejar: kecepatan naik ~60%, arah langsung ke pemain. Jika pemain keluar dari jarak/pandangan selama 3 detik, hantu kembali ke waypoint terdekat dan lanjut patroli.
- **Tangkap:** jika jarak hantu–pemain < 1 m, panggil `game.kalah("tertangkap")` (REQ-27). Hantu kecil juga bisa menangkap dengan aturan jarak yang sama.
- **Peringatan:** modul memberi tahu `hud.js` + `audio.js` saat hantu terdekat dalam jarak dekat (mis. ≤ 6 m): HUD menampilkan tepi layar merah berdenyut + suara peringatan.
- Memenuhi REQ-24 s.d. REQ-28.

### 3.6 `candles.js` — Enam lilin
- Posisi tetap sesuai requirements: lobi 1, perpustakaan 1, dapur 1, basement 2, loteng 1 (REQ-22).
- Model lilin: badan lilin + sumbu + api (sprite/kerucut kecil menyala) + cahaya titik yang berkedip (intensitas berfluktuasi acak halus tiap frame).
- Pengambilan: pemain dalam jarak ≤ 2 m + tombol aksi → lilin hilang dari ruangan, cahaya padam, hitungan HUD +1, suara ambil lilin, dan (jika sudah 6) pesan "Pintu keluar terbuka!".
- Menyediakan `jumlahLilin()`, `sisaLilin()`, `reset()` untuk `game.js` dan `hud.js`.
- Memenuhi REQ-01, REQ-22, REQ-36 (cahaya berkedip).

### 3.7 `hud.js` — HUD, menu, prompt, layar hasil
- Elemen HUD (selalu terlihat saat Bermain): jam (format `23:xx` berjalan ke `00:00`), `Lilin: X/6`, nama kostum aktif, nama ruangan aktif, ikon status kemampuan (durasi/cooldown), tombol bisu.
- Prompt interaksi: teks di tengah bawah layar ("Ambil Lilin [E]", "Buka Pintu [E]", "Ganti Kostum [E]") — muncul hanya saat ada objek dalam jarak interaksi; di HP teks tombolnya menyesuaikan ("Ketuk tombol aksi").
- Panel pilih kostum: muncul saat berinteraksi dengan lemari; 4 tombol (Hantu, Vampir, Labu, Penyihir) + tombol tutup; memilih langsung mengganti kostum dan menutup panel.
- Menu utama: judul, tombol "Mulai", teks cara bermain (6 lilin, 4 kostum, tengah malam).
- Layar menang: teks menang + lilin 6/6 + sisa waktu + tombol "Main Lagi".
- Layar kalah: teks kalah + alasan (timer habis / tertangkap hantu) + tombol "Main Lagi".
- Semua teks Bahasa Indonesia (REQ-42).
- Memenuhi REQ-05, REQ-07, REQ-08, REQ-14, REQ-42.

### 3.8 `controls.js` — Input desktop dan HP
- **Desktop:** `keydown`/`keyup` WASD; `mousemove` dengan Pointer Lock untuk arah pandang (klik kanvas untuk mengunci pointer); `KeyE` atau klik mouse sebagai tombol aksi; tombol 1–4 sebagai jalan pintas ganti kostum (hanya berfungsi saat panel lemari terbuka / di dekat lemari).
- **HP (layar sentuh):** deteksi `touchstart` → tampilkan joystick virtual (kiri bawah) dan tombol aksi (kanan bawah). Joystick: lingkaran dasar + tuas; vektor seretan = arah gerak relatif terhadap arah pandang. Seret di area layar selain joystick = putar arah pandang. Tombol aksi: lingkaran besar, disentuh = interaksi.
- Modul ini hanya menerjemahkan input menjadi perintah (`gerak`, `putar`, `aksi`, `gantiKostum`) — logika gerak dan aksi tetap di `player.js` / `game.js`.
- Memenuhi REQ-32, REQ-33, REQ-34.

### 3.9 `audio.js` — Suara sintetis WebAudio
- Semua suara dibuat dengan `AudioContext` + osilator/noise, tanpa file audio (REQ-43).
- Daftar suara: langkah kaki (noise pendek berirama), ambil lilin (nada naik singkat), buka pintu (gesekan rendah), ganti kostum (nada sapuan), peringatan hantu (dengung rendah berdenyut), kemampuan kostum (efek khas per kostum), menang (nada naik ceria), kalah (nada turun suram).
- Suara latar: dengung mansion pelan (noise + osilator rendah) selama Bermain; berhenti di menu.
- Tombol bisu di HUD mematikan semua suara; status bisu tersimpan selama sesi.
- AudioContext dibuat/dilanjutkan setelah interaksi pertama pengguna (aturan autoplay browser).

### 3.10 `textures.js` — Tekstur lukis prosedural
- Tekstur dibuat dengan `<canvas>` 2D di runtime (tanpa file gambar eksternal): kayu papan (garis serat + variasi warna), dinding wallpaper (pola + noda), kain karpet (pola), kertas buku (garis + warna sampul acak), batu basement (blok + lumut).
- Fungsi per jenis: `kayu()`, `wallpaper()`, `karpet()`, `batu()`, `kertas()` — mengembalikan `THREE.CanvasTexture`.
- Tujuannya: permukaan terlihat "dilukis" (variasi warna, noda, goresan), bukan warna datar — memenuhi REQ-35 tanpa mengunduh aset eksternal.

### 3.11 `game.js` — State machine dan timer
- State: `menu | bermain | menang | kalah`.
- Timer: mulai dari pukul 23:00 (contoh awal) dan berjalan ke 00:00 selama 8–10 menit waktu nyata (REQ-03). Kecepatan timer = 60 menit permainan / durasi sesi. Tiap detik, perbarui HUD jam.
- Saat timer mencapai 00:00 → `kalah("tengah malam")`.
- Saat hantu menangkap pemain → `kalah("tertangkap")`.
- Saat pemain berinteraksi dengan pintu keluar dan lilin = 6 → `menang()`.
- Fungsi `mulai()`, `reset()`, `menang()`, `kalah(alasan)` dipakai `main.js` dan modul lain.
- Memenuhi REQ-02, REQ-03, REQ-29, REQ-30, REQ-31.

### 3.12 `main.js` — Titik masuk dan loop
- Urutan init: `scene` → `textures` → `rooms` → `candles` → `ghosts` → `player` → `costumes` → `hud` → `controls` → `audio` → tampilkan menu.
- Loop (`requestAnimationFrame`): delta waktu → update input → update pemain → update hantu → update lilin (kedip api) → update timer → update HUD → render.
- Loop hanya mengupdate dunia saat state = `bermain`; saat menu/menang/kalah, render tetap jalan (latar hidup: api lilin berkedip, kabut) tapi timer dan hantu diam.

---

## 4. Detail Mekanik Kostum

| Kostum | Kekuatan | Cara pakai | Durasi | Cooldown | Batasan |
|---|---|---|---|---|---|
| Hantu | Tembus dinding | Tekan tombol kemampuan saat memakai kostum Hantu | Maks. 5 detik, berakhir lebih cepat jika pemain sudah kembali ke ruang terbuka | 10 detik setelah berakhir | Tidak bisa menembus lantai/langit-langit (hanya dinding); tidak bisa dipakai saat sedang ditangkap/kejar dalam jarak < 1 m |
| Vampir | Lihat dalam gelap | Tekan tombol kemampuan untuk nyala/mati | Menyala sampai dimatikan atau ganti kostum | Tanpa cooldown (saklar) | Hanya menambah terang di sekitar pemain (radius ~6 m), bukan seluruh ruangan |
| Labu | Nakuti hantu kecil | Tekan tombol kemampuan | Efek langsung: hantu kecil dalam radius 6 m menjauh minimal 5 m | 8 detik | Tidak berpengaruh ke hantu patroli; tidak berpengaruh ke hantu kecil di luar radius |
| Penyihir | Buka pintu terkunci | Berinteraksi dengan pintu terkunci saat memakai kostum ini | Permanen untuk sesi itu (pintu tetap terbuka) | Tanpa cooldown | Hanya untuk 2 pintu terkunci (perpustakaan, basement); bukan pintu keluar |

**Aturan umum:** ganti kostum hanya lewat lemari (REQ-14). Mengganti kostum membatalkan kemampuan kostum lama yang sedang aktif. Tombol kemampuan di desktop: `Q` atau klik kanan; di HP: tombol kemampuan kedua di kanan bawah (muncul hanya saat kostum aktif punya kemampuan yang bisa dipicu — Vampir dan Labu dan Hantu; Penyihir tidak butuh tombol karena lewat interaksi pintu).

---

## 5. Detail Tiap Ruangan

| Ruangan | Lilin | Lemari | Pintu terkunci | Ciri visual | Fungsi dalam permainan |
|---|---|---|---|---|---|
| Lobi | 1 | 1 | — (pintu keluar di sini) | Karpet merah, lampu gantung, meja resepsionis | Titik awal; pintu keluar |
| Perpustakaan | 1 | 1 | 1 | Rak buku tinggi, meja baca, lampu meja | Lilin di balik rak; pintu terkunci butuh Penyihir |
| Dapur | 1 | 1 | — | Meja, kompor, rak piring | Ruangan terang; lilin di atas meja |
| Basement | 2 | 1 | 1 | Paling gelap, peti, tong, pipa | Butuh Vampir untuk menjelajah nyaman; 2 lilin |
| Loteng | 1 | 1 | — | Peti tua, kursi tua, sarang laba-laba | Lilin di ujung loteng |

**Jalur kritis (rute yang harus bisa dilalui pemain):** Lobi → Perpustakaan → kembali ke Lobi → Dapur → kembali ke Lobi → tangga turun ke Basement → kembali ke Lobi → tangga naik ke Loteng → kembali ke Lobi → Pintu keluar. Semua jalur ini harus bebas dari penghalang yang menjebak dan bisa dilalui tanpa kostum apa pun (kostum hanya mempermudah, bukan syarat mutlak — kecuali pintu terkunci yang memang butuh Penyihir, dan di balik pintu terkunci itu ada lilin yang memang harus diambil).

---

## 6. Sistem Hantu Patroli — Detail

- **Jumlah:** 3 hantu patroli + 4 hantu kecil = 7 hantu total.
- **Rute patroli (contoh, disesuaikan saat implementasi):**
  - Hantu A: Perpustakaan saja (ujung barat ↔ dekat pintu perpustakaan) — tidak masuk lobi.
  - Hantu B: Dapur saja (ujung timur ↔ dekat pintu dapur) — tidak masuk lobi.
  - Hantu C: Basement saja (tidak naik ke lobi/loteng).
- **Masa tenggang spawn:** 5 detik pertama setelah mulai, hantu patroli tidak mengejar dan tidak bisa menangkap. Rute patroli dijaga agar tidak ada hantu patroli yang bisa melihat titik spawn pemain (lobi, 0, 2.5) saat permainan dimulai — lobi adalah zona aman awal, bahaya ada di ruangan lain.
- **Kecepatan:** patroli ~1,5 m/detik; kejar ~2,4 m/detik; pemain jalan 3,5 m/detik — pemain bisa lari dari kejaran tapi tidak bisa mengabaikan hantu.
- **Garis pandang:** raycast dari posisi mata hantu ke pemain; jika ada dinding di antaranya, hantu tidak melihat pemain.
- **Hantu kecil:** berkeliaran acak di satu ruangan masing-masing (perpustakaan 1, dapur 1, basement 1, loteng 1); kecepatan ~2 m/detik; tidak punya mode kejar jarak jauh — mereka menangkap hanya jika pemain mendekat (< 2 m) tanpa kostum Labu.
- **Keseimbangan:** hantu tidak boleh berkumpul di satu ruangan; rute dirancang agar selalu ada celah waktu untuk lewat. Jika playtest menunjukkan pemain tertangkap tanpa kesempatan menghindar, kurangi kecepatan kejar atau tambah jeda di waypoint.

---

## 7. Strategi Verifikasi

Verifikasi dilakukan per modul, di browser, tanpa tool khusus — cukup buka `index.html`, mainkan, dan periksa console.

| Yang diuji | Cara mengetes | Lolos jika |
|---|---|---|
| Game ke-load | Buka `index.html` di Chrome desktop + browser HP | Menu utama tampil, tidak ada error merah di console |
| Gerak + tabrakan | WASD / joystick ke semua dinding | Pemain bergerak lancar, tidak menembus dinding |
| Ambil lilin | Dekati tiap lilin, tekan aksi | Hitungan HUD naik, lilin hilang, suara terdengar |
| Ganti kostum | Buka tiap lemari, pilih tiap kostum | Kostum aktif berubah di HUD + efek visual berubah |
| Kemampuan Hantu | Pakai kemampuan di depan dinding | Pemain menembus dinding, kembali normal setelah ≤ 5 detik |
| Kemampuan Vampir | Nyalakan di basement | Area sekitar terang, bisa melihat jalan dan lilin |
| Kemampuan Labu | Pakai saat hantu kecil dekat | Hantu kecil menjauh ≥ 5 m |
| Kemampuan Penyihir | Coba pintu terkunci tanpa/dengan kostum | Tanpa: pesan terkunci; dengan: pintu terbuka |
| Hantu patroli | Diamati 60 detik | Hantu bergerak mengikuti rute, berhenti sebentar di waypoint |
| Hantu kejar | Berdiri di depan hantu patroli | Hantu mengejar; menjauh 3 detik → kembali patroli |
| Tertangkap | Biarkan hantu menyentuh pemain | Layar kalah "Tertangkap hantu" |
| Timer habis | Biarkan timer berjalan (atau percepat untuk tes) | Layar kalah "Tengah malam tiba" |
| Menang | Kumpulkan 6 lilin, ke pintu keluar | Layar menang + sisa waktu |
| Pintu keluar terkunci | Coba buka pintu dengan lilin < 6 | Pesan "Butuh 6 lilin" |
| HP | Mainkan satu sesi penuh di HP | Joystick + tombol aksi berfungsi, tidak ada tombol desktop yang menghalangi |
| Kualitas visual | Periksa tiap ruangan dari dekat | Furnitur multi-part, tekstur lukis terlihat, kabut + cahaya lilin + bayangan ada |
| Audio | Mainkan dengan suara nyala + tombol bisu | Suara langkah/ambil/peringatan terdengar; bisu mematikan semua |
| Teks Indonesia | Baca semua layar | Tidak ada teks Inggris di UI pemain |

**Aturan verifikasi yang mengikat:** tidak ada fitur yang dinyatakan selesai sebelum diuji dengan cara di atas dan lolos. Tangkapan layar/video dari playtest dipakai sebagai bukti untuk tiap tugas di `tasks.md`.
