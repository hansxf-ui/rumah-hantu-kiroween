// ghosts.js — hantu patroli (rute waypoint + kejar) dan hantu kecil (acak + takut Labu).
import * as THREE from "three";
import { segmentHitsAABB } from "./logic.js";

export const KECEPATAN_PATROLI = 1.5;
export const KECEPATAN_KEJAR = 2.4;
export const JARAK_KEJAR = 8;
export const JARAK_TANGKAP = 1;

const RUTE_PATROLI = [
  { nama: "A", titik: [[-9, 0], [-5.5, 0], [-9, 0]], y: 0 },             // perpustakaan saja — jangan masuk lobi
  { nama: "B", titik: [[9, 0], [5.5, 0], [9, 0]], y: 0 },               // dapur saja — jangan masuk lobi
  { nama: "C", titik: [[0, 12], [0, 9], [0, 12]], y: -3 },              // basement saja — beda lantai dari lobi
];
const RUANG_KECIL = [
  { ruang: "perpustakaan", x0: -12.5, z0: -3.5, x1: -5.5, z1: 3.5, x: -9, z: -2 },
  { ruang: "dapur", x0: 5.5, z0: -3.5, x1: 12.5, z1: 3.5, x: 9, z: 2 },
  { ruang: "basement", x0: -4.5, z0: 8.5, x1: 4.5, z1: 15.5, x: 0, z: 12 },
  { ruang: "loteng", x0: -4.5, z0: -3.5, x1: 4.5, z1: 3.5, x: 0, z: 0 },
];

function buatModelHantu(skala, warnaJubah, warnaMata) {
  const g = new THREE.Group();
  const matJubah = new THREE.MeshLambertMaterial({ color: warnaJubah, emissive: 0x222233, transparent: true, opacity: 0.92 });
  const jubah = new THREE.Mesh(new THREE.ConeGeometry(0.55 * skala, 1.5 * skala, 12), matJubah);
  jubah.position.y = 0.75 * skala; jubah.castShadow = true; g.add(jubah);
  const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.34 * skala, 14, 10), matJubah);
  kepala.position.y = 1.65 * skala; kepala.castShadow = true; g.add(kepala);
  const matMata = new THREE.MeshBasicMaterial({ color: warnaMata });
  for (const sx of [-0.13, 0.13]) {
    const mata = new THREE.Mesh(new THREE.SphereGeometry(0.06 * skala, 8, 6), matMata);
    mata.position.set(sx * skala, 1.7 * skala, 0.29 * skala); g.add(mata);
  }
  // Lengan berjubah
  for (const sx of [-0.5, 0.5]) {
    const lengan = new THREE.Mesh(new THREE.ConeGeometry(0.14 * skala, 0.7 * skala, 8), matJubah);
    lengan.position.set(sx * skala, 1.0 * skala, 0.1 * skala);
    lengan.rotation.z = sx < 0 ? 0.5 : -0.5;
    g.add(lengan);
  }
  // Ujung jubah bergelombang
  const hem = new THREE.Mesh(new THREE.TorusGeometry(0.5 * skala, 0.07 * skala, 6, 14), matJubah);
  hem.rotation.x = Math.PI / 2; hem.position.y = 0.08 * skala; g.add(hem);
  return g;
}

export function createGhosts(scene, world) {
  const hantu = [];

  for (const r of RUTE_PATROLI) {
    const model = buatModelHantu(1, 0xe8e8f0, 0xff2222);
    const [sx, sz] = r.titik[0];
    // y logika dihitung dari lantai rute (r.y), BUKAN dibaca balik dari
    // model.position.y — posisi render bukan sumber kebenaran logika.
    const yAwal = r.y + 0.9;
    model.position.set(sx, yAwal, sz);
    scene.add(model);
    hantu.push({
      jenis: "patroli", nama: r.nama, model, rute: r.titik, idx: 1,
      x: sx, z: sz, y: yAwal, mode: "patroli",
      jedaWaypoint: 0, hilangPandangan: 0, fase: Math.random() * 10,
    });
  }
  for (const rk of RUANG_KECIL) {
    const model = buatModelHantu(0.6, 0xbfd8ff, 0xff8800);
    const y0 = rk.ruang === "basement" ? -3 : (rk.ruang === "loteng" ? 3 : 0);
    model.position.set(rk.x, y0 + 0.9, rk.z);
    scene.add(model);
    hantu.push({
      jenis: "kecil", ruang: rk.ruang, model, batas: rk,
      x: rk.x, z: rk.z, y: y0 + 0.9,
      target: null, lari: 0, lariDari: null, fase: Math.random() * 10,
    });
  }

  function garisPandangBersih(x1, z1, y1, x2, z2, y2) {
    const yAtas = Math.max(y1, y2) + 1.5, yBawah = Math.min(y1, y2);
    for (const c of world.colliders) {
      if (!c.active) continue;
      if (c.y1 < yBawah || c.y0 > yAtas) continue;
      if (segmentHitsAABB(x1, z1, x2, z2, c)) return false;
    }
    return true;
  }

  function gerakMenuju(h, tx, tz, kecepatan, dt) {
    const dx = tx - h.x, dz = tz - h.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const langkah = Math.min(d, kecepatan * dt);
    h.x += (dx / d) * langkah;
    h.z += (dz / d) * langkah;
    h.model.rotation.y = Math.atan2(dx, dz);
    return d - langkah < 0.05;
  }

  // grace = masa tenggang setelah mulai: hantu tidak mengejar & tidak bisa
  // menangkap (pemain sempat orientasi). Lihat MASA_TENGGANG di game.js.
  function update(dt, t, pemain, callbacks, grace = false) {
    for (const h of hantu) {
      const jarakPemain = Math.hypot(pemain.x - h.x, pemain.z - h.z);
      const bedaY = Math.abs(pemain.y - (h.y - 0.9));
      if (h.jenis === "patroli") {
        const terlihat = !grace && jarakPemain <= JARAK_KEJAR && bedaY < 2 &&
          garisPandangBersih(h.x, h.z, h.y, pemain.x, pemain.z, pemain.y);
        if (terlihat) { h.mode = "kejar"; h.hilangPandangan = 0; }
        else if (h.mode === "kejar") {
          h.hilangPandangan += dt;
          if (h.hilangPandangan > 3 || jarakPemain > 10) {
            h.mode = "patroli";
            // Kembali ke waypoint terdekat
            let terbaik = 0, dTerbaik = Infinity;
            h.rute.forEach((p, i) => {
              const d = Math.hypot(p[0] - h.x, p[1] - h.z);
              if (d < dTerbaik) { dTerbaik = d; terbaik = i; }
            });
            h.idx = terbaik;
          }
        }
        if (h.mode === "kejar") {
          gerakMenuju(h, pemain.x, pemain.z, KECEPATAN_KEJAR, dt);
        } else {
          if (h.jedaWaypoint > 0) { h.jedaWaypoint -= dt; }
          else {
            const [tx, tz] = h.rute[h.idx];
            if (gerakMenuju(h, tx, tz, KECEPATAN_PATROLI, dt)) {
              h.idx = (h.idx + 1) % h.rute.length;
              h.jedaWaypoint = 1;
            }
          }
        }
      } else {
        // Hantu kecil: berkeliaran acak, mendekat kalau pemain dekat, lari kalau ditakuti
        if (h.lari > 0) {
          h.lari -= dt;
          const dx = h.x - h.lariDari.x, dz = h.z - h.lariDari.z;
          const d = Math.hypot(dx, dz) || 1;
          gerakMenuju(h, h.x + (dx / d) * 3, h.z + (dz / d) * 3, 2.4, dt);
        } else if (jarakPemain <= 2.5 && bedaY < 2) {
          gerakMenuju(h, pemain.x, pemain.z, 1.5, dt); // merayap mendekat
        } else {
          if (!h.target) {
            h.target = {
              x: h.batas.x0 + Math.random() * (h.batas.x1 - h.batas.x0),
              z: h.batas.z0 + Math.random() * (h.batas.z1 - h.batas.z0),
            };
          }
          if (gerakMenuju(h, h.target.x, h.target.z, 2.0, dt)) h.target = null;
        }
        // Jaga tetap di dalam ruangannya
        h.x = Math.max(h.batas.x0, Math.min(h.batas.x1, h.x));
        h.z = Math.max(h.batas.z0, Math.min(h.batas.z1, h.z));
      }
      // Ketinggian mengikuti lantai + melayang naik-turun halus
      const lantaiY = world.floorHeightAt(h.x, h.z, h.y - 0.9);
      h.y = lantaiY + 0.9 + Math.sin(t * 2 + h.fase) * 0.12;
      h.model.position.set(h.x, h.y, h.z);
      // Tertangkap? Hanya bila jarak < 1 m SELANTAI dan bukan masa tenggang.
      // (jarakPemain dihitung sebelum hantu bergerak di frame ini — jadi
      // tangkapan selalu butuh kedekatan nyata, tidak pernah dari kejauhan.)
      if (!grace && jarakPemain < JARAK_TANGKAP && bedaY < 2) {
        callbacks.onCatch(h);
        return;
      }
    }
  }

  // Kostum Labu: hantu kecil dalam radius menjauh dari pemain.
  function takuti(posPemain, radius) {
    for (const h of hantu) {
      if (h.jenis !== "kecil") continue;
      const d = Math.hypot(h.x - posPemain.x, h.z - posPemain.z);
      if (d <= radius) {
        h.lari = 3;
        h.lariDari = { x: posPemain.x, z: posPemain.z };
      }
    }
  }

  function jarakTerdekat(px, pz) {
    let d = Infinity;
    for (const h of hantu) d = Math.min(d, Math.hypot(h.x - px, h.z - pz));
    return d;
  }

  function reset() {
    for (const h of hantu) {
      if (h.jenis === "patroli") {
        const [sx, sz] = h.rute[0];
        h.x = sx; h.z = sz; h.idx = 1; h.mode = "patroli"; h.jedaWaypoint = 0; h.hilangPandangan = 0;
      } else {
        h.x = h.batas.x; h.z = h.batas.z; h.target = null; h.lari = 0;
      }
      h.model.position.set(h.x, h.y, h.z);
    }
  }

  return { update, takuti, jarakTerdekat, reset, daftar: hantu };
}
