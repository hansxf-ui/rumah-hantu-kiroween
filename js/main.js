// main.js — titik masuk: merangkai semua modul + loop game.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { buildWorld } from "./rooms.js";
import { createPlayer } from "./player.js";
import { createCostumes, KOSTUM } from "./costumes.js";
import { createGhosts } from "./ghosts.js";
import { createCandles } from "./candles.js";
import { createHud } from "./hud.js";
import { createControls } from "./controls.js";
import { createAudio } from "./audio.js";
import { createGame } from "./game.js";

let game; // didefinisikan di bawah; dipakai callback HUD/controls

const container = document.getElementById("game-container");
const sceneApi = createScene(container);
const world = buildWorld(sceneApi.scene);
const player = createPlayer(world);
const candles = createCandles(sceneApi.scene);
const ghosts = createGhosts(sceneApi.scene, world);
const audio = createAudio();

const costumes = createCostumes({
  onVampir: (nyala) => sceneApi.setVampir(nyala),
  onHantu: (aktif) => player.setPhase(aktif),
  onLabu: () => audio.kemampuan("labu"),
  onGanti: (nama) => {
    hud.setKostum(KOSTUM[nama].nama, KOSTUM[nama].ikon);
    audio.gantiKostum();
  },
});

const hud = createHud({
  onMulai: () => game.mulai(),
  onUlang: () => game.mulai(),
  onBisu: () => { audio.setBisu(!audio.bisu); hud.setBisu(audio.bisu); },
  onPilihKostum: (nama) => { costumes.ganti(nama); hud.tutupPanelKostum(); },
});

const controls = createControls({
  onAction: () => game.interact(),
  onAbility: () => game.pakaiKemampuan(),
  onLook: (dx, dy) => player.putar(dx, dy),
  onCostumeKey: (nama) => game.gantiKostumCepat(nama),
});

game = createGame({ world, player, costumes, ghosts, candles, hud, audio, scene: sceneApi, controls });
hud.tampilMenu();

// ---------- Loop utama ----------
const clock = new THREE.Clock();
let t = 0;
const { scene, camera, renderer } = sceneApi;

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;

  sceneApi.update(dt);
  candles.update(dt, t);
  world.update(dt);
  game.update(dt);

  if (game.state === "menu") {
    // Kamera menu: diam di lobi, bergoyang pelan memandang pintu keluar
    camera.position.set(Math.sin(t * 0.1) * 0.4, 1.6, 2.5);
    camera.rotation.set(0, Math.sin(t * 0.08) * 0.12, 0);
  } else {
    const mata = player.posisiMata();
    camera.position.copy(mata);
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;
  }

  renderer.render(scene, camera);
}
loop();
