// costumes.js — 4 kostum + kekuatan + cooldown (state machine murni, tanpa Three.js).
// Satu kostum aktif dalam satu waktu; ganti kostum membatalkan kemampuan lama.
export const KOSTUM = {
  biasa: { nama: "Biasa", ikon: "🎭", ket: "Tanpa kekuatan" },
  hantu: { nama: "Hantu", ikon: "👻", ket: "Tembus dinding 5 dtk" },
  vampir: { nama: "Vampir", ikon: "🧛", ket: "Lihat dalam gelap" },
  labu: { nama: "Labu", ikon: "🎃", ket: "Nakuti hantu kecil" },
  penyihir: { nama: "Penyihir", ikon: "🧙", ket: "Buka pintu terkunci" },
};

export const DURASI_HANTU = 5;      // detik tembus dinding
export const COOLDOWN_HANTU = 10;   // detik
export const COOLDOWN_LABU = 8;     // detik
export const RADIUS_LABU = 6;       // meter
export const RADIUS_VAMPIR = 6;     // meter (cahaya pengikut)

export function createCostumes(callbacks) {
  // callbacks: { onVampir(nyala), onLabu(), onHantu(aktif), onGanti(nama) }
  let aktif = "biasa";
  let vampirNyala = false;
  let hantuSisa = 0;        // detik kemampuan Hantu tersisa
  let hantuCooldown = 0;
  let labuCooldown = 0;

  function current() { return aktif; }

  function ganti(nama) {
    if (!KOSTUM[nama]) return false;
    aktif = nama;
    // Batalkan kemampuan kostum lama
    vampirNyala = false;
    hantuSisa = 0;
    callbacks.onVampir(false);
    callbacks.onHantu(false);
    callbacks.onGanti(nama);
    return true;
  }

  // Pakai kemampuan kostum aktif. Mengembalikan { ok, pesan } untuk HUD/audio.
  function pakaiKemampuan(ctx) {
    if (aktif === "hantu") {
      if (hantuSisa > 0) return { ok: false, pesan: "Kemampuan Hantu sedang aktif" };
      if (hantuCooldown > 0) return { ok: false, pesan: "Tembus dinding isi ulang: " + Math.ceil(hantuCooldown) + " dtk" };
      hantuSisa = DURASI_HANTU;
      callbacks.onHantu(true);
      return { ok: true, pesan: "Tembus dinding aktif!" };
    }
    if (aktif === "vampir") {
      vampirNyala = !vampirNyala;
      callbacks.onVampir(vampirNyala);
      return { ok: true, pesan: vampirNyala ? "Penglihatan vampir menyala" : "Penglihatan vampir mati" };
    }
    if (aktif === "labu") {
      if (labuCooldown > 0) return { ok: false, pesan: "Labu isi ulang: " + Math.ceil(labuCooldown) + " dtk" };
      labuCooldown = COOLDOWN_LABU;
      callbacks.onLabu();
      if (ctx && ctx.ghosts) ctx.ghosts.takuti(ctx.playerPos, RADIUS_LABU);
      return { ok: true, pesan: "Buuu! Hantu kecil kabur!" };
    }
    if (aktif === "penyihir") return { ok: false, pesan: "Penyihir membuka pintu lewat interaksi (E)" };
    return { ok: false, pesan: "Kostum biasa tidak punya kekuatan — ganti kostum di lemari" };
  }

  function update(dt) {
    if (hantuSisa > 0) {
      hantuSisa -= dt;
      if (hantuSisa <= 0) {
        hantuSisa = 0;
        hantuCooldown = COOLDOWN_HANTU;
        callbacks.onHantu(false);
      }
    }
    if (hantuCooldown > 0) hantuCooldown -= dt;
    if (labuCooldown > 0) labuCooldown -= dt;
  }

  // Status untuk HUD: { nama, ikon, kemampuan, sisa, cooldown }
  function status() {
    if (aktif === "hantu" && hantuSisa > 0)
      return { teks: "Tembus dinding: " + Math.ceil(hantuSisa) + " dtk", aktif: true };
    if (aktif === "hantu" && hantuCooldown > 0)
      return { teks: "Tembus dinding isi ulang: " + Math.ceil(hantuCooldown) + " dtk", aktif: false };
    if (aktif === "vampir")
      return { teks: vampirNyala ? "Penglihatan vampir: NYALA" : "Penglihatan vampir: mati (tekan Q)", aktif: vampirNyala };
    if (aktif === "labu" && labuCooldown > 0)
      return { teks: "Labu isi ulang: " + Math.ceil(labuCooldown) + " dtk", aktif: false };
    if (aktif === "labu")
      return { teks: "Labu siap — tekan Q untuk menakuti hantu kecil", aktif: false };
    if (aktif === "penyihir")
      return { teks: "Penyihir: bisa buka pintu terkunci", aktif: false };
    return { teks: "", aktif: false };
  }

  function reset() {
    aktif = "biasa"; vampirNyala = false; hantuSisa = 0; hantuCooldown = 0; labuCooldown = 0;
    callbacks.onVampir(false);
    callbacks.onHantu(false);
  }

  return {
    current, ganti, pakaiKemampuan, update, status, reset,
    get hantuAktif() { return hantuSisa > 0; },
    get vampirNyala() { return vampirNyala; },
  };
}
