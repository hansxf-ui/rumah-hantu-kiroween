// controls.js — input desktop (WASD + mouse Pointer Lock + E/Q) dan HP
// (joystick virtual + tombol aksi/kemampuan + seret layar untuk melihat).
export function createControls(callbacks) {
  // callbacks: { onAction, onAbility, onLook(dx, dy), onCostumeKey(nama) }
  const tombol = {};
  const move = { maju: 0, geser: 0 };
  const sentuh = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
  let pointerTerkunci = false;

  const kanvas = document.querySelector("#game-container canvas");
  if (!sentuh && kanvas) {
    kanvas.addEventListener("click", () => {
      if (document.pointerLockElement !== kanvas) kanvas.requestPointerLock();
      else callbacks.onAction();
    });
    document.addEventListener("pointerlockchange", () => {
      pointerTerkunci = document.pointerLockElement === kanvas;
    });
    document.addEventListener("mousemove", (e) => {
      if (pointerTerkunci) callbacks.onLook(e.movementX * 0.0022, e.movementY * 0.0022);
    });
    document.addEventListener("contextmenu", (e) => {
      if (pointerTerkunci) { e.preventDefault(); callbacks.onAbility(); }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    tombol[e.code] = true;
    if (e.code === "KeyE") callbacks.onAction();
    if (e.code === "KeyQ") callbacks.onAbility();
    if (e.code === "Digit1") callbacks.onCostumeKey("hantu");
    if (e.code === "Digit2") callbacks.onCostumeKey("vampir");
    if (e.code === "Digit3") callbacks.onCostumeKey("labu");
    if (e.code === "Digit4") callbacks.onCostumeKey("penyihir");
    perbaruiMove();
  });
  window.addEventListener("keyup", (e) => { tombol[e.code] = false; perbaruiMove(); });

  function perbaruiMove() {
    move.maju = (tombol.KeyW || tombol.ArrowUp ? 1 : 0) - (tombol.KeyS || tombol.ArrowDown ? 1 : 0);
    move.geser = (tombol.KeyD || tombol.ArrowRight ? 1 : 0) - (tombol.KeyA || tombol.ArrowLeft ? 1 : 0);
  }

  // ---------- Kontrol sentuh ----------
  const joy = { aktif: false, id: null, x: 0, z: 0 };
  let lihat = { aktif: false, id: null, x: 0, y: 0 };

  if (sentuh) {
    const elJoy = document.getElementById("joystick");
    const tuas = document.getElementById("joystick-tuas");
    const elAksi = document.getElementById("tombol-aksi");
    const elKemampuan = document.getElementById("tombol-kemampuan");

    function posisiTuas(dx, dy) {
      const maks = 40;
      const d = Math.hypot(dx, dy);
      const s = d > maks ? maks / d : 1;
      tuas.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    }
    elJoy.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joy.aktif = true; joy.id = t.identifier;
    }, { passive: false });
    elJoy.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier !== joy.id) continue;
        const r = elJoy.getBoundingClientRect();
        let dx = t.clientX - (r.left + r.width / 2);
        let dy = t.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy), maks = 44;
        if (d > maks) { dx = (dx / d) * maks; dy = (dy / d) * maks; }
        posisiTuas(dx, dy);
        joy.x = dx / maks; joy.z = dy / maks;
        // Joystick: atas = maju, kanan = geser kanan
        move.geser = joy.x;
        move.maju = -joy.z;
      }
    }, { passive: false });
    function akhirJoy(e) {
      for (const t of e.changedTouches) {
        if (t.identifier !== joy.id) continue;
        joy.aktif = false; joy.x = 0; joy.z = 0;
        move.geser = 0; move.maju = 0;
        tuas.style.transform = "translate(0,0)";
      }
    }
    elJoy.addEventListener("touchend", akhirJoy);
    elJoy.addEventListener("touchcancel", akhirJoy);

    elAksi.addEventListener("touchstart", (e) => { e.preventDefault(); callbacks.onAction(); }, { passive: false });
    elKemampuan.addEventListener("touchstart", (e) => { e.preventDefault(); callbacks.onAbility(); }, { passive: false });

    // Seret di area layar selain joystick/tombol = putar pandangan.
    document.addEventListener("touchstart", (e) => {
      for (const t of e.changedTouches) {
        if (t.target.closest("#joystick, #tombol-sentuh-kanan, button")) continue;
        if (lihat.aktif) continue;
        lihat = { aktif: true, id: t.identifier, x: t.clientX, y: t.clientY };
      }
    }, { passive: true });
    document.addEventListener("touchmove", (e) => {
      for (const t of e.changedTouches) {
        if (!lihat.aktif || t.identifier !== lihat.id) continue;
        callbacks.onLook((t.clientX - lihat.x) * 0.0045, (t.clientY - lihat.y) * 0.0045);
        lihat.x = t.clientX; lihat.y = t.clientY;
      }
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
      for (const t of e.changedTouches) if (t.identifier === lihat.id) lihat.aktif = false;
    });
  }

  return {
    move,
    isSentuh: sentuh,
    get pointerTerkunci() { return pointerTerkunci; },
  };
}
