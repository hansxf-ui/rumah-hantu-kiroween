// logic.js — fungsi matematika murni (tanpa dependensi Three.js).
// Dipakai player.js, ghosts.js, dan game.js. Bisa diuji dengan Node tanpa browser.

export function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
export function lerp(a, b, t) { return a + (b - a) * t; }

// Sudut terpendek dari a ke b (radian, hasil di [-PI, PI]).
export function angleDelta(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Tabrakan lingkaran (px,pz,r) vs AABB 2D {x0,z0,x1,z1}.
// Mengembalikan {x, z} posisi yang sudah diperbaiki (geser keluar dari AABB),
// atau null bila tidak bertabrakan.
export function resolveCircleAABB(px, pz, r, box) {
  const cx = clamp(px, box.x0, box.x1);
  const cz = clamp(pz, box.z0, box.z1);
  const dx = px - cx;
  const dz = pz - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 > 1e-8) {
    const d = Math.sqrt(d2);
    const push = (r - d) / d;
    return { x: px + dx * push, z: pz + dz * push };
  }
  // Pusat lingkaran di dalam kotak: dorong keluar lewat sisi terdekat.
  const l = px - box.x0, rr = box.x1 - px, t = pz - box.z0, bb = box.z1 - pz;
  const m = Math.min(l, rr, t, bb);
  if (m === l) return { x: box.x0 - r, z: pz };
  if (m === rr) return { x: box.x1 + r, z: pz };
  if (m === t) return { x: px, z: box.z0 - r };
  return { x: px, z: box.z1 + r };
}

// Apakah segmen (x1,z1)-(x2,z2) memotong AABB 2D? (untuk garis pandang hantu)
export function segmentHitsAABB(x1, z1, x2, z2, box) {
  const dx = x2 - x1, dz = z2 - z1;
  let tmin = 0, tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < box.x0 || x1 > box.x1) return false;
  } else {
    let t1 = (box.x0 - x1) / dx, t2 = (box.x1 - x1) / dx;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dz) < 1e-9) {
    if (z1 < box.z0 || z1 > box.z1) return false;
  } else {
    let t1 = (box.z0 - z1) / dz, t2 = (box.z1 - z1) / dz;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// Format jam permainan: menit 0..60 dari 23:00 -> "23:00" s.d. "00:00".
export function formatJam(menit) {
  const total = Math.floor(menit);
  if (total >= 60) return "00:00";
  const m = String(total).padStart(2, "0");
  return "23:" + m;
}

// Format sisa waktu mm:ss untuk layar menang.
export function formatSisa(detik) {
  const s = Math.max(0, Math.ceil(detik));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
