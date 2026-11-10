// player.js — gerakan first-person + tabrakan dinding (lingkaran vs AABB).
import * as THREE from "three";
import { resolveCircleAABB } from "./logic.js";

export const KECEPATAN_JALAN = 3.5; // m/detik — sama di desktop & HP
export const RADIUS_PEMAIN = 0.4;
export const TINGGI_MATA = 1.6;

export function createPlayer(world) {
  const pos = new THREE.Vector3(0, 0, 2.5); // kaki di lobi, menghadap utara (pintu keluar)
  let yaw = 0; // yaw = 0 -> menghadap -z (utara, ke pintu keluar)
  let pitch = 0;
  let phase = false; // kemampuan Hantu aktif: tembus dinding
  let roomId = "lobi";

  function gerak(dt, maju, geser) {
    // maju: -1..1 (W=+1), geser: -1..1 (D=+1)
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    // Arah depan (yaw=0 -> -z): (-sin, -cos); kanan: (cos, -sin)
    let dx = (-sin * maju + cos * geser) * KECEPATAN_JALAN * dt;
    let dz = (-cos * maju - sin * geser) * KECEPATAN_JALAN * dt;
    if (dx === 0 && dz === 0) return;
    // Normalisasi diagonal agar kecepatan sama ke segala arah
    const panjang = Math.hypot(maju, geser);
    if (panjang > 1) { dx /= panjang; dz /= panjang; }
    // Gerak per sumbu (supaya bisa meluncur menyusuri dinding)
    cobaGerak(dx, 0);
    cobaGerak(0, dz);
    // Tinggi lantai mengikuti zona (tangga memberi interpolasi)
    pos.y = world.floorHeightAt(pos.x, pos.z, pos.y);
    roomId = world.roomAt(pos.x, pos.z, pos.y);
  }

  function cobaGerak(dx, dz) {
    const nx = pos.x + dx, nz = pos.z + dz;
    if (phase) { pos.x = nx; pos.z = nz; return; } // tembus dinding
    let x = nx, z = nz;
    for (const c of world.colliders) {
      if (!c.active) continue;
      // Hanya dinding yang tumpang tindih dengan tubuh pemain (y kaki..kepala)
      if (pos.y + 1.7 < c.y0 || pos.y > c.y1) continue;
      const hasil = resolveCircleAABB(x, z, RADIUS_PEMAIN, c);
      if (hasil) { x = hasil.x; z = hasil.z; }
    }
    pos.x = x; pos.z = z;
  }

  function putar(dYaw, dPitch) {
    yaw -= dYaw;
    pitch = Math.max(-1.4, Math.min(1.4, pitch - dPitch));
  }

  function posisiMata() {
    return new THREE.Vector3(pos.x, pos.y + TINGGI_MATA, pos.z);
  }

  function reset() {
    pos.set(0, 0, 2.5);
    yaw = 0; pitch = 0; phase = false; roomId = "lobi";
  }

  return {
    pos, get yaw() { return yaw; }, get pitch() { return pitch; },
    get phase() { return phase; }, setPhase(v) { phase = v; },
    get roomId() { return roomId; },
    gerak, putar, posisiMata, reset,
  };
}
