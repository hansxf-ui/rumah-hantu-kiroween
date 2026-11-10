# Rumah Hantu: Pesta Kostum

Game 3D first-person bertema rumah hantu, dibuat dengan Three.js untuk hackathon **Kiroween 2026**.

Pemain menjelajahi sebuah rumah hantu di malam Halloween: menyusuri lorong gelap berbekal senter, mengumpulkan permen dan item kostum, menghindari (atau mengakali) hantu penghuni rumah, dan menyelesaikan pesta kostum sebelum tengah malam.

## Fitur (rencana)

- Eksplorasi first-person di dalam rumah hantu 3D (Three.js, WebGL)
- Senter, kegelapan, dan efek suasana Halloween
- Koleksi permen & item kostum yang tersebar di rumah
- Hantu penghuni rumah dengan perilaku patroli
- Skor dan timer menuju tengah malam
- Kontrol keyboard + mouse, bisa dimainkan di browser desktop dan HP

## Cara Menjalankan

Game ini adalah aplikasi web statis — tidak butuh build step.

```bash
# 1. Masuk ke folder repo
cd rumah-hantu-kiroween

# 2. Jalankan server statis apa saja, contoh:
npx serve .
# atau:
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000` (atau port yang ditampilkan server) di browser.

## Teknologi

- [Three.js](https://threejs.org/) — rendering 3D
- JavaScript (ES Modules), HTML, CSS — tanpa framework build

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).
