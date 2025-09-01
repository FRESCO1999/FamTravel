// Family Travel Globe
// Status colors
const COLORS = {
  none: '#6b7280',     // grey
  intend: '#eab308',   // yellow
  visited: '#22c55e'   // green
};

const STORAGE_KEY = 'family-travel-status-v1';

// UI state
let currentMode = 'visited'; // default

// Grab DOM
const container = document.getElementById('globe-container');

// Three.js scaffolding
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1220);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 300;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(-50, 50, 100);
scene.add(dirLight);

// Globe
const globe = new ThreeGlobe()
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .showAtmosphere(true)
  .atmosphereAltitude(0.18)
  .polygonCapColor(feat => {
    const s = (feat.properties && feat.properties.status) || 'none';
    return COLORS[s];
  })
  .polygonSideColor(() => 'rgba(200, 200, 200, 0.15)')
  .polygonStrokeColor(() => 'rgba(255,255,255,0.25)')
  .polygonAltitude(0.01)
  .polygonsTransitionDuration(200)
  ;

scene.add(globe);

// Load country GeoJSON (already has names)
async function loadCountries() {
  const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
  const geo = await res.json();

  // Restore saved statuses if available
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  geo.features.forEach(f => {
    const key = countryKey(f);
    if (saved[key]) f.properties.status = saved[key];
    else f.properties.status = 'none';
  });

  globe.polygonsData(geo.features);
  setupClicks();
}

function countryKey(f) {
  // Prefer ISO_A3 if present, else fall back to name
  return (f.properties.ISO_A3 || f.properties.id || f.properties.name || '').toString();
}

function setupClicks() {
  globe.onPolygonClick(f => {
    if (!f || !f.properties) return;
    const key = countryKey(f);
    // Set to current mode
    f.properties.status = currentMode;
    persistOne(key, currentMode);
    // Trigger re-color by re-setting data reference (fastest way with three-globe)
    const data = globe.polygonsData();
    globe.polygonsData([]);
    globe.polygonsData(data);
    showToast(`${f.properties.name || key} → ${currentMode.toUpperCase()}`);
  });
}

function persistOne(key, status) {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  saved[key] = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

// Buttons
const modeBtns = document.querySelectorAll('.mode-btn');
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
  });
});
// default highlight
document.querySelector('.mode-btn[data-mode="visited"]').classList.add('active');

document.getElementById('reset').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  const data = globe.polygonsData();
  data.forEach(f => f.properties.status = 'none');
  globe.polygonsData([]);
  globe.polygonsData(data);
  showToast('All countries reset.');
});

document.getElementById('export').addEventListener('click', () => {
  const saved = localStorage.getItem(STORAGE_KEY) || '{}';
  const blob = new Blob([saved], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'family-travel-status.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('import').click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const txt = await f.text();
  try {
    const saved = JSON.parse(txt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    // Re-apply
    const data = globe.polygonsData();
    data.forEach(feat => {
      const key = countryKey(feat);
      feat.properties.status = saved[key] || 'none';
    });
    globe.polygonsData([]);
    globe.polygonsData(data);
    showToast('Imported!');
  } catch (err) {
    alert('Invalid JSON file.');
  }
});

// Responsive
function onResize() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}
window.addEventListener('resize', onResize);

// Animate
(function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();

// Simple toast
let toastTimer;
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    Object.assign(el.style, {
      position: 'fixed',
      top: '64px',
      right: '12px',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '8px',
      zIndex: 1000
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.style.display = 'none', 1600);
}

// Kick off
loadCountries();
onResize();
