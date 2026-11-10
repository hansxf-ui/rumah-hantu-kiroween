// hud.js — semua elemen DOM: menu, HUD, prompt, panel kostum, layar menang/kalah.
export function createHud(callbacks) {
  // callbacks: { onMulai, onUlang, onBisu, onPilihKostum(nama) }
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $("hud"), jam: $("hud-jam"), lilin: $("hud-lilin"), kostum: $("hud-kostum"),
    ruangan: $("hud-ruangan"), kemampuan: $("hud-kemampuan"), kemampuanTeks: $("hud-kemampuan-teks"),
    bisu: $("tombol-bisu"), prompt: $("prompt"), promptTeks: $("prompt-teks"), promptTombol: $("prompt-tombol"),
    pesan: $("pesan"), panelKostum: $("panel-kostum"), menu: $("menu-utama"),
    mulai: $("tombol-mulai"), menang: $("layar-menang"), menangDetail: $("menang-detail"),
    kalah: $("layar-kalah"), kalahAlasan: $("kalah-alasan"),
    ulangMenang: $("tombol-ulang-menang"), ulangKalah: $("tombol-ulang-kalah"),
    vignetteKostum: $("vignette-kostum"), vignetteBahaya: $("vignette-bahaya"),
    kontrolSentuh: $("kontrol-sentuh"), teksKontrol: $("teks-kontrol"),
  };
  let timerPesan = null;
  const sentuh = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

  el.mulai.addEventListener("click", () => callbacks.onMulai());
  el.ulangMenang.addEventListener("click", () => callbacks.onUlang());
  el.ulangKalah.addEventListener("click", () => callbacks.onUlang());
  el.bisu.addEventListener("click", () => callbacks.onBisu());
  document.querySelectorAll(".tombol-kostum").forEach((b) => {
    b.addEventListener("click", () => callbacks.onPilihKostum(b.dataset.kostum));
  });
  document.getElementById("tombol-tutup-kostum").addEventListener("click", () => tutupPanelKostum());
  if (sentuh) {
    el.teksKontrol.textContent = "Joystick kiri bergerak • Seret layar melihat • Tombol ✋ aksi • Tombol ✨ kemampuan";
    el.kontrolSentuh.classList.remove("hidden");
  }

  function sembunyikanSemua() {
    el.menu.classList.add("hidden");
    el.menang.classList.add("hidden");
    el.kalah.classList.add("hidden");
    el.panelKostum.classList.add("hidden");
    el.hud.classList.add("hidden");
    el.prompt.classList.add("hidden");
  }

  function tampilMenu() { sembunyikanSemua(); el.menu.classList.remove("hidden"); }
  function tampilHud() { el.menu.classList.add("hidden"); el.menang.classList.add("hidden"); el.kalah.classList.add("hidden"); el.hud.classList.remove("hidden"); }

  function tampilMenang(detail) {
    el.hud.classList.add("hidden"); el.prompt.classList.add("hidden");
    el.menangDetail.textContent = detail;
    el.menang.classList.remove("hidden");
  }
  function tampilKalah(alasan) {
    el.hud.classList.add("hidden"); el.prompt.classList.add("hidden");
    el.kalahAlasan.textContent = alasan;
    el.kalah.classList.remove("hidden");
  }

  function setJam(teks) { el.jam.textContent = "🕚 " + teks; }
  function setLilin(n) { el.lilin.textContent = "🕯️ Lilin: " + n + "/6"; }
  function setKostum(nama, ikon) { el.kostum.textContent = ikon + " Kostum: " + nama; }
  function setRuangan(nama) { el.ruangan.textContent = "🏠 " + nama; }
  function setKemampuan(teks, aktif) {
    if (!teks) { el.kemampuan.classList.add("hidden"); return; }
    el.kemampuan.classList.remove("hidden");
    el.kemampuanTeks.textContent = (aktif ? "✨ " : "") + teks;
  }
  function tampilPrompt(teks, tombol) {
    el.promptTeks.textContent = teks;
    el.promptTombol.textContent = sentuh ? "[✋]" : "[" + tombol + "]";
    el.prompt.classList.remove("hidden");
  }
  function sembunyiPrompt() { el.prompt.classList.add("hidden"); }

  function pesan(teks, ms = 2600) {
    el.pesan.textContent = teks;
    el.pesan.classList.remove("hidden");
    if (timerPesan) clearTimeout(timerPesan);
    timerPesan = setTimeout(() => el.pesan.classList.add("hidden"), ms);
  }

  function bukaPanelKostum() { el.panelKostum.classList.remove("hidden"); }
  function tutupPanelKostum() { el.panelKostum.classList.add("hidden"); }
  function panelKostumTerbuka() { return !el.panelKostum.classList.contains("hidden"); }

  function setVignetteKostum(nama) {
    el.vignetteKostum.className = nama && nama !== "biasa" ? nama : "";
  }
  function setBahaya(aktif) {
    el.vignetteBahaya.classList.toggle("aktif", !!aktif);
  }
  function setBisu(bisu) { el.bisu.textContent = bisu ? "🔇" : "🔊"; }

  return {
    tampilMenu, tampilHud, tampilMenang, tampilKalah,
    setJam, setLilin, setKostum, setRuangan, setKemampuan,
    tampilPrompt, sembunyiPrompt, pesan,
    bukaPanelKostum, tutupPanelKostum, panelKostumTerbuka,
    setVignetteKostum, setBahaya, setBisu,
    isSentuh: sentuh,
  };
}
