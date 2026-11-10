# Requirements — Rumah Hantu: Pesta Kostum

> Game 3D first-person (Three.js) untuk hackathon Kiroween 2026, kategori Costume Contest.
> Bahasa UI: Bahasa Indonesia. Platform: browser HP + desktop, satu halaman web.
> Setiap requirement di bawah ini harus bisa diuji — kriteria penerimaannya menyebutkan cara memeriksa, bukan sekadar janji.

---

## 1. Gameplay Inti

**REQ-01 — Misi utama: kumpulkan 6 lilin**
Pemain harus mengumpulkan tepat 6 lilin yang tersebar di dalam mansion untuk membuka jalan keluar.
*Kriteria penerimaan:* ada tepat 6 lilin di dunia game; HUD menampilkan hitungan `Lilin: X/6` yang bertambah 1 setiap kali lilin diambil; lilin yang sudah diambil hilang dari ruangan dan tidak bisa diambil dua kali.

**REQ-02 — Batas waktu: keluar sebelum tengah malam**
Sesi permainan dibatasi timer yang berjalan dari awal permainan sampai pukul 12 malam.
*Kriteria penerimaan:* HUD menampilkan jam yang berjalan maju; timer mencapai 00:00 tepat saat waktu permainan habis; permainan berakhir kalah saat timer habis (lihat REQ-15).

**REQ-03 — Durasi sesi**
Satu sesi permainan berlangsung sekitar 8–10 menit waktu nyata dari mulai sampai timer tengah malam habis.
*Kriteria penerimaan:* dengan timer berjalan tanpa jeda, waktu dari mulai permainan sampai 00:00 terukur 8–10 menit (diukur dengan stopwatch saat playtest).

**REQ-04 — Pintu keluar terkunci sampai 6 lilin terkumpul**
Pintu keluar di lobi tidak bisa dibuka sebelum pemain mengumpulkan 6 lilin.
*Kriteria penerimaan:* berinteraksi dengan pintu keluar saat lilin < 6 menampilkan pesan "Butuh 6 lilin untuk membuka pintu ini"; berinteraksi saat lilin = 6 memicu kondisi menang (lihat REQ-14).

**REQ-05 — Interaksi dengan objek**
Pemain mengambil lilin, membuka pintu, dan mengganti kostum dengan satu tombol aksi yang sama.
*Kriteria penerimaan:* saat pemain berada dalam jarak interaksi (≤ 2 meter) dari objek yang bisa dipakai, muncul prompt di layar ("Ambil Lilin", "Buka Pintu", "Ganti Kostum"); menekan tombol aksi menjalankan interaksi tersebut; di luar jarak, prompt tidak muncul.

**REQ-06 — Mode first-person**
Pemain melihat dunia dari sudut pandang orang pertama, tanpa karakter pemain yang terlihat di layar kecuali efek kostum.
*Kriteria penerimaan:* kamera berada di ketinggian mata (~1,6 m), mengikuti posisi pemain; tidak ada model tubuh pemain yang menghalangi pandangan; arah pandang berubah mengikuti mouse (desktop) atau gestur seret (HP).

**REQ-07 — Menu utama**
Sebelum bermain, tampil menu utama dengan judul game, tombol "Mulai", dan penjelasan singkat cara bermain.
*Kriteria penerimaan:* saat halaman dibuka, menu utama tampil dan dunia game belum berjalan (timer diam, hantu diam); tombol "Mulai" memulai permainan; ada teks cara bermain yang menyebutkan 6 lilin, 4 kostum, dan batas waktu tengah malam.

**REQ-08 — Layar menang dan kalah**
Permainan berakhir dengan layar hasil yang jelas, berbeda untuk menang dan kalah, lengkap dengan tombol "Main Lagi".
*Kriteria penerimaan:* layar menang menampilkan teks menang + jumlah lilin + sisa waktu; layar kalah menampilkan alasan kalah (timer habis atau tertangkap hantu); tombol "Main Lagi" mengulang permainan dari awal dengan timer, lilin, dan posisi hantu direset.

---

## 2. Sistem Kostum

**REQ-09 — Empat kostum**
Game menyediakan tepat 4 kostum: Hantu, Vampir, Labu, dan Penyihir.
*Kriteria penerimaan:* keempat nama kostum muncul di HUD dan di menu lemari; pemain hanya bisa memakai satu kostum dalam satu waktu; kostum awal saat permainan dimulai adalah kostum biasa (tanpa kekuatan).

**REQ-10 — Kostum Hantu: tembus dinding**
Kostum Hantu memberi kemampuan menembus dinding untuk waktu singkat.
*Kriteria penerimaan:* saat kemampuan aktif, pemain bisa berjalan menembus satu dinding dan keluar di sisi lain; kemampuan berakhir otomatis setelah durasi yang ditetapkan (maksimal 5 detik) atau setelah pemain kembali ke ruang terbuka; ada indikator durasi di HUD selama kemampuan aktif; kemampuan tidak bisa dipakai lagi sebelum cooldown selesai.

**REQ-11 — Kostum Vampir: lihat dalam gelap**
Kostum Vampir memberi kemampuan melihat dalam gelap.
*Kriteria penerimaan:* saat kemampuan aktif, area gelap (terutama basement) menjadi cukup terang untuk melihat jalan, dinding, dan lilin; efeknya terlihat jelas berbeda dari kondisi tanpa kemampuan; kemampuan bisa diaktifkan dan dimatikan, dengan indikator status di HUD.

**REQ-12 — Kostum Labu: menakuti hantu kecil**
Kostum Labu memberi kemampuan menakuti hantu kecil sehingga hantu kecil menjauh.
*Kriteria penerimaan:* saat kemampuan dipakai, hantu kecil dalam radius tertentu berbalik arah dan menjauh dari pemain minimal 5 meter; hantu kecil tidak menangkap pemain selama efek berlangsung; ada efek visual/suara saat kemampuan dipakai; kemampuan memiliki cooldown.

**REQ-13 — Kostum Penyihir: membuka pintu terkunci**
Kostum Penyihir memberi kemampuan membuka pintu terkunci di dalam mansion.
*Kriteria penerimaan:* ada minimal 2 pintu terkunci di dalam mansion yang hanya bisa dibuka dengan kostum Penyihir; berinteraksi dengan pintu terkunci memakai kostum lain menampilkan pesan "Terkunci — butuh kostum Penyihir"; berinteraksi memakai kostum Penyihir membuka pintu tersebut secara permanen untuk sesi itu.

**REQ-14 — Ganti kostum di lemari**
Pemain mengganti kostum di lemari yang ada di tiap ruangan.
*Kriteria penerimaan:* ada 1 lemari di tiap ruangan (total 5 lemari); berinteraksi dengan lemari membuka pilihan 4 kostum; memilih kostum langsung mengganti kostum aktif pemain; HUD menampilkan nama kostum yang sedang dipakai; kekuatan kostum sebelumnya langsung tidak berlaku setelah ganti.

**REQ-15 — Satu kekuatan aktif per kostum**
Setiap kostum hanya memberi satu kekuatan sesuai daftar di atas; tidak ada kostum yang memberi dua kekuatan sekaligus.
*Kriteria penerimaan:* memakai kostum Hantu tidak memberi penglihatan gelap; memakai kostum Vampir tidak bisa menembus dinding; memakai kostum Labu tidak bisa membuka pintu terkunci; memakai kostum Penyihir tidak menakuti hantu kecil.

---

## 3. Ruangan dan Konten

**REQ-16 — Lima ruangan**
Mansion terdiri dari tepat 5 ruangan: lobi, perpustakaan, dapur, basement, dan loteng.
*Kriteria penerimaan:* kelima ruangan bisa dimasuki pemain; nama ruangan tampil di HUD saat pemain berpindah ruangan; denah ruangan saling terhubung tanpa jalan buntu yang menjebak pemain (selalu ada jalan kembali ke lobi).

**REQ-17 — Lobi**
Lobi adalah ruangan awal dan lokasi pintu keluar; berisi 1 lilin, 1 lemari, dan pintu keluar.
*Kriteria penerimaan:* pemain memulai permainan di lobi; ada 1 lilin yang bisa diambil di lobi; ada 1 lemari di lobi; pintu keluar berada di lobi dan mengikuti REQ-04.

**REQ-18 — Perpustakaan**
Perpustakaan berisi rak-rak buku, 1 lilin, 1 lemari, dan 1 pintu terkunci.
*Kriteria penerimaan:* ada rak buku yang membentuk lorong dan tempat sembunyi; ada 1 lilin yang bisa diambil; ada 1 lemari; ada 1 pintu terkunci yang mengikuti REQ-13.

**REQ-19 — Dapur**
Dapur berisi meja, kompor, dan perabot dapur, 1 lilin, 1 lemari.
*Kriteria penerimaan:* ada meja dan kompor sebagai penghalang dan penanda ruangan; ada 1 lilin yang bisa diambil; ada 1 lemari.

**REQ-20 — Basement**
Basement adalah ruangan paling gelap, berisi 2 lilin, 1 lemari, dan 1 pintu terkunci.
*Kriteria penerimaan:* pencahayaan basement jelas lebih gelap dari ruangan lain; ada 2 lilin yang bisa diambil; ada 1 lemari; ada 1 pintu terkunci yang mengikuti REQ-13; kostum Vampir membuat ruangan ini bisa dijelajahi (lihat REQ-11).

**REQ-21 — Loteng**
Loteng berisi barang-barang tua dan sarang laba-laba, 1 lilin, 1 lemari.
*Kriteria penerimaan:* ada tumpukan barang tua dan sarang laba-laba sebagai penanda ruangan; ada 1 lilin yang bisa diambil; ada 1 lemari.

**REQ-22 — Total lilin tepat 6 dan tersebar**
Jumlah lilin di semua ruangan berjumlah tepat 6: lobi 1, perpustakaan 1, dapur 1, basement 2, loteng 1.
*Kriteria penerimaan:* hitungan lilin per ruangan sesuai daftar ini saat permainan dimulai; tidak ada lilin di luar kelima ruangan.

**REQ-23 — Dekorasi Halloween di tiap ruangan**
Tiap ruangan memiliki dekorasi Halloween (labu, lilin, sarang laba-laba, poster pesta) yang membedakannya dari ruangan lain.
*Kriteria penerimaan:* tiap ruangan memiliki minimal 3 jenis dekorasi yang berbeda dan terlihat dari jarak pandang pemain; dekorasi tidak menghalangi jalan utama pemain.

---

## 4. Hantu AI

**REQ-24 — Hantu patroli**
Ada hantu yang berpatroli di dalam mansion mengikuti rute tetap di tiap ruangan/koridor.
*Kriteria penerimaan:* minimal 3 hantu patroli aktif selama permainan; tiap hantu bergerak mengikuti rute yang bisa diamati (bergerak dari titik A ke titik B lalu kembali); hantu tidak diam di satu tempat.

**REQ-25 — Hantu kecil**
Selain hantu patroli, ada hantu kecil yang berkeliaran lebih bebas dan bisa ditakuti kostum Labu.
*Kriteria penerimaan:* ada minimal 4 hantu kecil; hantu kecil bergerak lebih cepat dan tidak mengikuti rute tetap; hantu kecil bereaksi terhadap kostum Labu sesuai REQ-12.

**REQ-26 — Hantu mengejar saat pemain terlihat**
Hantu patroli yang melihat pemain dalam jarak dan garis pandang tertentu akan mengejar pemain.
*Kriteria penerimaan:* saat pemain berada dalam jarak kejar dan terlihat (tidak terhalang dinding), hantu berubah dari mode patroli ke mode kejar (kecepatan bertambah, arah menuju pemain); saat pemain lolos dari pandangan/jarak selama beberapa detik, hantu kembali ke rute patrolinya. Masa tenggang: 5 detik pertama setelah mulai, hantu patroli tidak mengejar dan tidak bisa menangkap; tidak ada hantu patroli yang bisa melihat titik spawn pemain saat permainan dimulai.

**REQ-27 — Tertangkap hantu = kalah**
Jika hantu menyentuh pemain, permainan berakhir kalah.
*Kriteria penerimaan:* kontak hantu–pemain (jarak < 1 meter) memicu layar kalah dengan alasan "Tertangkap hantu"; permainan berhenti (timer dan hantu diam) saat layar kalah tampil.

**REQ-28 — Tanda peringatan hantu dekat**
Pemain mendapat peringatan saat hantu berada di dekatnya.
*Kriteria penerimaan:* ada indikator visual (misalnya layar bergetar/merah di tepi) dan/atau suara saat hantu dalam jarak dekat; peringatan muncul sebelum hantu sempat menangkap pemain, sehingga pemain punya kesempatan menghindar.

---

## 5. Kondisi Menang / Kalah

**REQ-29 — Menang: sampai pintu keluar dengan 6 lilin**
Pemain menang jika mencapai pintu keluar dan berinteraksi dengannya setelah mengumpulkan 6 lilin, sebelum timer habis.
*Kriteria penerimaan:* interaksi pintu keluar dengan 6 lilin sebelum 00:00 menampilkan layar menang; layar menang menampilkan sisa waktu.

**REQ-30 — Kalah: timer tengah malam habis**
Pemain kalah jika timer mencapai 00:00 sebelum mencapai pintu keluar dengan 6 lilin.
*Kriteria penerimaan:* saat timer mencapai 00:00, permainan berhenti dan layar kalah tampil dengan alasan "Tengah malam tiba".

**REQ-31 — Kalah: tertangkap hantu**
Pemain kalah jika tertangkap hantu (lihat REQ-27).
*Kriteria penerimaan:* layar kalah tampil dengan alasan "Tertangkap hantu", berbeda teksnya dari alasan timer habis.

---

## 6. Kontrol

**REQ-32 — Kontrol desktop: WASD + mouse**
Di desktop, pemain bergerak dengan WASD dan mengarahkan pandangan dengan mouse.
*Kriteria penerimaan:* W/S maju/mundur, A/D geser kiri/kanan, mouse menggerakkan arah pandang; tombol E (atau klik) sebagai tombol aksi interaksi; tombol 1–4 sebagai jalan pintas ganti kostum saat berada di dekat lemari (opsional, tidak menggantikan interaksi lemari).

**REQ-33 — Kontrol HP: joystick virtual + tombol aksi**
Di layar sentuh, pemain bergerak dengan joystick virtual di kiri bawah dan tombol aksi di kanan bawah.
*Kriteria penerimaan:* joystick virtual muncul otomatis di perangkat sentuh; menyeret joystick menggerakkan pemain ke arah seretan; tombol aksi besar di kanan bawah menjalankan interaksi (ambil/buka/ganti kostum); menggeser area layar di luar joystick memutar arah pandang.

**REQ-34 — Gerakan konsisten di semua perangkat**
Kecepatan jalan pemain sama di desktop dan HP, dan pemain tidak bisa menembus dinding atau keluar dari mansion tanpa kostum Hantu.
*Kriteria penerimaan:* kecepatan jalan terukur sama (±10%) di desktop dan HP; tabrakan dinding menahan pemain di semua ruangan; satu-satunya cara menembus dinding adalah kemampuan kostum Hantu (REQ-10).

---

## 7. Kualitas Visual

**REQ-35 — Kualitas hero, bukan kotak polos**
Semua aset 3D dibuat dengan geometri detail multi-part dan tekstur lukis, bukan kotak polos atau low-poly.
*Kriteria penerimaan:* tiap furnitur utama (lemari, meja, rak buku, pintu, lilin, labu) terdiri dari beberapa bagian geometri, bukan satu kotak; permukaan memakai tekstur lukis (bukan warna datar); tidak ada ruangan yang isinya hanya kotak berwarna.

**REQ-36 — Pencahayaan atmosferik Halloween**
Suasana mansion gelap dan menyeramkan: kabut, cahaya lilin yang berkedip, dan bayangan.
*Kriteria penerimaan:* kabut terlihat di koridor dan ruangan besar; tiap lilin yang menyala memberi cahaya titik yang berkedip; bayangan dari furnitur dan hantu terlihat di lantai/dinding; kecerahan keseluruhan cukup gelap untuk suasana horor tapi pemain masih bisa melihat jalan di ruangan biasa tanpa kostum Vampir.

**REQ-37 — Model hantu dan kostum terlihat jelas**
Hantu patroli, hantu kecil, dan kostum yang dipakai pemain terlihat berbeda satu sama lain.
*Kriteria penerimaan:* hantu patroli dan hantu kecil berbeda ukuran/bentuk/warna; tiap kostum memberi perubahan visual yang terlihat (misalnya warna efek di tepi layar atau penanda di HUD + perubahan tampilan tangan/efek); pemain bisa membedakan kostum yang sedang dipakai tanpa membuka menu.

---

## 8. Teknis

**REQ-38 — Three.js tanpa build step berat**
Game dibangun dengan Three.js lewat CDN/import map, tanpa bundler atau build step berat.
*Kriteria penerimaan:* `index.html` memuat Three.js dari CDN lewat import map; tidak ada langkah build (npm build, webpack, dsb.) yang wajib dijalankan sebelum game bisa dibuka; membuka `index.html` langsung di browser menampilkan menu utama.

**REQ-39 — Satu halaman web, modul JS terpisah**
Game berupa satu halaman web (`index.html`) dengan kode JavaScript yang dibagi ke modul-modul terpisah.
*Kriteria penerimaan:* ada `index.html` sebagai satu-satunya halaman; kode dibagi minimal ke modul scene, player, kostum, hantu, ruangan, HUD/timer, dan audio; tidak ada file HTML kedua yang wajib dibuka untuk bermain.

**REQ-40 — Berjalan di browser HP dan desktop**
Game bisa dimainkan di browser desktop modern (Chrome/Firefox) dan browser HP (Chrome Android / Safari iOS).
*Kriteria penerimaan:* game ke-load dan bisa dimainkan sampai menang/kalah di Chrome desktop dan di satu browser HP; tidak ada error JavaScript yang menghentikan permainan di console saat playtest.

**REQ-41 — Repo publik + folder /.kiro berisi spec ini**
Kode game berada di repo GitHub publik, dan file spec ini tersimpan di folder `/.kiro` di repo tersebut.
*Kriteria penerimaan:* repo GitHub bisa dibuka publik tanpa login; folder `/.kiro` di repo berisi `requirements.md`, `design.md`, dan `tasks.md` yang sama isinya dengan file spec ini.

**REQ-42 — Teks UI Bahasa Indonesia**
Semua teks yang dilihat pemain (menu, HUD, prompt, pesan, layar menang/kalah) berbahasa Indonesia.
*Kriteria penerimaan:* tidak ada teks Inggris di UI yang dilihat pemain (judul game "Rumah Hantu: Pesta Kostum" boleh tetap); diperiksa dengan membaca semua layar: menu, HUD, prompt interaksi, layar menang, layar kalah.

**REQ-43 — Audio sintetis WebAudio (tanpa file audio eksternal)**
Suara game (langkah, ambil lilin, hantu dekat, menang/kalah) dibuat sintetis dengan WebAudio, tanpa file audio eksternal.
*Kriteria penerimaan:* tidak ada file `.mp3`/`.wav`/`.ogg` di repo; suara langkah, ambil lilin, peringatan hantu, dan menang/kalah terdengar saat aksi terkait terjadi; ada tombol bisu (mute) di HUD.

---

## Ringkasan Jumlah

| Kelompok | Requirement |
|---|---|
| Gameplay inti | REQ-01 s.d. REQ-08 (8) |
| Sistem kostum | REQ-09 s.d. REQ-15 (7) |
| Ruangan dan konten | REQ-16 s.d. REQ-23 (8) |
| Hantu AI | REQ-24 s.d. REQ-28 (5) |
| Kondisi menang/kalah | REQ-29 s.d. REQ-31 (3) |
| Kontrol | REQ-32 s.d. REQ-34 (3) |
| Kualitas visual | REQ-35 s.d. REQ-37 (3) |
| Teknis | REQ-38 s.d. REQ-43 (6) |
| **Total** | **43 requirement** |
