// game.js — state machine (menu/bermain/menang/kalah), timer tengah malam,
// interaksi dengan objek, kondisi menang/kalah, reset penuh.
import { formatJam, formatSisa } from "./logic.js";

export const DURASI_SESI = 540; // 9 menit waktu nyata (tengah-tengah 8–10 menit)
export const MASA_TENGGANG = 5; // detik setelah mulai: hantu tidak bisa mengejar/menangkap
export const JARAK_INTERAKSI = 2; // meter

export function createGame(deps) {
  const { world, player, costumes, ghosts, candles, hud, audio, scene, controls } = deps;
  let state = "menu";
  let timer = 0;
  let langkahTimer = 0;
  let peringatanTimer = 0;
  let interaksiSaatIni = null;

  const ctx = { game: null, player, costumes, ghosts, candles, hud, audio, world };

  function mulai() {
    reset();
    state = "bermain";
    hud.tampilHud();
    hud.setJam("23:00");
    hud.setLilin(0);
    hud.setKostum("Biasa", "🎭");
    hud.setRuangan("Lobi");
    hud.setKemampuan("", false);
    hud.setVignetteKostum("");
    audio.mulai();
  }

  function reset() {
    timer = 0; langkahTimer = 0; peringatanTimer = 0; interaksiSaatIni = null;
    player.reset();
    costumes.reset();
    candles.reset();
    ghosts.reset();
    world.reset();
  }

  function menang() {
    if (state !== "bermain") return;
    state = "menang";
    const sisa = DURASI_SESI - timer;
    audio.berhentiAmbient();
    audio.menang();
    hud.tampilMenang("Lilin: 6/6 • Sisa waktu: " + formatSisa(sisa));
  }

  function kalah(alasan) {
    if (state !== "bermain") return;
    state = "kalah";
    audio.berhentiAmbient();
    audio.kalah();
    const teks = alasan === "tertangkap"
      ? "Tertangkap hantu! Mereka tidak suka tamu yang berlama-lama."
      : "Tengah malam tiba — pintu mansion terkunci selamanya.";
    hud.tampilKalah(teks);
  }

  function bukaPintuBiasa(pintu) {
    world.bukaPintu(pintu);
  }

  function cariInteraksi() {
    const px = player.pos.x, pz = player.pos.z, py = player.pos.y;
    let terbaik = null, dTerbaik = JARAK_INTERAKSI;
    for (const it of world.interactables) {
      if (Math.abs(it.floorY - py) > 1.5) continue;
      const d = Math.hypot(it.x - px, it.z - pz);
      if (d < dTerbaik) { dTerbaik = d; terbaik = { kind: it.kind, data: it }; }
    }
    const lilin = candles.terdekat(px, pz, JARAK_INTERAKSI);
    if (lilin) {
      const d = Math.hypot(lilin.x - px, lilin.z - pz);
      if (d < dTerbaik) { dTerbaik = d; terbaik = { kind: "candle", data: lilin }; }
    }
    return terbaik;
  }

  function interact() {
    if (state !== "bermain" || hud.panelKostumTerbuka()) return;
    const target = cariInteraksi();
    if (!target) return;
    if (target.kind === "candle") {
      if (candles.ambil(target.data)) {
        audio.ambilLilin();
        hud.setLilin(candles.count());
        if (candles.count() >= 6) hud.pesan("Semua lilin terkumpul — pintu keluar terbuka!");
      }
      return;
    }
    target.data.interact(ctx);
  }

  function pakaiKemampuan() {
    if (state !== "bermain" || hud.panelKostumTerbuka()) return;
    const hasil = costumes.pakaiKemampuan({ ghosts, playerPos: player.pos });
    if (hasil && hasil.pesan) hud.pesan(hasil.pesan);
    if (hasil && hasil.ok) audio.kemampuan(costumes.current());
  }

  function gantiKostumCepat(nama) {
    if (state !== "bermain") return;
    const target = cariInteraksi();
    if (hud.panelKostumTerbuka() || (target && target.kind === "wardrobe")) {
      if (costumes.ganti(nama)) hud.tutupPanelKostum();
    }
  }

  function update(dt) {
    if (state !== "bermain") return;
    // Panel kostum terbuka = jeda (hantu & timer diam, render tetap jalan)
    if (hud.panelKostumTerbuka()) return;

    timer += dt;
    if (timer >= DURASI_SESI) { kalah("tengah-malam"); return; }

    // Gerak pemain
    const bergerak = controls.move.maju !== 0 || controls.move.geser !== 0;
    player.gerak(dt, controls.move.maju, controls.move.geser);
    if (bergerak) {
      langkahTimer += dt;
      if (langkahTimer > 0.45) { langkahTimer = 0; audio.langkah(); }
    }

    costumes.update(dt);

    // Hantu (masa tenggang = 5 detik pertama: tidak mengejar & tidak menangkap)
    ghosts.update(dt, timer, player.pos, {
      onCatch: () => kalah("tertangkap"),
    }, timer < MASA_TENGGANG);
    if (state !== "bermain") return; // kalah saat update hantu

    // Peringatan hantu dekat (≤ 6 m): vignette merah + suara berkala
    const jarakHantu = ghosts.jarakTerdekat(player.pos.x, player.pos.z);
    const bahaya = jarakHantu <= 6;
    hud.setBahaya(bahaya);
    if (bahaya) {
      peringatanTimer += dt;
      if (peringatanTimer > 1.2) { peringatanTimer = 0; audio.peringatan(); }
    } else peringatanTimer = 0;

    // Vignette kostum: Hantu saat fase aktif, Vampir saat menyala
    let vig = "";
    if (costumes.current() === "hantu" && costumes.hantuAktif) vig = "hantu";
    else if (costumes.current() === "vampir" && costumes.vampirNyala) vig = "vampir";
    hud.setVignetteKostum(vig);

    // HUD
    const menitGame = (timer / DURASI_SESI) * 60;
    hud.setJam(formatJam(menitGame));
    hud.setRuangan(world.namaRuangan(player.roomId));
    const st = costumes.status();
    hud.setKemampuan(st.teks, st.aktif);

    // Prompt interaksi
    interaksiSaatIni = cariInteraksi();
    if (interaksiSaatIni) {
      const teks = interaksiSaatIni.kind === "candle" ? "Ambil Lilin" : interaksiSaatIni.data.prompt();
      hud.tampilPrompt(teks, "E");
    } else {
      hud.sembunyiPrompt();
    }
  }

  const api = {
    get state() { return state; },
    mulai, reset, menang, kalah, bukaPintuBiasa,
    interact, pakaiKemampuan, gantiKostumCepat, update,
  };
  ctx.game = api;
  return api;
}
