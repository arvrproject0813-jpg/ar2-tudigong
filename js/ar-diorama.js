// ar-diorama.js — a 3D pop-up neighbourhood that rises out of the culture card in AR.
// Built with plain three.js (A-Frame's bundled THREE), no model files to download.
// Usage (after A-Frame + MindAR are loaded): registerDiorama(); then add
//   <a-entity tdg-diorama></a-entity> inside the mindar-image-target entity.
//
// Cultural rules: shrine architecture, lanterns, stone lions and the offering table only.
// No deity figure, no incense, no smoke, no light rays.

const COL = {
  paper: '#F6EEDF', paperD: '#EADCC2', wood: '#6B4A32', woodD: '#3A2A1E',
  teal: '#2F8C88', tealD: '#1F6B66', tealDD: '#123F3C', green: '#6E9F4E', greenD: '#3F6A2B', greenL: '#A9C98C',
  gold: '#C9952E', goldL: '#F0CF7A', red: '#B23A27', redD: '#7E2418', brick: '#A9452F', terra: '#C0603F',
  stone: '#A99E8B', stoneD: '#7F7563', water: '#5FA6A0',
};

/**
 * Build the neighbourhood with any three.js build (A-Frame's THREE in AR, the three module on P04).
 * Returns { root, parts, markers, lanterns, anchors }. +Y is up, the plinth is about 0.94 × 0.62 units.
 * anchors = points above the four places the P04 pins point at (temple, fields, market, street corner).
 */
export function buildNeighborhood(THREE, { markers: withMarkers = true, shadows = false } = {}) {

  /* ---------- canvas textures ---------- */
  const canvasTex = (w, h, draw, repeat) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    t.anisotropy = 4;
    return t;
  };
  const noise = (g, w, h, a = 0.06) => { for (let i = 0; i < w * h / 18; i++) { g.fillStyle = `rgba(58,42,30,${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } };
  const TEX = {
    brick: () => canvasTex(128, 64, (g, w, h) => {
      g.fillStyle = COL.redD; g.fillRect(0, 0, w, h);
      for (let r = 0; r < 8; r++) for (let c = -1; c < 9; c++) {
        g.fillStyle = ['#A9452F', '#B24E35', '#9E3F2A', '#B75A3E'][(r * 3 + c) & 3];
        g.fillRect(c * 16 + (r % 2) * 8 + 1, r * 8 + 1, 14, 6);
      }
    }, [2, 2]),
    tiles: () => canvasTex(128, 64, (g, w, h) => {
      g.fillStyle = COL.terra; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(143,62,38,.75)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,220,190,.18)'; g.fillRect(x + 4, 0, 2, h); }
    }, [4, 1]),
    paper: () => canvasTex(256, 256, (g, w, h) => { g.fillStyle = COL.paper; g.fillRect(0, 0, w, h); noise(g, w, h, 0.08); }),
    field: () => canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#9CC47A'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 6) { g.fillStyle = y % 12 ? 'rgba(63,106,43,.35)' : 'rgba(220,235,203,.35)'; g.fillRect(0, y, w, 2); }
      g.strokeStyle = 'rgba(126,159,94,.9)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    }),
    facade: (wall, accent) => canvasTex(128, 192, (g, w, h) => {
      g.fillStyle = wall; g.fillRect(0, 0, w, h); noise(g, w, h, 0.05);
      for (let f = 0; f < 3; f++) for (let k = 0; k < 3; k++) {
        const x = 12 + k * 38, y = 16 + f * 46;
        g.fillStyle = '#6F9894'; g.fillRect(x, y, 28, 26);
        g.strokeStyle = '#55606A'; g.lineWidth = 1.5; for (let b = 1; b < 4; b++) { g.beginPath(); g.moveTo(x + b * 7, y); g.lineTo(x + b * 7, y + 26); g.stroke(); }
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 2, y + 2, 8, 22);
      }
      g.fillStyle = accent; g.fillRect(0, 150, w, 10);
      g.fillStyle = '#3B2C21'; g.fillRect(0, 160, w, 32);
      g.fillStyle = 'rgba(243,217,164,.85)'; g.fillRect(10, 166, w - 20, 26);
      g.fillStyle = wall; for (let c = 0; c < 4; c++) g.fillRect(c * 40, 160, 8, 32);
    }),
    awning: (c1) => canvasTex(64, 16, (g, w, h) => { for (let x = 0; x < w; x += 8) { g.fillStyle = (x / 8) % 2 ? '#FFFBF3' : c1; g.fillRect(x, 0, 8, h); } }),
  };

  /* ---------- materials ---------- */
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o });
  const M = {
    gold: std(COL.gold, { metalness: 0.55, roughness: 0.32, emissive: '#5A3C08', emissiveIntensity: 0.35 }),
    goldL: std(COL.goldL, { metalness: 0.45, roughness: 0.3, emissive: '#7A5410', emissiveIntensity: 0.35 }),
    red: std(COL.red, { roughness: 0.55 }),
    redD: std(COL.redD),
    teal: std(COL.tealD, { roughness: 0.45 }),
    stone: std(COL.stone, { roughness: 0.95 }),
    stoneD: std(COL.stoneD, { roughness: 0.95 }),
    wood: std(COL.wood), woodD: std(COL.woodD),
    paper: std(COL.paper),
    green: std(COL.green, { flatShading: true }), greenD: std(COL.greenD, { flatShading: true }), greenL: std(COL.greenL, { flatShading: true }),
    water: std(COL.water, { roughness: 0.25, emissive: '#1F6B66', emissiveIntensity: 0.15 }),
    dark: std('#2A170F', { roughness: 1 }),
    lantern: std('#C7432C', { roughness: 0.6, emissive: '#B23A27', emissiveIntensity: 0.55 }),
    asphalt: std('#B3A794'),
  };

  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);

  /* ---------- the shrine (土地公廟): walls, curved tiled roof, swallowtail ridge, gold ornaments, lanterns ---------- */
  function shrine() {
    const g = new THREE.Group();
    const W = 0.2, D = 0.13, H = 0.12;
    // two stone steps
    g.add(box(W + 0.07, 0.012, D + 0.07, M.stone, 0, 0, 0.006));
    g.add(box(W + 0.04, 0.012, D + 0.04, M.stoneD, 0, 0.012, 0.004));
    const y0 = 0.024;
    // brick walls (front face has the doorway)
    const brick = std('#ffffff', { map: TEX.brick(), roughness: 0.9 });
    g.add(box(W, H, D, brick, 0, y0, 0));
    // granite base band
    g.add(box(W + 0.004, 0.018, D + 0.004, M.stone, 0, y0, 0));
    // doorway: dark recess + gold frame
    const door = new THREE.Group();
    door.add(mesh(new THREE.PlaneGeometry(0.07, 0.085), M.dark, 0, y0 + 0.018 + 0.0425, D / 2 + 0.001));
    const fr = (w, h, x, y) => mesh(new THREE.BoxGeometry(w, h, 0.006), M.gold, x, y, D / 2 + 0.003);
    door.add(fr(0.082, 0.008, 0, y0 + 0.106), fr(0.007, 0.09, -0.038, y0 + 0.063), fr(0.007, 0.09, 0.038, y0 + 0.063));
    // warm altar glow at the back of the doorway (gold edge, no figure)
    door.add(mesh(new THREE.BoxGeometry(0.05, 0.006, 0.004), M.goldL, 0, y0 + 0.03, D / 2 + 0.002));
    g.add(door);
    // vermilion pillars with gold rings
    [-1, 1].forEach((s) => {
      const px = s * (W / 2 + 0.004), pz = D / 2 + 0.006;
      g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, H + 0.004, 12), M.red, px, y0 + H / 2, pz));
      [0.02, H - 0.012].forEach((hy) => {
        const ring = mesh(new THREE.TorusGeometry(0.0095, 0.0022, 6, 14), M.gold, px, y0 + hy, pz);
        ring.rotation.x = Math.PI / 2; g.add(ring);
      });
      // couplet board (red with gold frame, no writing)
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.07, 0.004), M.red, s * 0.062, y0 + 0.06, D / 2 + 0.002));
      g.add(mesh(new THREE.BoxGeometry(0.024, 0.074, 0.002), M.gold, s * 0.062, y0 + 0.06, D / 2 + 0.0005));
    });
    // teal lintel beam with gold studs
    g.add(box(W + 0.03, 0.014, D + 0.02, M.teal, 0, y0 + H, 0));
    for (let i = 0; i < 9; i++) g.add(mesh(new THREE.SphereGeometry(0.0035, 8, 6), M.goldL, -W / 2 + 0.01 + i * (W - 0.02) / 8, y0 + H + 0.007, D / 2 + 0.011));
    // curved roof (upturned eaves) with tile texture
    const rw = W / 2 + 0.035, rd = D / 2 + 0.032, ridgeY = 0.065, curl = 0.032;
    const rg = new THREE.PlaneGeometry(2, 2, 24, 12);
    const p = rg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = p.getY(i), av = Math.abs(v), au = Math.abs(u);
      p.setXYZ(i, u * rw * (1 + 0.05 * av), ridgeY * (1 - av) ** 1.15 + curl * au ** 6 * av + 0.012 * av * av, v * rd);
    }
    rg.computeVertexNormals();
    const roofY = y0 + H + 0.014;
    const roof = mesh(rg, std('#ffffff', { map: TEX.tiles(), side: THREE.DoubleSide, roughness: 0.8 }), 0, roofY, 0);
    g.add(roof);
    // gold eave trim along the front & back edges
    [-1, 1].forEach((s) => {
      const pts = []; for (let i = 0; i <= 20; i++) { const u = -1 + i / 10; pts.push(new THREE.Vector3(u * rw * 1.05, roofY + curl * Math.abs(u) ** 6 + 0.012, s * rd)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0025, 6), M.gold));
    });
    // swallowtail ridge (teal glaze) with gold edge, curling up at both ends
    const ridgePts = [[-rw - 0.05, 0.05], [-rw - 0.02, 0.012], [-rw + 0.03, 0.0], [0, 0.0], [rw - 0.03, 0.0], [rw + 0.02, 0.012], [rw + 0.05, 0.05]]
      .map(([x, y]) => new THREE.Vector3(x, roofY + ridgeY + 0.004 + y, 0));
    const ridgeCurve = new THREE.CatmullRomCurve3(ridgePts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(ridgeCurve, 60, 0.008, 10), M.teal));
    const ridgeTrim = new THREE.Mesh(new THREE.TubeGeometry(ridgeCurve, 60, 0.0035, 6), M.gold);
    ridgeTrim.position.y = 0.009; g.add(ridgeTrim);
    [-1, 1].forEach((s) => g.add(mesh(new THREE.SphereGeometry(0.006, 10, 8), M.goldL, s * (rw + 0.05), roofY + ridgeY + 0.055, 0)));
    // ridge ornaments: gold pearl + two gold dragon curls + cut-porcelain dots
    g.add(mesh(new THREE.SphereGeometry(0.012, 16, 12), M.goldL, 0, roofY + ridgeY + 0.026, 0));
    g.add(mesh(new THREE.TorusGeometry(0.01, 0.002, 6, 16, Math.PI), M.gold, 0, roofY + ridgeY + 0.036, 0));
    [-1, 1].forEach((s) => {
      const pts = [[0.02, 0.006], [0.035, 0.03], [0.055, 0.022], [0.07, 0.035], [0.085, 0.018]].map(([x, y]) => new THREE.Vector3(s * x, roofY + ridgeY + y, 0));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0035, 6), M.gold));
      [[0.1, '#D2593F'], [0.11, COL.goldL], [0.095, '#CDE8E5']].forEach(([x, c]) => g.add(mesh(new THREE.SphereGeometry(0.0045, 8, 6), std(c, { roughness: 0.4 }), s * x, roofY + ridgeY + 0.008, 0.006)));
    });
    // red lanterns hanging from the eaves (they sway — see tick)
    g.userData.lanterns = [];
    [-1, 1].forEach((s) => {
      const L = new THREE.Group();
      L.position.set(s * (W / 2 + 0.018), roofY + 0.006, rd - 0.012);
      L.add(mesh(new THREE.CylinderGeometry(0.0008, 0.0008, 0.016, 4), M.woodD, 0, -0.008, 0));
      L.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12), M.gold, 0, -0.017, 0));
      const body = mesh(new THREE.SphereGeometry(0.015, 16, 12), M.lantern, 0, -0.033, 0); body.scale.set(1, 1.15, 1); L.add(body);
      L.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 12), M.gold, 0, -0.05, 0));
      L.add(mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.014, 4), M.goldL, 0, -0.059, 0));
      g.add(L); g.userData.lanterns.push(L);
    });
    // offering table (observe only): red cloth with gold band, nothing on top
    g.add(box(0.075, 0.035, 0.03, M.red, 0, 0.024, D / 2 + 0.035));
    g.add(box(0.077, 0.006, 0.032, M.wood, 0, 0.059, D / 2 + 0.035));
    g.add(box(0.075, 0.006, 0.0305, M.gold, 0, 0.05, D / 2 + 0.035));
    // stone lions
    [-1, 1].forEach((s) => {
      const L = new THREE.Group(); L.position.set(s * (W / 2 + 0.03), 0.012, D / 2 + 0.04);
      L.add(box(0.026, 0.01, 0.026, M.stoneD, 0, 0, 0));
      const torso = mesh(new THREE.SphereGeometry(0.011, 10, 8), M.stone, 0, 0.022, 0);
      torso.scale.set(1, 1.3, 1); L.add(torso);
      L.add(mesh(new THREE.SphereGeometry(0.009, 10, 8), M.stone, 0, 0.042, 0.004));
      L.add(mesh(new THREE.TorusGeometry(0.0085, 0.003, 6, 12), M.stoneD, 0, 0.043, 0.002));
      g.add(L);
    });
    return g;
  }

  /* ---------- banyan ---------- */
  function banyan() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.13, 8), M.wood, 0, 0.065, 0));
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.03 + Math.random() * 0.06, h = 0.07 + Math.random() * 0.06;
      g.add(mesh(new THREE.CylinderGeometry(0.0012, 0.0012, h, 4), M.woodD, Math.cos(a) * r, h / 2, Math.sin(a) * r));
    }
    const mats = [M.greenD, M.green, M.greenL];
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random());
      const leaf = mesh(new THREE.IcosahedronGeometry(0.03 + Math.random() * 0.025, 0), mats[i % 3 === 0 ? 0 : i % 3],
        Math.cos(a) * 0.09 * d, 0.15 + Math.random() * 0.05 + (1 - d) * 0.03, Math.sin(a) * 0.07 * d);
      leaf.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      g.add(leaf);
    }
    return g;
  }

  /* ---------- qilou house ---------- */
  function house(w, h, d, wall, accent) {
    const g = new THREE.Group();
    const face = std('#ffffff', { map: TEX.facade(wall, accent) }), roofM = std(COL.paperD);
    g.add(box(w, h, d, [face, face, roofM, roofM, face, face], 0, 0, 0));
    g.add(box(w + 0.004, 0.008, d + 0.004, std(COL.paperD), 0, h, 0));
    if (Math.random() < 0.7) {
      g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.016, 12), std('#DAD4C8', { roughness: 0.5 }), w * 0.2, h + 0.016, -d * 0.1));
    }
    return g;
  }

  /* ---------- market stall ---------- */
  function stall(c1) {
    const g = new THREE.Group();
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.05, 4), M.woodD, sx * 0.025, 0.025, sz * 0.018)));
    const aw = mesh(new THREE.BoxGeometry(0.062, 0.004, 0.046), std('#ffffff', { map: TEX.awning(c1) }), 0, 0.052, 0);
    aw.rotation.x = 0.18; g.add(aw);
    g.add(box(0.05, 0.02, 0.03, M.wood, 0, 0, 0));
    const fruit = [COL.gold, '#E58A2E', COL.green, COL.red];
    for (let i = 0; i < 8; i++) g.add(mesh(new THREE.SphereGeometry(0.0045, 8, 6), std(fruit[i % 4], { roughness: 0.5 }), -0.018 + (i % 4) * 0.012, 0.024, -0.006 + Math.floor(i / 4) * 0.012));
    return g;
  }

  /* ---------- floating gold markers (the "map light points") ---------- */
  function marker(color) {
    const g = new THREE.Group();
    const gem = mesh(new THREE.OctahedronGeometry(0.014, 0), std(color, { metalness: 0.5, roughness: 0.3, emissive: color, emissiveIntensity: 0.35 }));
    gem.scale.set(1, 1.4, 1); g.add(gem);
    const ring = mesh(new THREE.TorusGeometry(0.02, 0.0025, 6, 24), M.goldL);
    ring.rotation.x = Math.PI / 2; g.add(ring);
    return g;
  }

  const root = new THREE.Group();
  const parts = [];
  const add = (obj, x, z, delay, ry = 0) => { obj.position.set(x, 0, z); obj.rotation.y = ry; obj.scale.setScalar(0.0001); root.add(obj); parts.push({ obj, delay }); return obj; };

  // lights (scene default lights are switched off in ar.js)
  root.add(new THREE.HemisphereLight('#FFF3DC', '#5A4430', 0.55));
  const sun = new THREE.DirectionalLight('#FFE9C4', 0.95); sun.position.set(0.7, 1.1, 0.9); root.add(sun);
  if (shadows) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.002;
    Object.assign(sun.shadow.camera, { left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.1, far: 3 });
  }
  const fill = new THREE.DirectionalLight('#CDE8E5', 0.25); fill.position.set(-0.8, 0.6, -0.4); root.add(fill);

  // museum plinth: paper top, wood sides, gold trim
  const plinth = new THREE.Group();
  plinth.add(box(0.94, 0.02, 0.62, M.wood, 0, -0.02, 0));
  plinth.add(box(0.92, 0.004, 0.6, std('#ffffff', { map: TEX.paper() }), 0, 0, 0));
  [[0.94, 0.004, 0.006, 0, 0.31], [0.94, 0.004, 0.006, 0, -0.31], [0.006, 0.004, 0.62, 0.47, 0], [0.006, 0.004, 0.62, -0.47, 0]]
    .forEach(([w, h, d, x, z]) => plinth.add(box(w, h, d, M.gold, x, 0, z)));
  add(plinth, 0, 0, 0);

  // ground: fields (left), canal, road, grass
  const ground = new THREE.Group();
  const fieldMat = std('#ffffff', { map: TEX.field() });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const f = mesh(new THREE.PlaneGeometry(0.085, 0.085), fieldMat, -0.4 + i * 0.09, 0.006, -0.17 + j * 0.09);
    f.rotation.x = -Math.PI / 2; ground.add(f);
  }
  const canal = mesh(new THREE.PlaneGeometry(0.03, 0.56), M.water, -0.12, 0.007, 0); canal.rotation.x = -Math.PI / 2; ground.add(canal);
  const road1 = mesh(new THREE.PlaneGeometry(0.06, 0.58), M.asphalt, 0.2, 0.0065, 0); road1.rotation.x = -Math.PI / 2; ground.add(road1);
  const road2 = mesh(new THREE.PlaneGeometry(0.62, 0.05), M.asphalt, 0.16, 0.0066, 0.18); road2.rotation.x = -Math.PI / 2; ground.add(road2);
  const grass = mesh(new THREE.PlaneGeometry(0.28, 0.2), std('#A9C98C'), 0.0, 0.0062, 0.16); grass.rotation.x = -Math.PI / 2; ground.add(grass);
  add(ground, 0, 0, 0.1);

  // shrine at the centre (the hero), banyan behind it, houses, market
  const sh = shrine(); const lanterns = sh.userData.lanterns;
  add(sh, 0.04, 0.03, 0.35);
  add(banyan(), -0.2, -0.05, 0.5);
  // a small street-corner shrine where the two roads meet, facing the street
  const mini = shrine(); mini.scale.setScalar(0.42);
  const miniWrap = new THREE.Group(); miniWrap.add(mini);
  add(miniWrap, 0.285, 0.118, 0.55);
  // qilou houses in two rows behind the shrine, facades towards the viewer (+z = bottom edge of the card)
  const H = [[0.22, -0.2, 0.08, 0.17, '#F3EADA', COL.teal], [0.31, -0.2, 0.08, 0.21, '#EAD9C0', COL.red], [0.4, -0.2, 0.08, 0.15, '#F6EFE2', COL.gold],
             [0.27, -0.08, 0.08, 0.12, '#E9E1CF', COL.green], [0.37, -0.08, 0.09, 0.14, '#F2E2CC', COL.teal], [0.12, -0.22, 0.07, 0.13, '#F3E3CF', COL.red]];
  H.forEach(([x, z, w, h, wall, acc], i) => add(house(w, h, 0.07, wall, acc), x, z, 0.6 + i * 0.07));
  [[-0.26, 0.2, COL.teal], [-0.18, 0.2, COL.red], [-0.34, 0.2, COL.red]].forEach(([x, z, c], i) => add(stall(c), x, z, 0.75 + i * 0.06));
  [[-0.42, -0.24], [0.44, 0.24], [-0.02, 0.26]].forEach(([x, z], i) => {
    const t = new THREE.Group();
    t.add(mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.04, 6), M.wood, 0, 0.02, 0));
    t.add(mesh(new THREE.IcosahedronGeometry(0.028, 0), M.green, 0, 0.055, 0));
    add(t, x, z, 0.85 + i * 0.05);
  });

  // floating markers above the key places (shrine is vermilion, others gold)
  const markers = [];
  if (withMarkers) [[0.04, 0.03, 0.3, COL.red], [-0.32, -0.1, 0.09, COL.gold], [-0.26, 0.2, 0.12, COL.gold], [0.31, -0.2, 0.3, COL.gold], [-0.2, -0.05, 0.3, COL.gold]]
    .forEach(([x, z, y, c], i) => { const m = add(marker(c), x, z, 1.1 + i * 0.08); m.userData.baseY = y; markers.push(m); });

  // the places the P04 pins point at (a little above each one)
  const anchors = {
    temple: new THREE.Vector3(0.04, 0.27, 0.03),
    fields: new THREE.Vector3(-0.32, 0.05, -0.08),
    market: new THREE.Vector3(-0.26, 0.09, 0.2),
    corner: new THREE.Vector3(0.285, 0.13, 0.118),
  };
  if (shadows) root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, parts, markers, lanterns, anchors };
}

/* ---------- your own model (GLB) ----------
   If assets/models/tudigong-neighborhood.glb exists it replaces the built-in model on P02 (AR) and P04 (3D view).
   The file is fitted automatically: centred on the card, scaled to a 0.92 × 0.62 footprint (card = 1 × 0.667),
   lowest point on the card. Each top-level object pops up in turn (largest first). Optional empties named
   pin_temple, pin_fields, pin_market, pin_corner place the P04 info pins. Animation clips in the file loop. */
export const MODEL_URL = 'assets/models/tudigong-neighborhood.glb';
const FOOTPRINT = { x: 0.92, z: 0.62 };
let modelCheck = null;
export function customModelExists() {
  if (!modelCheck) {
    modelCheck = fetch(MODEL_URL, { method: 'HEAD', cache: 'no-cache' })
      .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
      .catch(() => false);
  }
  return modelCheck;
}

function addLights(THREE, root, shadows) {
  root.add(new THREE.HemisphereLight('#FFF3DC', '#5A4430', 0.55));
  const sun = new THREE.DirectionalLight('#FFE9C4', 0.95); sun.position.set(0.7, 1.1, 0.9); root.add(sun);
  if (shadows) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.002;
    Object.assign(sun.shadow.camera, { left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.1, far: 3 });
  }
  const fill = new THREE.DirectionalLight('#CDE8E5', 0.25); fill.position.set(-0.8, 0.6, -0.4); root.add(fill);
}

/**
 * Load the team's GLB and return the same shape as buildNeighborhood().
 * GLTFLoader / DRACOLoader = the classes from the three build in use (A-Frame's THREE, or three/addons).
 */
export async function loadNeighborhoodGLB(THREE, GLTFLoader, DRACOLoader, { shadows = false } = {}) {
  const loader = new GLTFLoader();
  if (DRACOLoader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
    loader.setDRACOLoader(draco);
  }
  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;
  model.traverse((o) => { if (o.isLight || o.isCamera) o.visible = false; });

  // fit: centre on the card, scale to the footprint, sit on the card
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const k = Math.min(FOOTPRINT.x / Math.max(size.x, 1e-6), FOOTPRINT.z / Math.max(size.z, 1e-6));
  const fit = new THREE.Group();
  fit.add(model);
  model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  fit.scale.setScalar(k);

  const root = new THREE.Group();
  addLights(THREE, root, shadows);
  root.add(fit);
  if (shadows) model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // pop-up parts: the top-level objects (skip single wrapper nodes), largest footprint first
  let level = model;
  while (level.children.length === 1 && !level.children[0].isMesh) level = level.children[0];
  const items = level.children.filter((o) => !o.name.startsWith('pin_')).map((obj) => {
    const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
    return { obj, area: s.x * s.z, base: obj.scale.clone() };
  }).sort((a, b) => b.area - a.area);
  const parts = items.map((it, i) => ({ obj: it.obj, delay: i === 0 ? 0 : Math.min(1.4, 0.15 + i * 0.07), base: it.base }));

  // pins: empties named pin_* (world position inside root), else the built-in defaults
  root.updateMatrixWorld(true);
  const anchors = {
    temple: new THREE.Vector3(0.04, 0.27, 0.03), fields: new THREE.Vector3(-0.32, 0.05, -0.08),
    market: new THREE.Vector3(-0.26, 0.09, 0.2), corner: new THREE.Vector3(0.285, 0.13, 0.118),
  };
  model.traverse((o) => {
    const m = o.name.match(/^pin_(temple|fields|market|corner)/i);
    if (m) anchors[m[1].toLowerCase()] = o.getWorldPosition(new THREE.Vector3());
  });

  let mixer = null;
  if (gltf.animations?.length) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  }
  return { root, parts, markers: [], lanterns: [], anchors, mixer, custom: true };
}

/** Animate a built neighbourhood: pop-up entrance, floating markers, swinging lanterns. t = seconds since start. */
export function tickNeighborhood(n, t, { entrance = true } = {}) {
  const ease = (k) => 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * 0.08;   // pop with a small overshoot
  n.parts.forEach(({ obj, delay, base }) => {
    const k = entrance ? Math.min(Math.max((t - delay) / 0.6, 0), 1) : 1;
    const s = Math.max(0.0001, ease(k));
    if (base) obj.scale.set(base.x * s, base.y * s, base.z * s); else obj.scale.setScalar(s);
  });
  n.markers.forEach((m, i) => {
    m.position.y = m.userData.baseY + Math.sin(t * 2 + i) * 0.01;
    m.rotation.y = t * 0.8 + i;
  });
  (n.lanterns || []).forEach((L, i) => { L.rotation.z = Math.sin(t * 1.6 + i * 1.3) * 0.12; });
  if (n.mixer) { n.mixer.update(Math.max(0, Math.min(0.1, t - (n.lastT ?? t)))); n.lastT = t; }
}

/** A-Frame component for the AR view: <a-entity tdg-diorama> inside the mindar-image-target entity. */
export function registerDiorama() {
  const A = window.AFRAME;
  if (!A || A.components['tdg-diorama']) return;
  A.registerComponent('tdg-diorama', {
    init() {
      this.holder = new A.THREE.Group();
      // MindAR's target plane is XY with +Z towards the camera: rotate so our "up" (+Y) stands out of the card.
      this.holder.rotation.x = Math.PI / 2;
      this.el.object3D.add(this.holder);
      this.n = null; this.t0 = null;
      const use = (n) => { if (!this.holder) return; this.n = n; this.holder.add(n.root); this.t0 = null; };
      customModelExists().then((yes) => (yes
        ? loadNeighborhoodGLB(A.THREE, A.THREE.GLTFLoader, A.THREE.DRACOLoader).catch((e) => { console.warn('Own model failed to load, using the built-in one.', e); return buildNeighborhood(A.THREE); })
        : buildNeighborhood(A.THREE))).then(use);
    },
    tick(time) {
      if (!this.n || !this.el.object3D.visible) return;     // still loading, or card not in view
      if (this.t0 === null) this.t0 = time;
      tickNeighborhood(this.n, (time - this.t0) / 1000);
    },
    remove() { this.el.object3D.remove(this.holder); this.holder = null; },
  });
}
