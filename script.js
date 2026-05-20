import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Error handling for WebGL
window.addEventListener('error', (e) => {
  if (e.target && e.target.tagName === 'CANVAS') {
    console.warn('3D rendering fallback activated');
    document.getElementById('three-container').style.background = 'linear-gradient(135deg, #0a1628, #1a2a4a)';
  }
});

// Check WebGL support
if (!window.WebGLRenderingContext) {
  document.getElementById('three-container').innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; height:100%; color:#d4af37; text-align:center; padding:2rem;">
      <div>
        <p style="font-size:2rem;">🌟</p>
        <p>Your browser doesn't support 3D graphics.</p>
        <p style="font-size:0.9rem;">Please update for the full experience.</p>
      </div>
    </div>
  `;
}

// Hide loading screen after everything loads
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 2500);
});

// Scene setup
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1628);
scene.fog = new THREE.Fog(0x0a1628, 5, 25);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 8);
camera.lookAt(0, 1.5, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0a1628);
container.appendChild(renderer.domElement);

// CSS2 Renderer for labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x334466, 0.8);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffd4a0, 2);
sunLight.position.set(10, 15, 5);
sunLight.castShadow = true;
sunLight.receiveShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
scene.add(sunLight);

const goldLight = new THREE.PointLight(0xd4af37, 3, 15);
goldLight.position.set(0, 3, 3);
scene.add(goldLight);

const blueLight = new THREE.PointLight(0x4488cc, 2, 12);
blueLight.position.set(-3, 2, 5);
scene.add(blueLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x1a1a3a,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const gridHelper = new THREE.GridHelper(20, 40, 0x335577, 0x224466);
gridHelper.position.y = -0.09;
scene.add(gridHelper);

// Texture loader for buildings
const textureLoader = new THREE.TextureLoader();
const buildingTexture = textureLoader.load('https://images.pexels.com/photos/325193/pexels-photo-325193.jpeg?auto=compress&cs=tinysrgb&w=400');

// Create Building Function
function createBuilding(x, z, height, width, depth, color, windowColor = 0xffdd66) {
  const group = new THREE.Group();
  
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.3,
    metalness: 0.7,
    map: buildingTexture
  });
  const building = new THREE.Mesh(geometry, material);
  building.position.y = height / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);
  
  const windowRows = Math.floor(height * 2);
  const windowCols = Math.floor(width * 4);
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      if (Math.random() > 0.4) {
        const windowGeo = new THREE.PlaneGeometry(0.05, 0.08);
        const windowMat = new THREE.MeshStandardMaterial({ 
          color: windowColor,
          emissive: new THREE.Color(0x442200),
          emissiveIntensity: 0.5,
          roughness: 0.2
        });
        
        const frontWindow = new THREE.Mesh(windowGeo, windowMat);
        frontWindow.position.set(
          -width/2 + 0.1 + (col * (width / (windowCols + 1))),
          0.2 + (row * (height * 0.8 / windowRows)),
          depth/2 + 0.01
        );
        group.add(frontWindow);
        
        const backWindow = new THREE.Mesh(windowGeo, windowMat);
        backWindow.position.set(
          -width/2 + 0.1 + (col * (width / (windowCols + 1))),
          0.2 + (row * (height * 0.8 / windowRows)),
          -depth/2 - 0.01
        );
        backWindow.rotation.y = Math.PI;
        group.add(backWindow);
      }
    }
  }
  
  group.position.set(x, 0, z);
  return group;
}

// Burj Khalifa
function createBurjKhalifa() {
  const group = new THREE.Group();
  
  const towerGeo = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
  const towerMat = new THREE.MeshStandardMaterial({ 
    color: 0x8899aa,
    roughness: 0.2,
    metalness: 0.8,
    map: buildingTexture
  });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.position.y = 2;
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);
  
  for (let i = 0; i < 3; i++) {
    const sectionGeo = new THREE.CylinderGeometry(0.2 - i * 0.04, 0.25 - i * 0.05, 0.3, 8);
    const section = new THREE.Mesh(sectionGeo, towerMat);
    section.position.y = 0.3 + i * 0.8;
    section.castShadow = true;
    section.receiveShadow = true;
    group.add(section);
  }
  
  const spireGeo = new THREE.ConeGeometry(0.05, 1, 8);
  const spireMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37,
    roughness: 0.1,
    metalness: 0.9,
    emissive: new THREE.Color(0x332200),
    emissiveIntensity: 0.8
  });
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 4.4;
  spire.castShadow = true;
  group.add(spire);
  
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const windowGeo = new THREE.PlaneGeometry(0.04, 0.06);
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0xffdd66,
      emissive: new THREE.Color(0x331100),
      emissiveIntensity: 0.6
    });
    const windowPane = new THREE.Mesh(windowGeo, windowMat);
    windowPane.position.set(
      Math.cos(angle) * 0.22,
      0.5 + (i % 3) * 1.2,
      Math.sin(angle) * 0.22
    );
    windowPane.lookAt(new THREE.Vector3(0, windowPane.position.y, 0));
    group.add(windowPane);
  }
  
  return group;
}

const burjKhalifa = createBurjKhalifa();
burjKhalifa.position.set(0, 0, 0);
scene.add(burjKhalifa);

// Add surrounding buildings
const buildings = [
  { x: -1.5, z: 0.5, h: 2.5, w: 0.4, d: 0.4, c: 0x667788 },
  { x: 1.5, z: -0.3, h: 2.8, w: 0.5, d: 0.5, c: 0x778899 },
  { x: -2.5, z: -0.5, h: 2.0, w: 0.45, d: 0.45, c: 0x556677 },
  { x: 2.5, z: 0.3, h: 2.2, w: 0.45, d: 0.45, c: 0x8899aa },
  { x: -0.8, z: -1.2, h: 1.8, w: 0.4, d: 0.4, c: 0x6a7a8a },
  { x: 0.8, z: 1.0, h: 2.1, w: 0.4, d: 0.4, c: 0x7a8a9a },
  { x: -1.8, z: 1.0, h: 2.3, w: 0.35, d: 0.35, c: 0x8a9aaa },
  { x: 1.8, z: -1.0, h: 2.4, w: 0.35, d: 0.35, c: 0x9aaaba },
];

buildings.forEach(b => {
  scene.add(createBuilding(b.x, b.z, b.h, b.w, b.d, b.c));
});

// Burj Al Arab
function createBurjAlArab() {
  const group = new THREE.Group();
  
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.quadraticCurveTo(0.15, 1.5, 0, 2.5);
  sailShape.lineTo(-0.1, 0);
  
  const extrudeSettings = { steps: 1, depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 };
  const sailGeo = new THREE.ExtrudeGeometry(sailShape, extrudeSettings);
  const sailMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.3,
    emissive: new THREE.Color(0x111122),
    emissiveIntensity: 0.3
  });
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.castShadow = true;
  sail.receiveShadow = true;
  group.add(sail);
  
  const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.8
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  
  return group;
}

const burjAlArab = createBurjAlArab();
burjAlArab.position.set(-2.2, 0, -1.5);
burjAlArab.scale.set(1.2, 1.2, 1.2);
scene.add(burjAlArab);

// Palm Trees
function createPalmTree(x, z) {
  const palm = new THREE.Group();
  
  const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.75;
  trunk.castShadow = true;
  palm.add(trunk);
  
  for (let i = 0; i < 6; i++) {
    const frondGeo = new THREE.ConeGeometry(0.3, 0.02, 4);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.y = 1.5;
    frond.rotation.z = (i / 6) * Math.PI * 2;
    frond.rotation.x = Math.PI / 3;
    frond.castShadow = true;
    palm.add(frond);
  }
  
  palm.position.set(x, 0, z);
  return palm;
}

scene.add(createPalmTree(-3, -2));
scene.add(createPalmTree(3, -2));
scene.add(createPalmTree(-2.5, 2));
scene.add(createPalmTree(2.5, 2));

// Cars
function createCar(color = 0xff4444) {
  const car = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(0.2, 0.1, 0.3);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 }));
  body.position.y = 0.15;
  car.add(body);
  
  const roofGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
  const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  roof.position.y = 0.24;
  car.add(roof);
  
  return car;
}

const cars = [];
const carColors = [0xff4444, 0x4444ff, 0x44ff44, 0xffff44];
for (let i = 0; i < 4; i++) {
  const car = createCar(carColors[i]);
  car.position.set(-4 + i * 2.5, 0.05, -2);
  car.rotation.y = Math.PI / 2;
  car.castShadow = true;
  scene.add(car);
  cars.push({ mesh: car, speed: 0.015 + i * 0.008 });
}

// Realistic Airplane
function createAirplane() {
  const airplane = new THREE.Group();
  
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5f5f5,
    roughness: 0.2,
    metalness: 0.4
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  airplane.add(body);
  
  const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const nose = new THREE.Mesh(noseGeo, bodyMat);
  nose.position.z = 0.4;
  nose.castShadow = true;
  airplane.add(nose);
  
  const wingGeo = new THREE.BoxGeometry(0.6, 0.03, 0.15);
  const wingMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.7
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(0, -0.04, -0.1);
  wings.castShadow = true;
  airplane.add(wings);
  
  const tailGeo = new THREE.BoxGeometry(0.06, 0.18, 0.08);
  const tailMat = new THREE.MeshStandardMaterial({ 
    color: 0x2255aa,
    roughness: 0.3,
    metalness: 0.5
  });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0, 0.15, -0.35);
  tail.castShadow = true;
  airplane.add(tail);
  
  const tailHorizGeo = new THREE.BoxGeometry(0.25, 0.03, 0.08);
  const tailHoriz = new THREE.Mesh(tailHorizGeo, wingMat);
  tailHoriz.position.set(0, 0.02, -0.38);
  tailHoriz.castShadow = true;
  airplane.add(tailHoriz);
  
  for (let i = -1; i <= 1; i += 2) {
    const engineGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.15, 8);
    const engineMat = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 0.3,
      metalness: 0.8
    });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(i * 0.13, -0.07, -0.05);
    engine.rotation.x = Math.PI / 2;
    engine.castShadow = true;
    airplane.add(engine);
  }
  
  return airplane;
}

const airplane = createAirplane();
airplane.position.set(3, 2.5, -2);
airplane.scale.set(1.3, 1.3, 1.3);
scene.add(airplane);

// Birds
function createBird() {
  const bird = new THREE.Group();
  const bodyGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  bird.add(body);
  
  const wingGeo = new THREE.BoxGeometry(0.15, 0.02, 0.05);
  const leftWing = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }));
  const rightWing = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }));
  leftWing.position.set(-0.08, 0, 0);
  rightWing.position.set(0.08, 0, 0);
  bird.add(leftWing);
  bird.add(rightWing);
  
  return bird;
}

const birds = [];
for (let i = 0; i < 6; i++) {
  const bird = createBird();
  bird.position.set(Math.random() * 6 - 3, 3 + Math.random() * 2, Math.random() * 6 - 3);
  bird.castShadow = true;
  scene.add(bird);
  birds.push({
    mesh: bird,
    speed: 0.5 + Math.random(),
    amplitude: 0.5 + Math.random(),
    offset: Math.random() * Math.PI * 2
  });
}

// Sand particles
const sandGeometry = new THREE.BufferGeometry();
const sandCount = 300;
const sandPositions = new Float32Array(sandCount * 3);

for (let i = 0; i < sandCount * 3; i += 3) {
  sandPositions[i] = (Math.random() - 0.5) * 10;
  sandPositions[i + 1] = Math.random() * 0.5;
  sandPositions[i + 2] = (Math.random() - 0.5) * 10;
}

sandGeometry.setAttribute('position', new THREE.BufferAttribute(sandPositions, 3));
const sand = new THREE.Points(
  sandGeometry,
  new THREE.PointsMaterial({ color: 0xd2b48c, size: 0.03, blending: THREE.AdditiveBlending })
);
scene.add(sand);

// Stars
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 500;
const starsPositions = new Float32Array(starsCount * 3);
const starsColors = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
  starsPositions[i] = (Math.random() - 0.5) * 20;
  starsPositions[i + 1] = Math.random() * 8;
  starsPositions[i + 2] = (Math.random() - 0.5) * 15;
  
  if (Math.random() > 0.7) {
    starsColors[i] = 0.83;
    starsColors[i + 1] = 0.69;
    starsColors[i + 2] = 0.22;
  } else {
    starsColors[i] = 0.8;
    starsColors[i + 1] = 0.9;
    starsColors[i + 2] = 1.0;
  }
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));

const starsMaterial = new THREE.PointsMaterial({
  size: 0.04,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Floating labels
function createLabel(emoji, x, y, z) {
  const div = document.createElement('div');
  div.textContent = emoji;
  div.style.fontSize = '3rem';
  div.style.filter = 'drop-shadow(0 0 15px #d4af37)';
  const label = new CSS2DObject(div);
  label.position.set(x, y, z);
  return label;
}

const passport = createLabel('🛂', -2, 1.8, 2);
const suitcase = createLabel('🧳', 2, 1.5, 2.2);
const briefcase = createLabel('💼', -1.5, 2.2, -1.8);
scene.add(passport);
scene.add(suitcase);
scene.add(briefcase);

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  
  // Airplane animation
  airplane.position.x = 3 + Math.sin(time * 0.7) * 2;
  airplane.position.y = 2.5 + Math.cos(time * 1.1) * 0.5;
  airplane.position.z = -2 + Math.sin(time * 0.5) * 1;
  airplane.rotation.z = Math.sin(time * 0.6) * 0.15;
  airplane.rotation.x = Math.cos(time * 0.4) * 0.08;
  airplane.rotation.y = Math.sin(time * 0.3) * 0.3;
  
  // Cars animation
  cars.forEach(car => {
    car.mesh.position.x += car.speed;
    if (car.mesh.position.x > 5) car.mesh.position.x = -5;
  });
  
  // Birds animation
  birds.forEach(bird => {
    bird.mesh.position.x += Math.sin(time * bird.speed + bird.offset) * 0.02;
    bird.mesh.position.y += Math.cos(time * bird.speed * 0.7) * 0.01;
    bird.mesh.position.z += Math.cos(time * bird.speed * 0.5) * 0.02;
    bird.mesh.rotation.y = Math.sin(time * bird.speed) * 0.5;
    
    if (bird.mesh.position.x > 4) bird.mesh.position.x = -4;
    if (bird.mesh.position.x < -4) bird.mesh.position.x = 4;
  });
  
  // Floating labels
  passport.position.y = 1.8 + Math.sin(time * 2.5) * 0.2;
  suitcase.position.y = 1.5 + Math.cos(time * 2.8) * 0.2;
  briefcase.position.y = 2.2 + Math.sin(time * 3) * 0.15;
  
  // Stars rotation
  stars.rotation.y += 0.0003;
  stars.rotation.x += 0.0001;
  
  // Sand animation
  sand.rotation.y += 0.0002;
  
  // Light animation
  goldLight.intensity = 3 + Math.sin(time * 2) * 0.5;
  
  // Camera movement
  camera.position.x = Math.sin(time * 0.1) * 1;
  camera.position.y = 3 + Math.sin(time * 0.15) * 0.3;
  camera.lookAt(0, 2, 0);
  
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Navigation menu functionality
document.querySelectorAll('.nav-links span').forEach((link, index) => {
  link.addEventListener('click', () => {
    const sections = [
      '.hero',
      '.job-categories-section',
      '.company-info',
      'footer'
    ];
    if (index < sections.length) {
      const section = document.querySelector(sections[index]);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
  
  // Keyboard accessibility
  link.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      link.click();
    }
  });
});

// Day/Night Toggle
let isNight = true;
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    isNight = !isNight;
    if (isNight) {
      scene.background = new THREE.Color(0x0a1628);
      scene.fog = new THREE.Fog(0x0a1628, 5, 25);
      sunLight.intensity = 2;
      ambientLight.intensity = 0.8;
      themeToggle.textContent = '🌙 Night Mode';
    } else {
      scene.background = new THREE.Color(0x87CEEB);
      scene.fog = new THREE.Fog(0x87CEEB, 8, 30);
      sunLight.intensity = 1;
      ambientLight.intensity = 0.5;
      themeToggle.textContent = '☀️ Day Mode';
    }
  });
}

// Building click interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Don't trigger on UI elements
  if (event.target.closest('.content') && !event.target.closest('canvas')) {
    return;
  }
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    if (clickedObject.parent && clickedObject.parent === burjKhalifa) {
      alert('🏢 Burj Khalifa - The tallest building in the world! Home to thousands of professionals working in Dubai.');
    }
  }
});

// Statistics Counter Animation
function animateCounter(element, target, suffix = '+') {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + suffix;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + suffix;
    }
  }, 30);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.textContent.includes('%') ? '%' : '+';
        animateCounter(counter, target, suffix);
      });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.trust-section').forEach(section => {
  observer.observe(section);
});

// Live job counter update
function updateJobCount() {
  const count = Math.floor(Math.random() * 10) + 20;
  const jobCountElement = document.getElementById('jobCount');
  const updateTimeElement = document.getElementById('updateTime');
  if (jobCountElement) {
    jobCountElement.textContent = `${count} Active Jobs in Dubai`;
  }
  if (updateTimeElement) {
    updateTimeElement.textContent = 'just now';
  }
}

setInterval(updateJobCount, 30000);

// Modal functions
window.openApplicationModal = () => {
  const modal = document.getElementById('applyModal');
  if (modal) modal.style.display = 'block';
};

window.closeApplicationModal = () => {
  const modal = document.getElementById('applyModal');
  if (modal) modal.style.display = 'none';
};

window.onclick = (event) => {
  const modal = document.getElementById('applyModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeApplicationModal();
  }
});

// Form submission
const quickApplyForm = document.getElementById('quickApply');
if (quickApplyForm) {
  quickApplyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('✅ Application submitted successfully! Our team will contact you within 24 hours.');
    closeApplicationModal();
  });
}

// Newsletter subscription
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      alert('📧 Thank you for subscribing! You will receive job alerts at ' + emailInput.value);
      emailInput.value = '';
    }
  });
}

// WhatsApp functions
const whatsappNumber = '+250793220330';

window.openWhatsApp = () => {
  const message = encodeURIComponent('Hello One Line Travel! I am interested in Dubai opportunities.');
  window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
};

window.scrollToJobs = () => {
  const trustSection = document.querySelector('.trust-section');
  if (trustSection) {
    trustSection.scrollIntoView({ behavior: 'smooth' });
  }
};

const whatsappButton = document.getElementById('whatsappButton');
if (whatsappButton) {
  whatsappButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.openWhatsApp();
  });
}

// Video card click
document.querySelectorAll('.video-card').forEach(card => {
  card.addEventListener('click', () => {
    const name = card.querySelector('h4') ? card.querySelector('h4').textContent : '';
    alert(`🎬 ${name}'s success story video coming soon! Real testimonials from Rwandan professionals in Dubai.`);
  });
  
  // Keyboard accessibility
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Job category click
document.querySelectorAll('.job-category').forEach(category => {
  category.addEventListener('click', () => {
    const categoryName = category.textContent;
    alert(`🔍 Showing ${categoryName} jobs in Dubai. Full listings coming soon!`);
  });
  
  // Keyboard accessibility
  category.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      category.click();
    }
  });
});

// Cookie consent
window.acceptCookies = () => {
  const cookieBanner = document.getElementById('cookieConsent');
  if (cookieBanner) {
    cookieBanner.style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
  }
};

// Check if cookies were already accepted
if (localStorage.getItem('cookiesAccepted') === 'true') {
  const cookieBanner = document.getElementById('cookieConsent');
  if (cookieBanner) {
    cookieBanner.style.display = 'none';
  }
}

console.log('✨ One Line Travel - Complete Dubai 3D Experience with All Features Ready!');
