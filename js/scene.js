// scene.js — renderer, kamera first-person, kabut, pencahayaan dasar.
import * as THREE from "three";

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0614);
  scene.fog = new THREE.FogExp2(0x0d0818, 0.042);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.rotation.order = "YXZ";

  // Cahaya ambient sangat redup + hemisphere dingin.
  scene.add(new THREE.AmbientLight(0x4a3a66, 0.55));
  const hemi = new THREE.HemisphereLight(0x5a4a7a, 0x1a0f08, 0.35);
  scene.add(hemi);

  // Cahaya bulan redup dari jendela lobi (satu-satunya directional + bayangan).
  const bulan = new THREE.DirectionalLight(0x8fa8ff, 0.5);
  bulan.position.set(6, 12, -10);
  bulan.castShadow = true;
  bulan.shadow.mapSize.set(1024, 1024);
  bulan.shadow.camera.left = -16; bulan.shadow.camera.right = 16;
  bulan.shadow.camera.top = 16; bulan.shadow.camera.bottom = -16;
  bulan.shadow.camera.far = 40;
  scene.add(bulan);

  // Lampu gantung lobi (cahaya hangat, jadi sumber bayangan utama dalam ruangan).
  const gantung = new THREE.PointLight(0xffb347, 22, 18, 1.8);
  gantung.position.set(0, 2.6, 0);
  scene.add(gantung);

  // Cahaya pengikut pemain untuk kostum Vampir (mati secara default).
  const cahayaVampir = new THREE.PointLight(0xffd9a0, 0, 7, 1.6);
  camera.add(cahayaVampir);
  scene.add(camera);

  function setVampir(nyala) {
    cahayaVampir.intensity = nyala ? 26 : 0;
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  // Kedip halus lampu gantung (suasana).
  let t = 0;
  function update(dt) {
    t += dt;
    gantung.intensity = 22 + Math.sin(t * 7.3) * 1.2 + Math.sin(t * 13.7) * 0.8;
  }

  return { scene, camera, renderer, setVampir, update };
}
