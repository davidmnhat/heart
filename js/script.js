// Three.js scene setup
console.clear();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor(0xff8787);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 1;

// Controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.noPan = true;
controls.maxDistance = 3;
controls.minDistance = 0.7;

// Group for objects
const group = new THREE.Group();
scene.add(group);

let heart = null;
let sampler = null;
let originHeart = null;

// Load heart model
new THREE.OBJLoader().load(
  "https://assets.codepen.io/127738/heart_2.obj",
  (object) => {
    heart = object.children[0];
    heart.geometry.rotateX(-Math.PI * 0.5);
    heart.geometry.scale(0.04, 0.04, 0.04);
    heart.geometry.translate(0, -0.4, 0);
    group.add(heart);
    
    heart.material = new THREE.MeshBasicMaterial({ color: 0xff5555 });
    originHeart = Array.from(heart.geometry.attributes.position.array);
    sampler = new THREE.MeshSurfaceSampler(heart).build();
    
    init();
    renderer.setAnimationLoop(render);
  }
);

// Lines geometry
let positions = [];
const geometry = new THREE.BufferGeometry();
const material = new THREE.LineBasicMaterial({ color: 0xffffff });
const lines = new THREE.LineSegments(geometry, material);
group.add(lines);

// Simplex noise for animation
const simplex = new SimplexNoise();
const pos = new THREE.Vector3();

// Grass class for spikes
class Grass {
  constructor() {
    sampler.sample(pos);
    this.pos = pos.clone();
    this.scale = Math.random() * 0.01 + 0.001;
    this.one = null;
    this.two = null;
  }
  
  update(time) {
    const noise = simplex.noise4D(
      this.pos.x * 1.5,
      this.pos.y * 1.5,
      this.pos.z * 1.5,
      time * 0.0005
    ) + 1;
    
    this.one = this.pos.clone().multiplyScalar(1.01 + noise * 0.15 * beat.a);
    this.two = this.one.clone().add(
      this.one.clone().setLength(this.scale)
    );
  }
}

let spikes = [];

function init() {
  positions = [];
  for (let i = 0; i < 20000; i++) {
    const spike = new Grass();
    spikes.push(spike);
  }
}

// Beat animation
const beat = { a: 0 };
gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
  .to(beat, { a: 1.2, duration: 0.6, ease: "power2.in" })
  .to(beat, { a: 0, duration: 0.6, ease: "power3.out" });

gsap.to(group.rotation, {
  y: Math.PI * 2,
  duration: 12,
  ease: "none",
  repeat: -1,
});

// Render loop
function render(time) {
  positions = [];
  
  spikes.forEach((spike) => {
    spike.update(time);
    positions.push(spike.one.x, spike.one.y, spike.one.z);
    positions.push(spike.two.x, spike.two.y, spike.two.z);
  });
  
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );
  
  // Animate heart vertices
  const array = heart.geometry.attributes.position.array;
  for (let i = 0; i < array.length; i += 3) {
    const vertex = new THREE.Vector3(
      originHeart[i],
      originHeart[i + 1],
      originHeart[i + 2]
    );
    
    const noise = simplex.noise4D(
      originHeart[i] * 1.5,
      originHeart[i + 1] * 1.5,
      originHeart[i + 2] * 1.5,
      time * 0.0005
    ) + 1;
    
    vertex.multiplyScalar(1 + noise * 0.15 * beat.a);
    array[i] = vertex.x;
    array[i + 1] = vertex.y;
    array[i + 2] = vertex.z;
  }
  
  heart.geometry.attributes.position.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera);
}

// Window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== Hiệu ứng nhiều dòng chữ rơi xuống =====
const messages = [
  "Tùng rinh rinh 🌙🌙🌙",
  "Tùng tùng tùng rinh rinh 🔥🔥",
  "Trung thu vui vẻ hahahahaha 🌸",
  "M bớt hỏi xàmm",
  "Suốt ngày đòi block",
  "Khó chịu qài 🎁",
  "Đớp ít thoiii",
  "Nói lời mật ngọt đê",
  "M bớt bắt nạt taoo 🎈"
];

const container = document.getElementById("falling-text-container");

function createFallingText() {
  const text = document.createElement("div");
  text.className = "falling-text";
  text.innerText = messages[Math.floor(Math.random() * messages.length)];

  // Vị trí ngang ngẫu nhiên
  text.style.left = Math.random() * 80 + "%";

  // Chiều sâu (0 = xa, 1 = gần)
  const depth = Math.random();

  // Giới hạn scale để chữ gần không quá to
  const scale = 0.6 + depth * 0.7;
  text.style.setProperty("--scale", scale);

  // Trôi lệch trái/phải nhẹ
  text.style.setProperty("--drift", (Math.random() - 0.5) * 200 + "px");

  // Kích thước chữ tổng thể
  text.style.fontSize = 20 + depth * 12 + "pt";

  // Thời gian rơi khác nhau
  const duration = 8 + (1 - depth) * 6;
  text.style.animationDuration = `${duration}s`;

  container.appendChild(text);

  // Xóa khi rơi xong
  setTimeout(() => text.remove(), duration * 1000);
}

// Rơi dày hơn — tạo nhiều chữ mỗi giây
setInterval(() => {
  for (let i = 0; i < 4; i++) createFallingText();
}, 700);


// Footer
