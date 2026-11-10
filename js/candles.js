// candles.js — 6 lilin: posisi tetap, model multi-part, cahaya berkedip, pengambilan.
import * as THREE from "three";

// Posisi lilin (x, z, yLantai, ruangan): lobi 1, perpustakaan 1, dapur 1, basement 2, loteng 1.
export const POSISI_LILIN = [
  { x: -4.2, z: 3.2, y: 0.76, ruang: "lobi" },          // di atas meja kecil lobi
  { x: -9, z: -1.5, y: 0.9, ruang: "perpustakaan" },    // di atas meja baca
  { x: 9, z: 0, y: 0.9, ruang: "dapur" },               // di atas meja dapur
  { x: -4, z: 15, y: -2.3, ruang: "basement" },         // di atas peti basement
  { x: 4, z: 9, y: -2.0, ruang: "basement" },           // di atas tong basement
  { x: 2, z: -1, y: 3.7, ruang: "loteng" },             // di atas peti loteng
];

export function createCandles(scene) {
  const lilin = [];
  const grup = new THREE.Group();
  scene.add(grup);
  const matLilin = new THREE.MeshLambertMaterial({ color: 0xf5ead0, emissive: 0x332200 });
  const matApi = new THREE.MeshBasicMaterial({ color: 0xffc860 });
  const matApiDalam = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });

  for (const p of POSISI_LILIN) {
    const g = new THREE.Group();
    g.position.set(p.x, p.y, p.z);
    // Badan lilin + lelehan lilin + piring kecil
    const badan = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.28, 10), matLilin);
    badan.position.y = 0.14; badan.castShadow = true; g.add(badan);
    const leleh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), matLilin);
    leleh.scale.y = 0.5; leleh.position.y = 0.28; g.add(leleh);
    const piring = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.02, 12),
      new THREE.MeshLambertMaterial({ color: 0xc9a227, emissive: 0x221100 }));
    piring.position.y = 0.01; g.add(piring);
    // Api: kerucut luar + inti terang
    const api = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), matApi);
    api.position.y = 0.36; g.add(api);
    const inti = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), matApiDalam);
    inti.position.y = 0.34; g.add(inti);
    // Cahaya titik berkedip
    const cahaya = new THREE.PointLight(0xffa040, 5, 5, 1.8);
    cahaya.position.y = 0.4;
    g.add(cahaya);
    grup.add(g);
    lilin.push({ ...p, grup: g, api, inti, cahaya, diambil: false, fase: Math.random() * 10 });
  }

  function update(dt, t) {
    for (const l of lilin) {
      if (l.diambil) continue;
      // Kedip api: skala + intensitas cahaya berfluktuasi halus
      const kedip = 0.85 + Math.sin(t * 9 + l.fase) * 0.12 + Math.sin(t * 23 + l.fase * 2) * 0.06;
      l.api.scale.set(kedip, 0.9 + Math.sin(t * 12 + l.fase) * 0.15, kedip);
      l.cahaya.intensity = 5 * kedip;
    }
  }

  // Lilin terdekat dari posisi pemain (jarak 2D) yang belum diambil.
  function terdekat(px, pz, jarakMaks = 2) {
    let terbaik = null, dTerbaik = jarakMaks;
    for (const l of lilin) {
      if (l.diambil) continue;
      const d = Math.hypot(l.x - px, l.z - pz);
      if (d < dTerbaik) { dTerbaik = d; terbaik = l; }
    }
    return terbaik;
  }

  function ambil(l) {
    if (!l || l.diambil) return false;
    l.diambil = true;
    l.grup.visible = false;
    return true;
  }

  function count() { return lilin.filter((l) => l.diambil).length; }

  function reset() {
    for (const l of lilin) { l.diambil = false; l.grup.visible = true; }
  }

  return { update, terdekat, ambil, count, reset, daftar: lilin };
}
