# Rumah Hantu: Pesta Kostum

Game 3D first-person bertema rumah hantu, dibuat dengan Three.js untuk hackathon **Kiroween 2026** (kategori Costume Contest).

Pemain datang ke pesta kostum Halloween di sebuah mansion — pestanya sudah bubar, para tamu berubah jadi hantu. Kumpulkan **6 lilin** di 5 ruangan, hindari hantu patroli, dan keluar lewat pintu utama **sebelum tengah malam**.

## Mekanik Kostum

Ganti kostum di lemari tiap ruangan — tiap kostum punya satu kekuatan:

| Kostum | Kekuatan |
|---|---|
| 👻 Hantu | Tembus dinding 5 detik |
| 🧛 Vampir | Lihat dalam gelap (basement) |
| 🎃 Labu | Menakuti hantu kecil |
| 🧙 Penyihir | Membuka pintu terkunci |

## Ruangan

Lobi, Perpustakaan, Dapur, Basement (paling gelap, 2 lilin), Loteng — dihubungkan koridor dan tangga. 2 pintu terkunci (perpustakaan & basement) hanya bisa dibuka kostum Penyihir.

## Kontrol

- **Desktop:** WASD bergerak, mouse melihat (klik untuk kunci pointer), E interaksi, Q kemampuan, 1–4 ganti kostum di dekat lemari.
- **HP:** joystick virtual kiri, seret layar untuk melihat, tombol ✋ aksi, tombol ✨ kemampuan.

## Cara Menjalankan

Game ini aplikasi web statis — tidak butuh build step. Semua tekstur dibuat prosedural lewat canvas, semua suara sintetis WebAudio (tanpa file gambar/audio eksternal).

```bash
# Jalankan server statis apa saja, contoh:
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

## Struktur

- `index.html` — satu-satunya halaman (import map Three.js via CDN)
- `css/style.css` — HUD, menu, kontrol sentuh
- `js/` — modul: `main`, `game`, `scene`, `rooms`, `player`, `costumes`, `ghosts`, `candles`, `hud`, `controls`, `audio`, `textures`, `logic`
- `.kiro/` — spec Kiro (requirements, design, tasks)

## Lisensi

MIT
