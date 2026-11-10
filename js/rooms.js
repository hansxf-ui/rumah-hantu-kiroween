// rooms.js — denah mansion, 5 ruangan, tangga, furnitur hero, pintu, lemari.
// Denah (meter, x timur, z selatan, y ke atas):
//   Lobi x[-5,5] z[-4,4] y=0 | Perpustakaan x[-13,-5] z[-4,4] y=0
//   Dapur x[5,13] z[-4,4] y=0 | Basement x[-5,5] z[8,16] y=-3
//   Loteng x[-5,5] z[-4,4] y=3 (di atas lobi)
//   Tangga turun x[-1.2,1.2] z[4,8] y 0->-3 | Tangga naik x[1,4.4] z[-3.6,-2.4] y 0->3
import * as THREE from "three";
import { buatTekstur } from "./textures.js";

export const ROOMS = [
  { id: "lobi", nama: "Lobi", x0: -5, z0: -4, x1: 5, z1: 4, y: 0 },
  { id: "perpustakaan", nama: "Perpustakaan", x0: -13, z0: -4, x1: -5, z1: 4, y: 0 },
  { id: "dapur", nama: "Dapur", x0: 5, z0: -4, x1: 13, z1: 4, y: 0 },
  { id: "basement", nama: "Basement", x0: -5, z0: 8, x1: 5, z1: 16, y: -3 },
  { id: "loteng", nama: "Loteng", x0: -5, z0: -4, x1: 5, z1: 4, y: 3 },
];

const TEBAL_DINDING = 0.3;
const TINGGI_RUANG = 3;

// Tinggi lantai di (x,z). ySekarang = tinggi kaki pemain saat ini — dipakai untuk
// membedakan loteng (di atas lobi, y=3) dari lobi (y=0) yang footprint-nya sama.
export function floorHeightAt(x, z, ySekarang = 0) {
  if (x >= -1.2 && x <= 1.2 && z >= 4 && z <= 8) return -3 * ((z - 4) / 4); // tangga turun
  if (x >= 1 && x <= 4.4 && z >= -3.6 && z <= -2.4) return 3 * ((x - 1) / 3.4); // tangga naik
  if (ySekarang > 1.5 && x >= -5 && x <= 5 && z >= -4 && z <= 4) return 3; // loteng
  if (ySekarang < -1.5 && x >= -5 && x <= 5 && z >= 8 && z <= 16) return -3; // basement
  return 0;
}

// Nama ruangan dari posisi pemain (y = tinggi lantai kaki).
export function roomAt(x, z, y) {
  if (y < -1.5) return "basement";
  if (y > 1.5) return "loteng";
  if (x < -5) return "perpustakaan";
  if (x > 5) return "dapur";
  return "lobi";
}

export function namaRuangan(id) {
  const r = ROOMS.find((r) => r.id === id);
  return r ? r.nama : "Lobi";
}

export function buildWorld(scene) {
  const tex = buatTekstur();
  const colliders = []; // {x0,z0,x1,z1,y0,y1,active}
  const interactables = []; // {kind,id,x,z,floorY,prompt,interact}
  const doors = []; // animasi pintu
  const grup = new THREE.Group();
  scene.add(grup);

  // ---------- Material ----------
  const M = {
    lantaiKayu: new THREE.MeshLambertMaterial({ map: tex.kayuLantai }),
    dinding: new THREE.MeshLambertMaterial({ map: tex.wallpaper }),
    batu: new THREE.MeshLambertMaterial({ map: tex.batu }),
    plester: new THREE.MeshLambertMaterial({ map: tex.plester }),
    plesterGelap: new THREE.MeshLambertMaterial({ map: tex.plesterGelap }),
    kayu: new THREE.MeshLambertMaterial({ map: tex.kayu }),
    kayuGelap: new THREE.MeshLambertMaterial({ map: tex.kayuGelap }),
    karpet: new THREE.MeshLambertMaterial({ map: tex.karpet }),
    kertas: new THREE.MeshLambertMaterial({ map: tex.kertas }),
    poster: new THREE.MeshLambertMaterial({ map: tex.poster }),
    besi: new THREE.MeshLambertMaterial({ color: 0x2a2a30 }),
    kuningan: new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x442200 }),
    hitam: new THREE.MeshLambertMaterial({ color: 0x14101a }),
    merah: new THREE.MeshLambertMaterial({ color: 0x7a1620 }),
    putih: new THREE.MeshLambertMaterial({ color: 0xd8d0c0 }),
    oranye: new THREE.MeshLambertMaterial({ color: 0xff7a00, emissive: 0x903a00 }),
    kaca: new THREE.MeshLambertMaterial({ color: 0x2a3a4a, emissive: 0x0a1420 }),
    buku: [0xa83232, 0x2a5a8a, 0x2a7a3a, 0xc8a832, 0x6a3a8a, 0x8a4a2a].map(
      (c) => new THREE.MeshLambertMaterial({ color: c })),
  };

  function kotak(w, h, d, mat, x, y, z, bayangan = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = bayangan; m.receiveShadow = true;
    grup.add(m);
    return m;
  }
  function silinder(rt, rb, h, mat, x, y, z, seg = 12) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    grup.add(m);
    return m;
  }
  function bola(r, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    grup.add(m);
    return m;
  }
  // Dinding (mesh + collider). w = panjang sumbu x, d = panjang sumbu z.
  function dinding(cx, cz, w, d, y0, y1, mat) {
    const h = y1 - y0;
    kotak(w, h, d, mat, cx, y0 + h / 2, cz);
    colliders.push({ x0: cx - w / 2, z0: cz - d / 2, x1: cx + w / 2, z1: cz + d / 2, y0, y1, active: true });
  }
  function lantai(x0, z0, x1, z1, y, mat, ulang = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0),
      mat.clone());
    m.material.map = mat.map ? mat.map.clone() : null;
    if (m.material.map) { m.material.map.needsUpdate = true; m.material.map.repeat.set((x1 - x0) / 2 * ulang, (z1 - z0) / 2 * ulang); }
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    grup.add(m);
    return m;
  }
  function plafon(x0, z0, x1, z1, y, mat) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
    m.rotation.x = Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    grup.add(m);
    return m;
  }

  // ---------- Lantai & plafon ----------
  lantai(-5, -4, 5, 4, 0.01, M.lantaiKayu);
  lantai(-13, -4, -5, 4, 0.01, M.lantaiKayu);
  lantai(5, -4, 13, 4, 0.01, M.lantaiKayu);
  lantai(-5, 8, 5, 16, -2.99, M.batu);
  lantai(-5, -4, 5, 4, 3.01, M.kayuGelap); // lantai loteng
  // Plafon lobi (y=3) — berlubang di atas tangga naik x[1,4.4] z[-3.6,-2.4]
  plafon(-5, -4, 1, 4, 3, M.plesterGelap);
  plafon(1, -4, 4.4, -3.6, 3, M.plesterGelap);
  plafon(1, -2.4, 4.4, 4, 3, M.plesterGelap);
  plafon(4.4, -4, 5, 4, 3, M.plesterGelap);
  plafon(-13, -4, -5, 4, 3, M.plesterGelap); // plafon perpustakaan
  plafon(5, -4, 13, 4, 3, M.plesterGelap);   // plafon dapur
  plafon(-5, 8, 5, 16, 0, M.plesterGelap);   // plafon basement (= langit-langit basement)
  plafon(-5, -4, 5, 4, 6, M.plesterGelap);   // plafon loteng
  // Tangga: anak tangga + langit-langit miring tangga turun
  for (let i = 0; i < 8; i++) {
    const z = 4.25 + i * 0.5;
    kotak(2.4, 0.18, 0.5, M.kayuGelap, 0, -0.19 - i * 0.36, z);
  }
  for (let i = 0; i < 8; i++) {
    const x = 1.2 + i * 0.42;
    kotak(0.42, 0.18, 1.2, M.kayuGelap, x, 0.19 + i * 0.36, -3);
  }
  // Langit-langit miring di atas tangga turun
  const miring = kotak(2.6, 0.12, 5.2, M.plesterGelap, 0, -1.1, 6, false);
  miring.rotation.x = Math.atan2(3, 4);
  // Karpet merah lobi
  const karpet = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6), M.karpet);
  karpet.rotation.x = -Math.PI / 2; karpet.position.set(0, 0.03, 0); karpet.receiveShadow = true;
  grup.add(karpet);

  // ---------- Dinding ----------
  // Lobi utara (z=-4), celah pintu keluar x[-0.9,0.9]
  dinding(-2.95, -4, 4.1, TEBAL_DINDING, 0, 3, M.dinding);
  dinding(2.95, -4, 4.1, TEBAL_DINDING, 0, 3, M.dinding);
  dinding(-5, -2.45, TEBAL_DINDING, 3.1, 0, 3, M.dinding);
  dinding(-5, 2.45, TEBAL_DINDING, 3.1, 0, 3, M.dinding);
  // Lobi timur (x=5), celah pintu dapur z[-0.9,0.9]
  dinding(5, -2.45, TEBAL_DINDING, 3.1, 0, 3, M.dinding);
  dinding(5, 2.45, TEBAL_DINDING, 3.1, 0, 3, M.dinding);
  // Lobi selatan (z=4), celah tangga turun x[-1.2,1.2]
  dinding(-3.1, 4, 3.8, TEBAL_DINDING, 0, 3, M.dinding);
  dinding(3.1, 4, 3.8, TEBAL_DINDING, 0, 3, M.dinding);
  // Perpustakaan luar
  dinding(-13, 0, TEBAL_DINDING, 8, 0, 3, M.dinding);
  dinding(-9, -4, 8, TEBAL_DINDING, 0, 3, M.dinding);
  dinding(-9, 4, 8, TEBAL_DINDING, 0, 3, M.dinding);
  // Dapur luar
  dinding(13, 0, TEBAL_DINDING, 8, 0, 3, M.dinding);
  dinding(9, -4, 8, TEBAL_DINDING, 0, 3, M.dinding);
  dinding(9, 4, 8, TEBAL_DINDING, 0, 3, M.dinding);
  // Rel tangga turun (x=±1.2, z 4..8, y -3..0.3)
  dinding(-1.2, 6, TEBAL_DINDING, 4, -3, 0.3, M.kayuGelap);
  dinding(1.2, 6, TEBAL_DINDING, 4, -3, 0.3, M.kayuGelap);
  // Rel tangga naik (z=-3.6 & -2.4, x 1..4.4, y 0..3.2)
  dinding(2.7, -3.6, 3.4, TEBAL_DINDING, 0, 3.2, M.kayuGelap);
  dinding(2.7, -2.4, 3.4, TEBAL_DINDING, 0, 3.2, M.kayuGelap);
  // Basement (y -3..0)
  dinding(-5, 12, TEBAL_DINDING, 8, -3, 0, M.batu);
  dinding(5, 12, TEBAL_DINDING, 8, -3, 0, M.batu);
  dinding(0, 16, 10, TEBAL_DINDING, -3, 0, M.batu);
  dinding(-3.1, 8, 3.8, TEBAL_DINDING, -3, 0, M.batu);
  dinding(3.1, 8, 3.8, TEBAL_DINDING, -3, 0, M.batu);
  // Loteng (y 3..6)
  dinding(-5, 0, TEBAL_DINDING, 8, 3, 6, M.plester);
  dinding(5, 0, TEBAL_DINDING, 8, 3, 6, M.plester);
  dinding(0, -4, 10, TEBAL_DINDING, 3, 6, M.plester);
  dinding(0, 4, 10, TEBAL_DINDING, 3, 6, M.plester);

  // ---------- Pintu ----------
  function buatPintu({ x, z, rotY, lebar = 1.8, tinggi = 2.6, y0 = 0, mat = M.kayuGelap, ganda = false }) {
    const engsel = new THREE.Group();
    engsel.position.set(x, y0, z);
    engsel.rotation.y = rotY;
    grup.add(engsel);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(lebar / (ganda ? 2 : 1), tinggi, 0.08), mat);
    panel.position.set(ganda ? lebar / 4 : lebar / 2, tinggi / 2, 0);
    panel.castShadow = true;
    engsel.add(panel);
    // Bingkai + gagang
    const bingkaiAtas = new THREE.Mesh(new THREE.BoxGeometry(lebar + 0.3, 0.18, 0.22), M.kayu);
    bingkaiAtas.position.set(lebar / 2, tinggi + 0.09, 0); engsel.add(bingkaiAtas);
    const gagang = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.kuningan);
    gagang.position.set(ganda ? lebar / 2 - 0.12 : lebar - 0.15, 1.05, 0.09); engsel.add(gagang);
    // Panel dekorasi pintu (relief)
    for (const [px, py] of [[0.25, 0.7], [0.25, 1.7]]) {
      const relief = new THREE.Mesh(new THREE.BoxGeometry(lebar / (ganda ? 2 : 1) - 0.3, 0.7, 0.03), M.kayu);
      relief.position.set(ganda ? lebar / 4 : lebar / 2, py, 0.05); engsel.add(relief);
    }
    const pintu = { grup: engsel, sudut: 0, target: 0, collider: null, ganda, kembar: null };
    if (ganda) {
      const engsel2 = new THREE.Group();
      engsel2.position.set(x + lebar, y0, z); engsel2.rotation.y = rotY + Math.PI;
      grup.add(engsel2);
      const panel2 = new THREE.Mesh(new THREE.BoxGeometry(lebar / 2, tinggi, 0.08), mat);
      panel2.position.set(lebar / 4, tinggi / 2, 0); panel2.castShadow = true;
      engsel2.add(panel2);
      const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), M.kuningan);
      g2.position.set(lebar / 2 - 0.12, 1.05, 0.09); engsel2.add(g2);
      const kembar = { grup: engsel2, sudut: 0, target: 0, collider: null };
      pintu.kembar = kembar;
      doors.push(kembar);
    }
    doors.push(pintu);
    return pintu;
  }
  function colliderPintu(x0, z0, x1, z1, y0, y1) {
    const c = { x0, z0, x1, z1, y0, y1, active: true };
    colliders.push(c);
    return c;
  }

  // Pintu keluar (lobi utara, ganda) — terkunci sampai 6 lilin.
  const pintuKeluar = buatPintu({ x: -0.9, z: -4, rotY: 0, ganda: true });
  pintuKeluar.collider = colliderPintu(-0.9, -4.15, 0.9, -3.85, 0, 2.6);
  interactables.push({
    kind: "exit", id: "pintu-keluar", x: 0, z: -3.2, floorY: 0,
    prompt: () => "Buka Pintu Keluar",
    interact: (ctx) => {
      if (ctx.candles.count() >= 6) { ctx.game.menang(); }
      else {
        ctx.hud.pesan("Terkunci — butuh 6 lilin untuk membuka pintu ini");
        ctx.audio.terkunci();
      }
    },
  });

  // Pintu perpustakaan (terkunci — butuh Penyihir).
  const pintuPerpus = buatPintu({ x: -5, z: -0.9, rotY: -Math.PI / 2 });
  pintuPerpus.collider = colliderPintu(-5.15, -0.9, -4.85, 0.9, 0, 2.6);
  const gembok1 = kotak(0.22, 0.3, 0.12, M.kuningan, -4.82, 1.15, 0.75, true);
  gembok1.rotation.y = Math.PI / 2;
  interactables.push({
    kind: "locked", id: "pintu-perpustakaan", x: -4.2, z: 0, floorY: 0, terkunci: true, pintu: pintuPerpus, gembok: gembok1,
    prompt: () => "Pintu Perpustakaan (Terkunci)",
    interact: (ctx) => {
      const it = ctx.world.interactables.find((i) => i.id === "pintu-perpustakaan");
      if (!it.terkunci) { ctx.game.bukaPintuBiasa(pintuPerpus); return; }
      if (ctx.costumes.current() === "penyihir") {
        it.terkunci = false; it.gembok.visible = false;
        ctx.game.bukaPintuBiasa(pintuPerpus);
        ctx.hud.pesan("Pintu perpustakaan terbuka!");
        ctx.audio.pintu();
      } else {
        ctx.hud.pesan("Terkunci — butuh kostum Penyihir");
        ctx.audio.terkunci();
      }
    },
  });

  // Pintu dapur (biasa, bisa buka-tutup).
  const pintuDapur = buatPintu({ x: 5, z: -0.9, rotY: -Math.PI / 2 });
  pintuDapur.collider = colliderPintu(4.85, -0.9, 5.15, 0.9, 0, 2.6);
  interactables.push({
    kind: "door", id: "pintu-dapur", x: 4.2, z: 0, floorY: 0,
    prompt: () => (pintuDapur.target === 0 ? "Buka Pintu Dapur" : "Tutup Pintu Dapur"),
    interact: (ctx) => { ctx.game.bukaPintuBiasa(pintuDapur); ctx.audio.pintu(); },
  });

  // Pintu basement (terkunci — butuh Penyihir), di ujung atas tangga turun.
  const pintuBasement = buatPintu({ x: -1.2, z: 4, rotY: 0, lebar: 2.4 });
  pintuBasement.collider = colliderPintu(-1.2, 3.85, 1.2, 4.15, 0, 2.6);
  const gembok2 = kotak(0.22, 0.3, 0.12, M.kuningan, 1.0, 1.15, 4.18, true);
  interactables.push({
    kind: "locked", id: "pintu-basement", x: 0, z: 3.2, floorY: 0, terkunci: true, pintu: pintuBasement, gembok: gembok2,
    prompt: () => "Pintu Basement (Terkunci)",
    interact: (ctx) => {
      const it = ctx.world.interactables.find((i) => i.id === "pintu-basement");
      if (!it.terkunci) { ctx.game.bukaPintuBiasa(pintuBasement); return; }
      if (ctx.costumes.current() === "penyihir") {
        it.terkunci = false; it.gembok.visible = false;
        ctx.game.bukaPintuBiasa(pintuBasement);
        ctx.hud.pesan("Pintu basement terbuka!");
        ctx.audio.pintu();
      } else {
        ctx.hud.pesan("Terkunci — butuh kostum Penyihir");
        ctx.audio.terkunci();
      }
    },
  });

  // ---------- Lemari kostum (1 per ruangan) ----------
  function buatLemari(x, z, rotY, y0 = 0) {
    const g = new THREE.Group();
    g.position.set(x, y0, z); g.rotation.y = rotY;
    grup.add(g);
    const badan = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, 0.65), M.kayu);
    badan.position.y = 1.15; badan.castShadow = true; badan.receiveShadow = true; g.add(badan);
    const atas = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.75), M.kayuGelap);
    atas.position.y = 2.36; atas.castShadow = true; g.add(atas);
    for (const sx of [-0.42, 0.42]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.78, 2.0, 0.06), M.kayuGelap);
      p.position.set(sx, 1.12, 0.35); p.castShadow = true; g.add(p);
      const gag = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), M.kuningan);
      gag.position.set(sx + (sx < 0 ? 0.3 : -0.3), 1.12, 0.4); g.add(gag);
    }
    // Gantungan baju warna-warni di dalam (terlihat dari celah)
    const warna = [0xa83232, 0x2a5a8a, 0x2a7a3a, 0x6a3a8a];
    warna.forEach((w, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.04),
        new THREE.MeshLambertMaterial({ color: w }));
      b.position.set(-0.6 + i * 0.4, 1.7, 0.1); g.add(b);
    });
    colliders.push({ x0: x - 0.95, z0: z - 0.95, x1: x + 0.95, z1: z + 0.95, y0, y1: y0 + 2.4, active: true });
    interactables.push({
      kind: "wardrobe", id: "lemari-" + x + "-" + z, x, z, floorY: y0,
      prompt: () => "Ganti Kostum",
      interact: (ctx) => ctx.hud.bukaPanelKostum(),
    });
    return g;
  }
  buatLemari(4.3, 2.8, -Math.PI / 2, 0);       // lobi (sudut tenggara — jauh dari tangga naik)
  buatLemari(-6.2, 3.2, 0, 0);                  // perpustakaan
  buatLemari(12.3, 3.2, -Math.PI / 2, 0);       // dapur
  buatLemari(4.3, 15.2, Math.PI, -3);           // basement
  buatLemari(-4.3, 3.2, 0, 3);                  // loteng

  // ---------- Furnitur hero ----------
  function tambahCollider(x, z, w, d, y0, y1) {
    colliders.push({ x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2, y0, y1, active: true });
  }
  // --- Lobi ---
  // Meja resepsionis (barat laut)
  kotak(2.0, 1.0, 0.9, M.kayuGelap, -3.6, 0.5, -3);
  kotak(2.2, 0.1, 1.1, M.kayu, -3.6, 1.05, -3);
  kotak(0.12, 0.5, 0.12, M.kuningan, -3.6, 1.3, -3); // bel kecil
  bola(0.09, M.kuningan, -3.6, 1.62, -3);
  tambahCollider(-3.6, -3, 2.2, 1.1, 0, 1.1);
  // Lampu gantung lobi (rantai + kap + bola pijar)
  silinder(0.03, 0.03, 0.9, M.besi, 0, 2.55, 0, 6);
  const kap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 12, 1, true), M.kuningan);
  kap.position.set(0, 2.05, 0); grup.add(kap);
  bola(0.16, new THREE.MeshLambertMaterial({ color: 0xffe9a8, emissive: 0xffc860 }), 0, 1.9, 0);
  // Meja kecil + lilin lobi (posisi lilin: -4.2, 3.2)
  silinder(0.05, 0.05, 0.7, M.kayuGelap, -4.2, 0.35, 3.2, 8);
  silinder(0.45, 0.35, 0.06, M.kayu, -4.2, 0.73, 3.2, 12);
  // Jendela lobi (dinding utara, kaca + bingkai + gorden)
  kotak(1.6, 1.4, 0.06, M.kaca, -3, 1.7, -3.86);
  kotak(1.8, 0.1, 0.1, M.kayu, -3, 2.45, -3.84);
  kotak(1.8, 0.1, 0.1, M.kayu, -3, 0.95, -3.84);
  kotak(0.28, 1.5, 0.12, M.merah, -3.95, 1.7, -3.8);
  kotak(0.28, 1.5, 0.12, M.merah, -2.05, 1.7, -3.8);
  kotak(1.6, 1.4, 0.06, M.kaca, 3, 1.7, -3.86);
  kotak(1.8, 0.1, 0.1, M.kayu, 3, 2.45, -3.84);
  kotak(1.8, 0.1, 0.1, M.kayu, 3, 0.95, -3.84);
  // Poster pesta di dinding timur lobi
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.45), M.poster);
  poster.position.set(4.84, 1.7, 1.5); poster.rotation.y = -Math.PI / 2; grup.add(poster);

  // --- Perpustakaan ---
  function rakBuku(x, z, rotY, lebar = 4) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; grup.add(g);
    const rangka = new THREE.Mesh(new THREE.BoxGeometry(lebar, 2.4, 0.5), M.kayuGelap);
    rangka.position.y = 1.2; rangka.castShadow = true; rangka.receiveShadow = true; g.add(rangka);
    for (let s = 0; s < 3; s++) {
      const rak = new THREE.Mesh(new THREE.BoxGeometry(lebar - 0.2, 0.06, 0.44), M.kayu);
      rak.position.set(0, 0.55 + s * 0.7, 0); g.add(rak);
      for (let i = 0; i < Math.floor(lebar * 2.2); i++) {
        const buku = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5 + Math.random() * 0.12, 0.3),
          M.buku[i % M.buku.length]);
        buku.position.set(-lebar / 2 + 0.25 + i * 0.42, 0.85 + s * 0.7, 0);
        buku.rotation.z = Math.random() < 0.12 ? 0.16 : 0;
        g.add(buku);
      }
    }
    return g;
  }
  rakBuku(-9.5, -3.6, 0, 5);       // rak utara
  rakBuku(-9, 0.8, Math.PI / 2, 3.4); // rak tengah (membentuk lorong)
  rakBuku(-10, 3.6, 0, 4);         // rak selatan
  tambahCollider(-9.5, -3.6, 5, 0.6, 0, 2.4);
  tambahCollider(-9, 0.8, 0.6, 3.4, 0, 2.4);
  tambahCollider(-10, 3.6, 4, 0.6, 0, 2.4);
  // Meja baca + lampu meja (posisi lilin perpustakaan: -9, -1.5)
  kotak(1.8, 0.08, 1.0, M.kayu, -9, 0.78, -1.5);
  for (const [dx, dz] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]])
    kotak(0.09, 0.78, 0.09, M.kayuGelap, -9 + dx, 0.39, -1.5 + dz);
  silinder(0.04, 0.06, 0.35, M.kuningan, -9.6, 1.0, -1.8, 8);
  bola(0.12, new THREE.MeshLambertMaterial({ color: 0xffe9a8, emissive: 0xffc860 }), -9.6, 1.25, -1.8);
  tambahCollider(-9, -1.5, 1.8, 1.0, 0, 0.85);
  // Tumpukan buku di lantai
  for (let i = 0; i < 4; i++)
    kotak(0.4, 0.09, 0.3, M.buku[i % M.buku.length], -6.5 + (i % 2) * 0.5, 0.05 + Math.floor(i / 2) * 0.1, 2.5);

  // --- Dapur ---
  kotak(2.4, 0.1, 1.2, M.kayu, 9, 0.85, 0); // meja dapur
  for (const [dx, dz] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]])
    kotak(0.1, 0.85, 0.1, M.kayuGelap, 9 + dx, 0.42, dz);
  tambahCollider(9, 0, 2.4, 1.2, 0, 0.9);
  // Kompor (utara): badan + 4 tungku + kenop + oven
  kotak(1.8, 0.9, 0.7, M.besi, 8, 0.45, -3.55);
  for (const [dx, dz] of [[-0.45, -0.15], [0.45, -0.15], [-0.45, 0.15], [0.45, 0.15]])
    silinder(0.16, 0.16, 0.04, M.hitam, 8 + dx, 0.92, -3.55 + dz, 12);
  kotak(1.6, 0.5, 0.05, M.kaca, 8, 0.35, -3.18);
  for (let i = 0; i < 3; i++) silinder(0.04, 0.04, 0.05, M.kuningan, 7.5 + i * 0.4, 0.72, -3.18, 8);
  tambahCollider(8, -3.55, 1.8, 0.7, 0, 0.95);
  // Rak piring (timur)
  kotak(0.5, 2.0, 2.2, M.kayuGelap, 12.6, 1.0, -1);
  for (let s = 0; s < 3; s++)
    for (let i = 0; i < 4; i++) {
      const piring = silinder(0.14, 0.14, 0.02, M.putih, 12.45, 0.5 + s * 0.6, -1.8 + i * 0.5, 12);
      piring.rotation.x = Math.PI / 2;
    }
  tambahCollider(12.6, -1, 0.5, 2.2, 0, 2.0);
  // Lemari dapur (selatan)
  kotak(2.6, 0.9, 0.6, M.kayuGelap, 7, 0.45, 3.6);
  kotak(2.6, 0.08, 0.7, M.kayu, 7, 0.94, 3.6);
  tambahCollider(7, 3.6, 2.6, 0.7, 0, 1.0);
  // Labu di atas meja dapur + panci
  silinder(0.2, 0.16, 0.3, M.besi, 9.8, 1.05, 0.3, 12);

  // --- Basement ---
  function peti(x, z, y0, s = 1) {
    kotak(0.9 * s, 0.7 * s, 0.9 * s, M.kayu, x, y0 + 0.35 * s, z);
    kotak(0.94 * s, 0.1 * s, 0.94 * s, M.kayuGelap, x, y0 + 0.68 * s, z);
    tambahCollider(x, z, 0.95 * s, 0.95 * s, y0, y0 + 0.75 * s);
  }
  peti(-3.5, 10, -3); peti(-3.5, 10, -2.3, 0.8); peti(3, 14.5, -3, 1.2); peti(-4, 15, -3, 0.9);
  // Tong (barrel)
  function tong(x, z) {
    silinder(0.42, 0.38, 1.0, M.kayu, x, -2.5, z, 14);
    silinder(0.44, 0.44, 0.06, M.besi, x, -2.2, z, 14);
    silinder(0.44, 0.44, 0.06, M.besi, x, -2.8, z, 14);
    tambahCollider(x, z, 0.9, 0.9, -3, -2);
  }
  tong(3.5, 12); tong(-3.5, 13.5); tong(4, 9);
  // Pipa di dinding basement
  const pipa = silinder(0.09, 0.09, 7.5, M.besi, -4.8, -0.6, 12, 10);
  pipa.rotation.x = Math.PI / 2;
  const pipa2 = silinder(0.07, 0.07, 7.5, M.besi, 4.8, -0.9, 12, 10);
  pipa2.rotation.x = Math.PI / 2;
  // Meja kerja
  kotak(2.0, 0.1, 0.9, M.kayuGelap, -3, -2.1, 10);
  for (const [dx, dz] of [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]])
    kotak(0.09, 0.85, 0.09, M.kayuGelap, -3 + dx, -2.55, 10 + dz);
  tambahCollider(-3, 10, 2.0, 0.9, -3, -2.05);

  // --- Loteng ---
  peti(-3, -2, 3); peti(-3, -2, 3.7, 0.85); peti(2.5, 2, 3, 1.1); peti(3.5, 3.0, 3, 0.8); // peti terakhir JANGAN di atas tangga naik
  // Kursi tua (miring)
  const kursi = new THREE.Group(); kursi.position.set(0, 3, -2); kursi.rotation.y = 0.6; grup.add(kursi);
  const dudukan = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.55), M.kayuGelap);
  dudukan.position.y = 0.45; dudukan.castShadow = true; kursi.add(dudukan);
  const sandaran = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.07), M.kayuGelap);
  sandaran.position.set(0, 0.85, -0.26); sandaran.rotation.x = -0.25; kursi.add(sandaran);
  for (const [dx, dz] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) {
    const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), M.kayuGelap);
    kaki.position.set(dx, 0.22, dz); kursi.add(kaki);
  }
  tambahCollider(0, -2, 0.7, 0.7, 3, 3.9);
  // Cermin retak (dinding selatan loteng)
  kotak(1.0, 1.5, 0.08, M.kayu, 0, 4.0, 3.9);
  const cermin = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.3),
    new THREE.MeshLambertMaterial({ color: 0x4a5a6a, emissive: 0x0a1218 }));
  cermin.position.set(0, 4.0, 3.85); cermin.rotation.y = Math.PI; grup.add(cermin);
  // Peti kecil tempat lilin loteng (2, -1)
  peti(2, -1, 3, 0.8);

  // ---------- Dekorasi Halloween ----------
  function labu(x, z, y0, s = 1) {
    const g = new THREE.Group(); g.position.set(x, y0, z); grup.add(g);
    const badan = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 12, 10), M.oranye);
    badan.scale.y = 0.85; badan.position.y = 0.28 * s; badan.castShadow = true; g.add(badan);
    const tangkai = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.14 * s, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a6a2a }));
    tangkai.position.y = 0.56 * s; g.add(tangkai);
    // Mata & mulut menyala
    const nyala = new THREE.MeshLambertMaterial({ color: 0xffe9a8, emissive: 0xffb300 });
    for (const sx of [-0.12, 0.12]) {
      const mata = new THREE.Mesh(new THREE.ConeGeometry(0.05 * s, 0.09 * s, 4), nyala);
      mata.position.set(sx * s, 0.34 * s, 0.27 * s); mata.rotation.x = Math.PI / 2; g.add(mata);
    }
    const mulut = new THREE.Mesh(new THREE.BoxGeometry(0.2 * s, 0.04 * s, 0.02), nyala);
    mulut.position.set(0, 0.18 * s, 0.29 * s); g.add(mulut);
    return g;
  }
  labu(4.2, -3.4, 0); labu(-4.5, 3.5, 0, 0.8); labu(9.8, 0.3, 0.9, 0.7); labu(-11.5, -3.4, 0, 0.9);
  labu(3.8, 14.8, -3, 0.9); labu(-2, 2.8, 3, 0.85);
  // Sarang laba-laba (sudut): kerucut garis + lingkaran
  function sarang(x, y, z, rotY) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; grup.add(g);
    const mat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.55 });
    for (let i = 0; i < 5; i++) {
      const garis = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.1, 4), mat);
      garis.rotation.z = Math.PI / 2 - (i * Math.PI) / 10;
      garis.position.set(0.35, -0.35, 0);
      garis.rotation.y = 0;
      g.add(garis);
    }
    for (let r = 0.25; r < 1; r += 0.25) {
      const cincin = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 4, 20, Math.PI / 2), mat);
      cincin.position.set(0, 0, 0); cincin.rotation.z = Math.PI;
      g.add(cincin);
    }
  }
  sarang(-4.8, 2.8, -3.8, 0); sarang(-12.8, 2.8, 3.8, Math.PI / 2); sarang(12.8, 2.8, 3.8, -Math.PI / 2);
  sarang(-4.8, -0.2, 15.8, 0); sarang(4.8, 5.8, -3.8, 0); sarang(-4.8, 5.8, 3.8, Math.PI / 2);
  // Poster di perpustakaan & dapur
  const poster2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), M.poster);
  poster2.position.set(-5.16, 1.7, 2.5); poster2.rotation.y = -Math.PI / 2; grup.add(poster2);
  const poster3 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), M.poster);
  poster3.position.set(12.84, 1.7, 2.5); poster3.rotation.y = -Math.PI / 2; grup.add(poster3);

  // ---------- Lampu tiap ruangan (suasana) ----------
  function lampuRuang(x, y, z, warna, intensitas, jarak) {
    const l = new THREE.PointLight(warna, intensitas, jarak, 1.8);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  }
  lampuRuang(-9, 2.4, 0, 0xffc890, 10, 10);   // perpustakaan hangat redup
  lampuRuang(9, 2.4, 0, 0xffd9a0, 12, 11);    // dapur hangat
  lampuRuang(0, -0.6, 12, 0x9ab8ff, 5, 9);    // basement dingin sangat redup
  lampuRuang(0, 5.4, 0, 0xffb060, 8, 10);     // loteng redup

  // ---------- Update (animasi pintu) ----------
  function update(dt) {
    for (const d of doors) {
      const target = d.target;
      if (Math.abs(d.sudut - target) > 0.001) {
        d.sudut += (target - d.sudut) * Math.min(1, dt * 6);
        d.grup.rotation.y = (d.grup.userData.rotAwal ?? 0) + d.sudut;
      }
      if (d.collider) d.collider.active = Math.abs(d.sudut) < 0.25;
    }
  }
  // Simpan rotasi awal tiap pintu untuk animasi
  for (const d of doors) d.grup.userData.rotAwal = d.grup.rotation.y;

  function bukaPintu(pintu) {
    const buka = pintu.target === 0;
    pintu.target = buka ? -1.9 : 0;
    if (pintu.ganda && pintu.kembar) pintu.kembar.target = buka ? -1.9 : 0;
  }

  function reset() {
    for (const d of doors) { d.target = 0; d.sudut = 0; d.grup.rotation.y = d.grup.userData.rotAwal; if (d.collider) d.collider.active = true; }
    for (const it of interactables) if (it.kind === "locked") { it.terkunci = true; if (it.gembok) it.gembok.visible = true; }
  }

  return {
    colliders, interactables, doors,
    floorHeightAt, roomAt, namaRuangan,
    bukaPintu, reset, update,
  };
}
