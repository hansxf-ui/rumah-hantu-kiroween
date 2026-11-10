// textures.js — tekstur lukis prosedural lewat <canvas> (tanpa file gambar eksternal).
// Tiap tekstur punya variasi warna, serat, noda, dan goresan agar terlihat "dilukis".
import * as THREE from "three";

function buatKanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}

function acak(min, maks) { return min + Math.random() * (maks - min); }

function jadiTekstur(canvas, ulangX = 1, ulangY = 1) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(ulangX, ulangY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Kayu papan: dasar cokelat + serat garis + simpul + variasi per papan.
export function teksturKayu(dasar = "#6b4a26", gelap = "#4a2f16", terang = "#8a6136") {
  const [c, g] = buatKanvas(256, 256);
  g.fillStyle = dasar; g.fillRect(0, 0, 256, 256);
  const papan = 4, tinggi = 256 / papan;
  for (let p = 0; p < papan; p++) {
    const y0 = p * tinggi;
    g.fillStyle = Math.random() < 0.5 ? dasar : terang;
    g.globalAlpha = 0.55; g.fillRect(0, y0, 256, tinggi); g.globalAlpha = 1;
    // Serat kayu
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = Math.random() < 0.5 ? gelap : terang;
      g.globalAlpha = acak(0.12, 0.4);
      g.lineWidth = acak(0.6, 2.2);
      g.beginPath();
      const y = y0 + acak(3, tinggi - 3);
      g.moveTo(0, y);
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, y + Math.sin(x * 0.05 + p) * 2 + acak(-1.5, 1.5));
      g.stroke();
    }
    g.globalAlpha = 1;
    // Simpul kayu sesekali
    if (Math.random() < 0.6) {
      const kx = acak(30, 226), ky = y0 + tinggi / 2;
      g.strokeStyle = gelap; g.globalAlpha = 0.5;
      for (let r = 3; r < 11; r += 3) { g.beginPath(); g.ellipse(kx, ky, r * 1.6, r, 0, 0, Math.PI * 2); g.stroke(); }
      g.globalAlpha = 1;
    }
    // Garis antar papan
    g.fillStyle = "rgba(20,10,0,0.85)"; g.fillRect(0, y0, 256, 2);
  }
  // Noda & goresan
  for (let i = 0; i < 40; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.10)" : "rgba(255,220,160,0.06)";
    g.beginPath(); g.ellipse(acak(0, 256), acak(0, 256), acak(4, 26), acak(3, 12), acak(0, 3), 0, Math.PI * 2); g.fill();
  }
  return jadiTekstur(c);
}

// Wallpaper ungu tua berpola + noda lembap.
export function teksturWallpaper() {
  const [c, g] = buatKanvas(256, 256);
  g.fillStyle = "#3d2340"; g.fillRect(0, 0, 256, 256);
  // Pola damask sederhana: belah ketupat + titik
  g.strokeStyle = "rgba(190,140,220,0.28)"; g.lineWidth = 2;
  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const ox = (y / 64) % 2 ? 32 : 0;
      g.beginPath(); g.moveTo(x + ox, y + 8); g.lineTo(x + ox + 24, y + 32); g.lineTo(x + ox, y + 56); g.lineTo(x + ox - 24, y + 32); g.closePath(); g.stroke();
      g.fillStyle = "rgba(220,170,255,0.25)"; g.beginPath(); g.arc(x + ox, y + 32, 4, 0, Math.PI * 2); g.fill();
    }
  }
  // Noda lembap gelap di bawah
  for (let i = 0; i < 12; i++) {
    const grad = g.createRadialGradient(acak(0, 256), acak(150, 256), 2, acak(0, 256), acak(150, 256), acak(20, 60));
    grad.addColorStop(0, "rgba(10,5,15,0.35)"); grad.addColorStop(1, "rgba(10,5,15,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  }
  // Goresan
  for (let i = 0; i < 24; i++) {
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = acak(0.5, 1.5);
    const x = acak(0, 256), y = acak(0, 256);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + acak(-30, 30), y + acak(-30, 30)); g.stroke();
  }
  return jadiTekstur(c, 2, 1);
}

// Karpet merah berpola.
export function teksturKarpet() {
  const [c, g] = buatKanvas(256, 256);
  g.fillStyle = "#6e1420"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(255,200,90,0.55)"; g.lineWidth = 3;
  g.strokeRect(14, 14, 228, 228);
  g.strokeStyle = "rgba(255,200,90,0.3)"; g.lineWidth = 1.5;
  g.strokeRect(26, 26, 204, 204);
  // Motif tengah
  g.strokeStyle = "rgba(255,200,90,0.5)"; g.lineWidth = 2;
  g.beginPath(); g.arc(128, 128, 42, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(128, 128, 26, 0, Math.PI * 2); g.stroke();
  // Bintik kain (serat)
  for (let i = 0; i < 900; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,180,120,0.08)";
    g.fillRect(acak(0, 256), acak(0, 256), 2, 2);
  }
  return jadiTekstur(c);
}

// Batu basement: blok + lumut + retak.
export function teksturBatu() {
  const [c, g] = buatKanvas(256, 256);
  g.fillStyle = "#3a3a40"; g.fillRect(0, 0, 256, 256);
  const bh = 42, bw = 64;
  for (let y = 0; y < 256; y += bh) {
    const geser = (y / bh) % 2 ? bw / 2 : 0;
    for (let x = -bw; x < 256 + bw; x += bw) {
      const terang = acak(-14, 14);
      g.fillStyle = `rgb(${58 + terang},${58 + terang},${64 + terang})`;
      g.fillRect(x + geser + 2, y + 2, bw - 4, bh - 4);
      // Bercak per blok
      for (let i = 0; i < 8; i++) {
        g.fillStyle = "rgba(0,0,0,0.12)";
        g.beginPath(); g.ellipse(x + geser + acak(6, bw - 6), y + acak(6, bh - 6), acak(3, 10), acak(2, 6), 0, 0, Math.PI * 2); g.fill();
      }
    }
  }
  // Lumut hijau gelap di sela
  for (let i = 0; i < 26; i++) {
    g.fillStyle = "rgba(40,90,40,0.28)";
    g.beginPath(); g.ellipse(acak(0, 256), acak(0, 256), acak(6, 22), acak(4, 12), 0, 0, Math.PI * 2); g.fill();
  }
  return jadiTekstur(c, 2, 1);
}

// Kertas / sampul buku (untuk punggung buku & poster).
export function teksturKertas(warna = "#c8a86a") {
  const [c, g] = buatKanvas(128, 128);
  g.fillStyle = warna; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
    g.fillRect(acak(0, 128), acak(0, 128), acak(1, 4), acak(1, 3));
  }
  g.strokeStyle = "rgba(60,30,0,0.35)"; g.lineWidth = 2;
  g.strokeRect(4, 4, 120, 120);
  return jadiTekstur(c);
}

// Plester dinding kusam (loteng & langit-langit).
export function teksturPlester(dasar = "#5a4a52") {
  const [c, g] = buatKanvas(256, 256);
  g.fillStyle = dasar; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.10)" : "rgba(255,235,200,0.05)";
    g.beginPath(); g.ellipse(acak(0, 256), acak(0, 256), acak(2, 14), acak(2, 9), acak(0, 3), 0, Math.PI * 2); g.fill();
  }
  // Retak
  g.strokeStyle = "rgba(15,8,10,0.5)"; g.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    let x = acak(0, 256), y = acak(0, 200);
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += acak(-14, 14); y += acak(4, 18); g.lineTo(x, y); }
    g.stroke();
  }
  return jadiTekstur(c, 2, 1);
}

// Poster pesta Halloween (labu + teks).
export function teksturPoster() {
  const [c, g] = buatKanvas(256, 340);
  g.fillStyle = "#1a0a2e"; g.fillRect(0, 0, 256, 340);
  g.strokeStyle = "#ff9d00"; g.lineWidth = 6; g.strokeRect(8, 8, 240, 324);
  // Bulan
  g.fillStyle = "#ffe9a8"; g.beginPath(); g.arc(128, 86, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#1a0a2e"; g.beginPath(); g.arc(112, 78, 40, 0, Math.PI * 2); g.fill();
  // Labu
  g.fillStyle = "#ff7a00";
  g.beginPath(); g.ellipse(128, 210, 62, 48, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#e85d00";
  g.beginPath(); g.ellipse(100, 210, 22, 46, -0.15, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(156, 210, 22, 46, 0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#3a8a2a"; g.fillRect(122, 156, 12, 16);
  // Mata & mulut labu
  g.fillStyle = "#1a0a2e";
  g.beginPath(); g.moveTo(96, 196); g.lineTo(112, 210); g.lineTo(96, 222); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(160, 196); g.lineTo(144, 210); g.lineTo(160, 222); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(96, 236); g.lineTo(112, 230); g.lineTo(124, 240); g.lineTo(138, 230); g.lineTo(152, 238); g.lineTo(160, 232); g.lineTo(160, 244); g.lineTo(96, 246); g.closePath(); g.fill();
  // Teks
  g.fillStyle = "#ffb340"; g.font = "bold 30px sans-serif"; g.textAlign = "center";
  g.fillText("PESTA", 128, 296);
  g.fillStyle = "#d9a5ff"; g.font = "bold 22px sans-serif";
  g.fillText("KOSTUM", 128, 322);
  return jadiTekstur(c);
}

export function buatTekstur() {
  return {
    kayu: teksturKayu(),
    kayuGelap: teksturKayu("#4a2f16", "#2e1c0c", "#6b4a26"),
    kayuLantai: teksturKayu("#7a5230", "#54371c", "#9a6c40"),
    wallpaper: teksturWallpaper(),
    karpet: teksturKarpet(),
    batu: teksturBatu(),
    plester: teksturPlester(),
    plesterGelap: teksturPlester("#453640"),
    poster: teksturPoster(),
    kertas: teksturKertas(),
  };
}
