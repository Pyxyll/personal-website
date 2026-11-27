/**
 * The lead work card's dot field, as a real plane of dots.
 *
 * At rest the camera is a long lens looking straight down at the plane,
 * framed so one world unit is one CSS pixel: the grid reads as the flat 7px
 * halftone the CSS draws. On hover it lowers to a three-quarter view with a
 * wider lens, so the plane recedes in perspective, and the dots start to
 * flow toward you. Behind the camera, more slowly, the plane rises into
 * terrain, and the dots that sit on certain heights brighten into contour
 * lines: a topographic map, drawn in the halftone. While the pointer stays
 * the land keeps shifting, slowly. Leave and it settles flat and the camera
 * rises back. One number, t, blends every camera property between the two
 * views and a second, relief, raises the land, both tweened by GSAP as the
 * schematics' camera is (scripts/marks3d.ts).
 *
 * The CSS dots (.work-dots-plane) stay underneath as the fallback and fade
 * out once this is drawing. The corner fade is a CSS mask on the container,
 * so it stays put while the plane moves under it.
 *
 * Loaded only for a fine pointer that hovers, without reduced motion; the
 * caller checks that. Returns false if WebGL is not available.
 */
import * as THREE from "three";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("cf", "0.4,0,0.2,1");

/** Grid pitch and dot size in world units, which are CSS pixels at rest. */
const SPACING = 7;
const DOT = 2.4;
const OPACITY = 0.22;
/** The plane is this many cells across; positions wrap, so it never ends. */
const CELLS = 360;
const EXTENT = CELLS * SPACING;
/** How fast the dots flow at full hover, in world units a second. */
const FLOW = new THREE.Vector2(9, 24);
/** The land: peak height, feature size, how fast it changes shape, and how
    many contour lines span its full height. */
const RELIEF = 70;
const FEATURE = 230;
const MORPH = 0.07;
const CONTOURS = 9;

interface View {
  /** Camera elevation above the plane and azimuth around it, in degrees. */
  el: number;
  az: number;
  fov: number;
  /** World height visible at the look point, as a multiple of the card's. */
  frame: number;
}
/* Straight down is degenerate for lookAt, and 89.5 with an 8° lens is flat to
   the eye. */
const REST: View = { el: 89.5, az: 0, fov: 8, frame: 1 };
const SHOT: View = { el: 34, az: -28, fov: 40, frame: 0.7 };

/* 3D simplex noise: Ashima Arts and Stefan Gustavson, MIT licence.
   github.com/ashima/webgl-noise */
const noise = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const vertexShader = /* glsl */ `
  uniform float uSize;
  uniform float uScale;
  uniform float uPixel;
  uniform float uExtent;
  uniform vec2 uOffset;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uRelief;
  uniform float uHeight;
  uniform float uFeature;
  uniform float uTime;
  uniform float uContours;
  varying float vAlpha;
  varying float vSize;
  ${noise}
  void main() {
    vec3 p = position;
    p.xz = mod(p.xz + uOffset + uExtent * 0.5, uExtent) - uExtent * 0.5;

    // The land is fixed to the dots, so it travels with the flow; time moves
    // through the noise's third axis, so it also changes shape as it goes.
    // Three octaves: hills, then the folds on them, then a little grain.
    vec3 q = vec3((p.xz - uOffset) / uFeature, uTime);
    float h = snoise(q) * 0.62 + snoise(q * 2.03 + 17.0) * 0.27 + snoise(q * 4.1 + 31.0) * 0.11;
    p.y = h * uHeight * uRelief;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = -mv.z;
    float size = uSize * uScale / d;
    // A dot smaller than a pixel and a half fades instead of shimmering.
    float floorSize = 1.5 * uPixel;
    vAlpha = (1.0 - smoothstep(uFogNear, uFogFar, d)) * clamp(size / floorSize, 0.0, 1.0);

    // Contours: dots on a line of equal height brighten and swell a little,
    // and the high ground is lighter than the low.
    float level = abs(fract(h * uContours * 0.5) - 0.5) * 2.0;
    float line = smoothstep(0.72, 0.94, level) * uRelief;
    vAlpha *= (1.0 + line * 1.1) * mix(1.0, 0.65 + 0.55 * (h * 0.5 + 0.5), uRelief);
    size *= 1.0 + line * 0.35;

    vSize = max(size, floorSize);
    gl_PointSize = vSize;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vSize;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    float edge = 1.0 / vSize;
    float a = 1.0 - smoothstep(0.5 - edge, 0.5, r);
    if (a <= 0.0) discard;
    gl_FragColor = vec4(uColor, uOpacity * vAlpha * a);
  }
`;

export function mount(host: HTMLElement): boolean {
  const card = host.closest<HTMLElement>("a") ?? host;

  let renderer: THREE.WebGLRenderer;
  const canvas = document.createElement("canvas");
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(canvas);

  /* The grid, centred on the origin, on the XZ plane. */
  const positions = new Float32Array(CELLS * CELLS * 3);
  for (let i = 0, k = 0; i < CELLS; i++) {
    for (let j = 0; j < CELLS; j++, k += 3) {
      positions[k] = (i - CELLS / 2) * SPACING;
      positions[k + 2] = (j - CELLS / 2) * SPACING;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const uniforms = {
    uSize: { value: DOT },
    uScale: { value: 1 },
    uPixel: { value: renderer.getPixelRatio() },
    uExtent: { value: EXTENT },
    uOffset: { value: new THREE.Vector2() },
    uFogNear: { value: 1 },
    uFogFar: { value: 2 },
    uRelief: { value: 0 },
    uHeight: { value: RELIEF },
    uFeature: { value: FEATURE },
    uTime: { value: 0 },
    uContours: { value: CONTOURS },
    uColor: { value: new THREE.Color(0xffffff) },
    uOpacity: { value: OPACITY },
  };
  const points = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false }),
  );
  /* Positions wrap in the shader, so three's bounds would be wrong. */
  points.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.PerspectiveCamera(REST.fov, 1, 1, 10000);

  let cw = 1, ch = 1;
  const fit = () => {
    const r = host.getBoundingClientRect();
    cw = r.width || 1;
    ch = r.height || 1;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    dirty = true;
  };

  /* ── Camera: a blend from REST to SHOT by t ──────────────────────────── */
  const state = { t: 0 };
  const lerp = THREE.MathUtils.lerp;
  const rad = THREE.MathUtils.degToRad;
  const dir = new THREE.Vector3();
  const place = () => {
    const t = state.t;
    const el = rad(lerp(REST.el, SHOT.el, t));
    const az = rad(lerp(REST.az, SHOT.az, t));
    const fov = lerp(REST.fov, SHOT.fov, t);
    const frameH = ch * lerp(REST.frame, SHOT.frame, t);
    const dist = frameH / 2 / Math.tan(rad(fov / 2));

    camera.fov = fov;
    camera.near = Math.max(1, dist * 0.05);
    camera.far = dist * 6;
    camera.updateProjectionMatrix();
    dir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    camera.position.copy(dir).multiplyScalar(dist);
    camera.lookAt(0, 0, 0);

    /* Device pixels per world unit at depth 1, for the dot size. */
    uniforms.uScale.value = (ch * renderer.getPixelRatio()) / (2 * Math.tan(rad(fov / 2)));
    /* Fade the far plane out well before it thins into a moiré. */
    uniforms.uFogNear.value = dist * 1.4;
    uniforms.uFogFar.value = dist * 3;
  };

  const land = { relief: 0 };
  card.addEventListener("pointerenter", () => {
    gsap.to(state, { t: 1, duration: 1.1, ease: "cf", overwrite: true });
    gsap.to(land, { relief: 1, duration: 3.2, delay: 0.25, ease: "power2.inOut", overwrite: true });
  });
  card.addEventListener("pointerleave", () => {
    gsap.to(state, { t: 0, duration: 0.9, ease: "cf", overwrite: true });
    gsap.to(land, { relief: 0, duration: 0.8, ease: "cf", overwrite: true });
  });

  /* ── Frames: only while on screen, and only when something moves ────── */
  let visible = false;
  let dirty = true;
  let wasMoving = true;
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!visible) return;
    const t = state.t;
    const relief = land.relief;
    if (t > 0) {
      /* The flow eases in and out with the camera, and wraps a full plane
         so the numbers never grow. */
      const o = uniforms.uOffset.value;
      o.x = (o.x + FLOW.x * t * dt) % EXTENT;
      o.y = (o.y + FLOW.y * t * dt) % EXTENT;
    }
    uniforms.uRelief.value = relief;
    uniforms.uTime.value += MORPH * relief * dt;
    const moving = t > 0 || relief > 0;
    if (!moving && !wasMoving && !dirty) return;
    wasMoving = moving;
    dirty = false;
    place();
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);

  const ro = new ResizeObserver(fit);
  ro.observe(host);
  fit();

  new IntersectionObserver((entries) => {
    for (const e of entries) {
      visible = e.isIntersecting;
      if (visible) dirty = true;
    }
  }).observe(host);

  host.classList.add("is-3d");
  return true;
}
