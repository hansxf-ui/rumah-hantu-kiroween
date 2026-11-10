// audio.js — semua suara sintetis WebAudio (tanpa file audio eksternal).
// AudioContext dibuat setelah interaksi pertama (aturan autoplay browser).
export function createAudio() {
  let ctx = null;
  let master = null;
  let ambientNodes = null;
  let bisu = false;
  let langkahKe = 0;

  function pastikanCtx() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = bisu ? 0 : 0.5;
      master.connect(ctx.destination);
      return true;
    } catch (e) { return false; }
  }

  function nada(freqAwal, freqAkhir, durasi, tipe = "sine", volume = 0.3, tunda = 0) {
    if (!ctx || bisu) return;
    const t0 = ctx.currentTime + tunda;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipe;
    o.frequency.setValueAtTime(freqAwal, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, freqAkhir), t0 + durasi);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volume, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + durasi);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + durasi + 0.05);
  }

  function derau(durasi, freqFilter, volume = 0.25, tunda = 0, tipeFilter = "lowpass") {
    if (!ctx || bisu) return;
    const t0 = ctx.currentTime + tunda;
    const len = Math.floor(ctx.sampleRate * durasi);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const sumber = ctx.createBufferSource();
    sumber.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = tipeFilter; filter.frequency.value = freqFilter;
    const g = ctx.createGain();
    g.gain.setValueAtTime(volume, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + durasi);
    sumber.connect(filter); filter.connect(g); g.connect(master);
    sumber.start(t0);
  }

  function mulaiAmbient() {
    if (!ctx || ambientNodes) return;
    const g = ctx.createGain(); g.gain.value = 0.05; g.connect(master);
    const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 48;
    const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 48.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    o1.connect(g); o2.connect(g);
    o1.start(); o2.start(); lfo.start();
    ambientNodes = { g, o1, o2, lfo };
  }
  function berhentiAmbient() {
    if (!ambientNodes) return;
    try { ambientNodes.o1.stop(); ambientNodes.o2.stop(); ambientNodes.lfo.stop(); } catch (e) {}
    ambientNodes = null;
  }

  return {
    // Dipanggil dari tombol Mulai (gestur pengguna) — baru di sini AudioContext boleh dibuat.
    mulai() { if (pastikanCtx()) mulaiAmbient(); },
    langkah() {
      if (!ctx || bisu) return;
      langkahKe++;
      derau(0.09, langkahKe % 2 ? 300 : 240, 0.16);
    },
    ambilLilin() { nada(520, 520, 0.09, "sine", 0.3); nada(660, 660, 0.09, "sine", 0.3, 0.08); nada(880, 990, 0.16, "sine", 0.32, 0.16); },
    pintu() { derau(0.5, 180, 0.3); nada(90, 55, 0.5, "sawtooth", 0.1); },
    terkunci() { nada(180, 140, 0.12, "square", 0.14); nada(180, 140, 0.12, "square", 0.14, 0.16); },
    gantiKostum() { nada(300, 900, 0.25, "sine", 0.22); nada(450, 1200, 0.25, "triangle", 0.12, 0.05); },
    kemampuan(nama) {
      if (nama === "hantu") { nada(700, 180, 0.4, "sine", 0.25); derau(0.4, 900, 0.1, 0, "highpass"); }
      else if (nama === "vampir") { nada(220, 440, 0.3, "triangle", 0.22); }
      else if (nama === "labu") { nada(900, 300, 0.25, "square", 0.16); nada(1200, 400, 0.2, "square", 0.12, 0.05); }
      else { nada(500, 800, 0.2, "sine", 0.2); }
    },
    peringatan() { nada(110, 98, 0.5, "sawtooth", 0.16); nada(116, 104, 0.5, "sawtooth", 0.12, 0.12); },
    menang() {
      [523, 659, 784, 1047].forEach((f, i) => nada(f, f, 0.22, "triangle", 0.28, i * 0.14));
      nada(1319, 1319, 0.5, "triangle", 0.22, 0.6);
    },
    kalah() {
      [392, 330, 262, 196].forEach((f, i) => nada(f, f * 0.94, 0.3, "sawtooth", 0.14, i * 0.22));
    },
    setBisu(m) {
      bisu = m;
      if (master) master.gain.value = bisu ? 0 : 0.5;
    },
    get bisu() { return bisu; },
    berhentiAmbient,
  };
}
