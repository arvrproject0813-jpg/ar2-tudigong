// scenes.js — the 3D scenes behind the P07–P10 art, built from the same parts as the app's neighbourhood
// (js/ar-diorama.js) and the team's model kit. Used only by render.html (offline renders + GLB export).
//
// Each builder gets the parts `h` (see buildNeighborhood: scene) and returns { root, anchors?, info? }.
// Units: about 1 = the width of the culture card. +Y up, +Z towards the viewer.
//
// Cultural rules (storyboard Object Usage Rules): shrine architecture, the offering table (observation only), stone
// lions and the old tree. No deity statue close-up (the P07 shrine has an empty, shaded niche), no incense burner,
// moon blocks or plaque text, no smoke, glow or light rays. No fuchang is modelled. The Bogong shrine (P10) is the
// team's conceptual model, shown with a caption that it is not a copy of a real shrine.
//
// TEAM: the team's Phase II models (Tripo, made web-ready with gltf-transform and turned so their front faces +Z).
// render.html loads them into the kit, so builders use them like kit pieces: h.kitPiece('tSchool', { width }).
export const TEAM = {
  tTable: 'assets/models/p07/table.glb', tStand: 'assets/models/p07/stand.glb',
  tSchool: 'assets/models/p08/school.glb', tHomes: 'assets/models/p08/homes.glb', tMarket: 'assets/models/p08/market.glb', tOldStreet: 'assets/models/p08/oldstreet.glb',
  tCalendar: 'assets/models/p09/calendar.glb', tStorefront: 'assets/models/p09/storefront.glb', tWeiya: 'assets/models/p09/weiya.glb',
  tMeinong: 'assets/models/p10/meinong.glb', tBarn: 'assets/models/p10/barn.glb', tBogong: 'assets/models/p10/bogong.glb',
};

/* ---------- small helpers ---------- */
const lightsDay = (h, g, { warm = 1, sun = [0.6, 1.0, 0.8] } = {}) => {
  const { THREE, shadows } = h;
  g.add(new THREE.HemisphereLight('#FFF4E0', '#6A5638', 0.62));
  const s = new THREE.DirectionalLight(warm > 1 ? '#FFDDB0' : '#FFE6BF', 1.0); s.position.set(...sun); g.add(s);
  if (shadows) {
    s.castShadow = true; s.shadow.mapSize.set(4096, 4096); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.002;
    Object.assign(s.shadow.camera, { left: -0.9, right: 0.9, top: 0.9, bottom: -0.9, near: 0.05, far: 4 });
  }
  const f = new THREE.DirectionalLight('#CFE6E3', 0.3); f.position.set(-0.8, 0.6, -0.4); g.add(f);
};
const at = (g, obj, x, z, ry = 0, sc = 1, y = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; obj.scale.setScalar(sc); g.add(obj); return obj; };
const flat = (h, g, geo, mat, x, z, y = 0.0045) => { const m = h.mesh(geo, mat, x, y, z); m.rotation.x = -Math.PI / 2; g.add(m); return m; };

/* a round museum plinth: wood drum, paved top, gold rim (same as the P05 places) */
function roundPlinth(h, g, r, top) {
  const { THREE, M, mesh, std, TEX } = h;
  g.add(mesh(new THREE.CylinderGeometry(r + 0.006, r + 0.012, 0.024, 72), M.wood, 0, -0.012, 0));
  g.add(mesh(new THREE.CylinderGeometry(r, r, 0.004, 72), top || std('#ffffff', { map: TEX.paving(), roughness: 0.9 }), 0, 0.002, 0));
  const rim = mesh(new THREE.TorusGeometry(r + 0.003, 0.0032, 8, 120), M.gold, 0, 0.002, 0); rim.rotation.x = Math.PI / 2; g.add(rim);
}

/* ---------- the offering table (供桌): lacquered red wood, carved gold apron, a red table skirt. Always EMPTY. ---------- */
export function offeringTable(h, width = 0.3) {
  const { THREE, std, mesh, box, canvasTex, speckle } = h;
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  // real proportions (metres), scaled to `width` at the end
  const L = 1.5, D = 0.62, H = 0.86;
  const lacquer = std('#6A2216', { roughness: 0.38, metalness: 0.05 });
  const lacquerR = std('#8E2A1B', { roughness: 0.42 });
  const gold = std('#C9952E', { metalness: 0.55, roughness: 0.32, emissive: '#5A3C08', emissiveIntensity: 0.25 });
  // carved apron: gold scrolls on red, framed
  const carve = canvasTex(512, 64, (c, w, hh) => {
    c.fillStyle = '#8E2A1B'; c.fillRect(0, 0, w, hh);
    c.strokeStyle = '#D9A93E'; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, hh - 8);
    c.lineWidth = 2.4;
    for (let x = 30; x < w - 20; x += 60) {
      c.beginPath(); c.arc(x, hh / 2, 11, Math.PI * 0.2, Math.PI * 1.75); c.stroke();
      c.beginPath(); c.arc(x, hh / 2, 5, Math.PI * 1.2, Math.PI * 2.6); c.stroke();
      c.beginPath(); c.moveTo(x + 9, hh / 2 - 7); c.bezierCurveTo(x + 22, hh / 2 - 18, x + 36, hh / 2 + 16, x + 49, hh / 2 + 2); c.stroke();
    }
    speckle(c, w, hh, 0.08, '40,10,5', 12);
  });
  // table skirt (桌裙): red silk, gold borders, a cloud medallion and corner flowers (no writing)
  const skirt = canvasTex(512, 256, (c, w, hh) => {
    const gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#B8321F'); gr.addColorStop(1, '#94241A');
    c.fillStyle = gr; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#E2B34E'; c.fillRect(0, 0, w, 22); c.fillRect(0, hh - 18, w, 18);
    c.fillStyle = '#94241A'; for (let x = 6; x < w; x += 16) c.fillRect(x, 6, 8, 10);   // a woven band
    c.strokeStyle = '#E8BD5A'; c.lineWidth = 3; c.strokeRect(14, 34, w - 28, hh - 62);
    // cloud medallion
    const cx = w / 2, cy = hh / 2 + 6;
    c.lineWidth = 4; c.strokeStyle = '#F0CF7A';
    c.beginPath(); c.ellipse(cx, cy, 64, 48, 0, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3;
    [[-26, 4, 16], [0, -10, 20], [26, 4, 16]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(cx + dx, cy + dy, r, Math.PI * 0.95, Math.PI * 2.05); c.stroke(); c.beginPath(); c.arc(cx + dx, cy + dy, r * 0.45, Math.PI, Math.PI * 2.4); c.stroke(); });
    c.beginPath(); c.moveTo(cx - 44, cy + 16); c.lineTo(cx + 44, cy + 16); c.stroke();
    // corner flowers
    [[46, 62], [w - 46, 62], [46, hh - 54], [w - 46, hh - 54]].forEach(([x, y]) => {
      c.fillStyle = '#F0CF7A';
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; c.beginPath(); c.ellipse(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, 4, a, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#B8321F'; c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill();
    });
    // fringe
    c.strokeStyle = '#E2B34E'; c.lineWidth = 2; for (let x = 2; x < w; x += 6) { c.beginPath(); c.moveTo(x, hh - 18); c.lineTo(x, hh); c.stroke(); }
    speckle(c, w, hh, 0.07, '60,10,5', 10);
  });
  // top slab with a gold edge
  inner.add(box(L + 0.06, 0.06, D + 0.06, lacquer, 0, H - 0.06, 0));
  [[L + 0.07, 0.012, 0.012, 0, H - 0.035, (D + 0.06) / 2], [L + 0.07, 0.012, 0.012, 0, H - 0.035, -(D + 0.06) / 2]].forEach(([w, hh, d, x, y, z]) => inner.add(box(w, hh, d, gold, x, y, z)));
  [-1, 1].forEach((s) => inner.add(box(0.012, 0.012, D + 0.07, gold, s * (L + 0.06) / 2, H - 0.035, 0)));
  // carved apron, front and sides
  const apronMat = std('#ffffff', { map: carve, roughness: 0.45 });
  inner.add(box(L - 0.04, 0.14, 0.03, [lacquerR, lacquerR, lacquerR, lacquerR, apronMat, lacquerR], 0, H - 0.2, D / 2 - 0.02));
  inner.add(box(L - 0.04, 0.14, 0.03, lacquerR, 0, H - 0.2, -D / 2 + 0.02));
  [-1, 1].forEach((s) => inner.add(box(0.03, 0.14, D - 0.04, [apronMat, apronMat, lacquerR, lacquerR, lacquerR, lacquerR], s * (L / 2 - 0.02), H - 0.2, 0)));
  // legs with hoof feet and a gold ring, low stretchers
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const x = sx * (L / 2 - 0.06), z = sz * (D / 2 - 0.06);
    inner.add(box(0.075, H - 0.12, 0.075, lacquer, x, 0.06, z));
    inner.add(box(0.1, 0.06, 0.1, lacquer, x + sx * 0.008, 0, z + sz * 0.008));
    inner.add(box(0.086, 0.016, 0.086, gold, x, 0.07, z));
  });
  inner.add(box(L - 0.14, 0.04, 0.04, lacquer, 0, 0.13, -(D / 2 - 0.06)));
  [-1, 1].forEach((s) => inner.add(box(0.04, 0.04, D - 0.14, lacquer, s * (L / 2 - 0.06), 0.13, 0)));
  // the skirt hangs from the front edge in soft folds
  const sg = new THREE.PlaneGeometry(L - 0.02, H - 0.2, 48, 8);
  const sp = sg.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i), drop = (0.5 - (y / (H - 0.2))) ;        // 0 at the top … 1 at the bottom
    sp.setZ(i, Math.sin(x * 26) * 0.012 * (0.3 + drop) + drop * 0.02);
  }
  sg.computeVertexNormals();
  const sk = new THREE.Mesh(sg, std('#ffffff', { map: skirt, roughness: 0.75, side: THREE.DoubleSide }));
  sk.position.set(0, (H - 0.2) / 2 + 0.06, D / 2 + 0.03); inner.add(sk);
  inner.scale.setScalar(width / (L + 0.06));
  return g;
}

/* ---------- a pair of stone lions (the kit lion stands on its own carved base; the second one is its mirror image) ---------- */
function lionPair(h, height = 0.17, gap = 0.17, turn = 0.3) {
  const { THREE, kitPiece } = h;
  const g = new THREE.Group();
  [-1, 1].forEach((s) => {
    const lion = kitPiece('lion', { height });
    if (s > 0) lion.kitInner.scale.x *= -1;
    lion.position.set(s * gap / 2, 0, 0); lion.rotation.y = -s * turn;   // turned a little towards each other
    g.add(lion);
  });
  return g;
}

/* ---------- the old banyan with a stone ring and stools where neighbours sit ---------- */
function banyanSeat(h, width = 0.34, withRing = true) {
  const { THREE, kitBanyan, std, mesh } = h;
  const g = new THREE.Group();
  const t = kitBanyan(width); g.add(t);
  if (withRing) {
    const stone = std('#B5AB98', { roughness: 0.95 });
    const ring = mesh(new THREE.TorusGeometry(width * 0.16, width * 0.018, 8, 48), stone, 0, width * 0.018, 0); ring.rotation.x = Math.PI / 2; g.add(ring);
    [[0.62, 0.34], [0.2, 0.42], [-0.45, 0.33]].forEach(([a, r]) => g.add(mesh(new THREE.CylinderGeometry(width * 0.035, width * 0.04, width * 0.05, 16), stone, Math.cos(a + 1.2) * width * r, width * 0.025, Math.sin(a + 1.2) * width * r)));
  }
  return g;
}

/* ================= P07: the four exhibits and the landscape they make together ================= */
// an exhibit on the team's museum display stand (the stand's top is `top` wide; the object stands on it)
function onStand(h, obj, top) {
  const g = new h.THREE.Group();
  const stand = h.kitPiece('tStand', { width: top });
  stand.updateMatrixWorld(true);
  const H = new h.THREE.Box3().setFromObject(stand).max.y;
  g.add(stand);
  obj.position.y = H - 0.002; g.add(obj);
  g.userData.standH = H;
  return g;
}
export const P07 = {
  temple: (h) => { const g = new h.THREE.Group(); g.add(onStand(h, h.kitShrine(0.3, { lions: false, burner: false, statue: false }), 0.36)); return { root: g }; },
  table: (h) => { const g = new h.THREE.Group(); g.add(onStand(h, h.kitPiece('tTable', { width: 0.34 }), 0.38)); return { root: g }; },
  lions: (h) => { const g = new h.THREE.Group(); g.add(onStand(h, lionPair(h), 0.33)); return { root: g }; },
  tree: (h) => { const g = new h.THREE.Group(); g.add(onStand(h, banyanSeat(h, 0.36), 0.42)); return { root: g }; },
  // for AR: the team's offering table on its own
  tableAR: (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tTable', { width: 0.34 })); return { root: g }; },
  // all four together on a round plinth: the small temple, the table in front, lions at the front corners, the banyan beside it
  landscape: (h) => {
    const { THREE } = h; const g = new THREE.Group();
    lightsDay(h, g);
    roundPlinth(h, g, 0.24);
    at(g, h.kitShrine(0.2, { lions: false, burner: false, statue: false }), 0.03, -0.06);
    at(g, h.kitPiece('tTable', { width: 0.11 }), 0.03, 0.062);
    at(g, lionPair(h, 0.052, 0.2, 0.15), 0.03, 0.115);
    at(g, banyanSeat(h, 0.26), -0.14, -0.08);
    at(g, h.smallTree(), 0.19, -0.13, 0, 1.2);
    // two neighbours chatting under the tree
    at(g, h.person('#3F6F8F'), -0.1, 0.07, 2.4, 1.7); at(g, h.person('#F2C9C0'), -0.06, 0.09, -0.6, 1.7);
    return { root: g };
  },
};

/* ================= P08: a Kaohsiung neighbourhood board with six empty lots, and the six places that fill them =================
   The board and every place are drawn with the SAME orthographic camera (no perspective), so a place drawn at the
   origin lines up with any lot: the page just moves it. Lots: 3 columns × 2 rows, 0.17 × 0.17 each. */
export const P08_LOTS = [[-0.42, -0.135], [0, -0.135], [0.42, -0.135], [-0.42, 0.215], [0, 0.215], [0.42, 0.215]];
export const P08_LOT = 0.17;
const P08_ROADS = { main: 0.025, west: -0.21, east: 0.21 };

function lotPad(h, { grass = false, size = P08_LOT + 0.012 } = {}) {
  const { THREE, std, TEX, box } = h;
  const pad = box(size, 0.006, size, grass ? std('#ffffff', { map: TEX.grass(), roughness: 0.95 }) : std('#ffffff', { map: TEX.paving(), roughness: 0.9 }), 0, 0, 0);
  return pad;
}

// a 3-storey school: corridors along the front, a stair tower, a running track in front, a flagpole (no flag)
function school(h) {
  const { THREE, std, box, mesh, canvasTex, speckle } = h;
  const g = new THREE.Group();
  const face = canvasTex(512, 160, (c, w, hh) => {
    c.fillStyle = '#F1E6D2'; c.fillRect(0, 0, w, hh);
    for (let f = 0; f < 3; f++) {
      const y = 10 + f * 50;
      c.fillStyle = '#B8573C'; c.fillRect(0, y + 36, w, 8);                       // brick-tile band under each corridor
      c.fillStyle = '#FFFFFF'; c.fillRect(0, y + 30, w, 6);                       // corridor railing
      for (let x = 10; x < w - 10; x += 34) {
        const gl = c.createLinearGradient(x, y, x + 24, y + 26); gl.addColorStop(0, '#A9CFCB'); gl.addColorStop(1, '#4F7C78');
        c.fillStyle = gl; c.fillRect(x, y + 4, 24, 24);
        c.strokeStyle = '#1F6B66'; c.lineWidth = 2; c.strokeRect(x, y + 4, 24, 24);
      }
    }
    speckle(c, w, hh, 0.06, '90,70,50', 10);
  });
  const side = std('#EADCC2', { roughness: 0.9 });
  const faceM = std('#ffffff', { map: face, roughness: 0.85 });
  g.add(box(0.15, 0.075, 0.045, [side, side, std('#DCD2BE'), side, faceM, side], 0, 0.006, -0.05));
  g.add(box(0.154, 0.006, 0.049, std('#C9BDA5'), 0, 0.081, -0.05));                     // parapet
  // stair tower with a small red-tile roof and a clock (no numbers)
  g.add(box(0.034, 0.096, 0.05, side, -0.045, 0.006, -0.048));
  const roof = new THREE.Shape(); roof.moveTo(-0.022, 0); roof.lineTo(0, 0.016); roof.lineTo(0.022, 0); roof.lineTo(-0.022, 0);
  const rg = new THREE.ExtrudeGeometry(roof, { depth: 0.056, bevelEnabled: false }); rg.translate(0, 0, -0.028);
  const rm = new THREE.Mesh(rg, std('#B4583A', { map: h.TEX.tiles(), roughness: 0.75 })); rm.position.set(-0.045, 0.102, -0.048); g.add(rm);
  const clock = mesh(new THREE.CircleGeometry(0.008, 24), std('#FFFBF3', { roughness: 0.5 }), -0.045, 0.084, -0.0225); g.add(clock);
  const ring = mesh(new THREE.TorusGeometry(0.008, 0.0012, 6, 24), std('#C9952E', { metalness: 0.5, roughness: 0.35 }), -0.045, 0.084, -0.022); g.add(ring);
  // sports ground with a running track
  const track = canvasTex(256, 128, (c, w, hh) => {
    c.fillStyle = '#B8573C'; c.beginPath(); c.roundRect(4, 4, w - 8, hh - 8, 56); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6;
    [10, 18, 26].forEach((k) => { c.beginPath(); c.roundRect(4 + k, 4 + k, w - 8 - 2 * k, hh - 8 - 2 * k, 56 - k); c.stroke(); });
    c.fillStyle = '#8DBA67'; c.beginPath(); c.roundRect(34, 34, w - 68, hh - 68, 30); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(w / 2, 34); c.lineTo(w / 2, hh - 34); c.stroke();
  });
  const tr = mesh(new THREE.PlaneGeometry(0.15, 0.075), std('#ffffff', { map: track, roughness: 0.9, transparent: true }), 0, 0.0066, 0.035); tr.rotation.x = -Math.PI / 2; g.add(tr);
  g.add(mesh(new THREE.CylinderGeometry(0.0011, 0.0013, 0.09, 6), std('#B7B4AC', { metalness: 0.4, roughness: 0.4 }), 0.066, 0.051, -0.012));
  g.add(mesh(new THREE.SphereGeometry(0.0025, 8, 6), std('#C9952E', { metalness: 0.5, roughness: 0.35 }), 0.066, 0.097, -0.012));
  [[-0.066, -0.004], [0.04, 0.072], [-0.06, 0.07]].forEach(([x, z], i) => at(g, h.smallTree(), x, z, i, 0.9));
  [[-0.02, 0.03, '#3F6F8F'], [0.025, 0.045, '#F3DE9A'], [0.03, 0.02, '#F2C9C0']].forEach(([x, z, c], i) => at(g, h.person(c), x, z, i * 2, 1.5, 0.006));
  return g;
}

export const P08 = {
  board: (h) => {
    const { THREE, std, TEX, mesh, box, M } = h;
    const g = new THREE.Group();
    lightsDay(h, g, { sun: [0.55, 1.0, 0.6] });
    // plinth
    g.add(box(1.24, 0.03, 0.84, M.wood, 0, -0.03, 0));
    g.add(box(1.22, 0.004, 0.82, std('#ffffff', { map: TEX.paving(), roughness: 0.9 }), 0, 0, 0));
    [[1.24, 0.004, 0.006, 0, 0.42], [1.24, 0.004, 0.006, 0, -0.42], [0.006, 0.004, 0.84, 0.62, 0], [0.006, 0.004, 0.84, -0.62, 0]]
      .forEach(([w, hh, d, x, z]) => g.add(box(w, hh, d, M.gold, x, 0, z)));
    // the harbour along the back: water, a stone quay, gantry cranes and a container ship (a hint of Kaohsiung)
    const sea = std('#ffffff', { map: TEX.water(), roughness: 0.25, emissive: '#1F6B66', emissiveIntensity: 0.08 });
    flat(h, g, new THREE.PlaneGeometry(1.22, 0.095), sea, 0, -0.364, 0.0046);
    g.add(box(1.22, 0.008, 0.016, std('#B9B2A4', { roughness: 0.9 }), 0, 0, -0.31));
    const craneM = std('#D96B3C', { roughness: 0.6 }), craneW = std('#F3EADA', { roughness: 0.6 });
    [0.12, 0.3, 0.48].forEach((x) => {
      const c = new THREE.Group();
      [-1, 1].forEach((s) => { c.add(box(0.005, 0.11, 0.005, craneM, s * 0.022, 0, -0.012)); c.add(box(0.005, 0.11, 0.005, craneM, s * 0.022, 0, 0.012)); });
      c.add(box(0.05, 0.008, 0.03, craneM, 0, 0.11, 0));
      c.add(box(0.006, 0.006, 0.16, craneW, 0, 0.118, -0.03));                   // the boom reaching over the water
      c.add(box(0.012, 0.012, 0.016, craneW, 0, 0.124, 0.004));
      at(g, c, x, -0.325);
    });
    const ship = new THREE.Group();
    ship.add(box(0.34, 0.016, 0.06, std('#7E3A2A', { roughness: 0.7 }), 0, 0, 0));
    ship.add(box(0.34, 0.004, 0.06, std('#E9E1CF'), 0, 0.016, 0));
    const cc = ['#1F6B66', '#B23A27', '#E1B655', '#2F8C88', '#C9C6BF', '#D96B3C'];
    for (let i = 0; i < 9; i++) for (let k = 0; k < 2; k++) ship.add(box(0.028, 0.012, 0.024, std(cc[(i + k * 2) % cc.length], { roughness: 0.7 }), -0.13 + i * 0.031, 0.02 + k * 0.012, (k ? 0.0 : 0.0) + ((i % 2) ? 0.012 : -0.012)));
    ship.add(box(0.03, 0.04, 0.05, std('#F3EADA'), 0.15, 0.02, 0));
    at(g, ship, -0.32, -0.37);
    // a canal along the west edge (into the harbour), with a little bridge for the main road
    const canal = std('#ffffff', { map: TEX.water(), roughness: 0.2, emissive: '#1F6B66', emissiveIntensity: 0.08 });
    flat(h, g, new THREE.PlaneGeometry(0.04, 0.73), canal, -0.565, 0.045, 0.0052);
    [-1, 1].forEach((s) => g.add(box(0.004, 0.006, 0.73, M.stoneD, -0.565 + s * 0.022, 0, 0.045)));
    // roads (the team's road tiles): the main road east–west, two streets north–south
    if (h.kit) {
      h.tileRoad('x', P08_ROADS.main, -0.61, 0.61, 0.05, [[P08_ROADS.west - 0.025, P08_ROADS.west + 0.025], [P08_ROADS.east - 0.025, P08_ROADS.east + 0.025]]);
      h.tileRoad('z', P08_ROADS.west, -0.30, 0.41, 0.045, [[0, 0.05]]);
      h.tileRoad('z', P08_ROADS.east, -0.30, 0.41, 0.045, [[0, 0.05]]);
      h.tileCrossing(P08_ROADS.west, P08_ROADS.main, 0.045, 0.05); h.tileCrossing(P08_ROADS.east, P08_ROADS.main, 0.045, 0.05);
      g.add(h.roadsG);
    }
    g.add(box(0.05, 0.006, 0.07, M.stone, -0.565, 0.006, P08_ROADS.main));              // bridge over the canal
    // zebra crossings
    const zebra = std('#F4F0E6', { roughness: 0.8 });
    [P08_ROADS.west, P08_ROADS.east].forEach((x) => { for (let i = 0; i < 4; i++) g.add(box(0.036, 0.0012, 0.006, zebra, x, 0.0072, 0.065 + i * 0.011)); });
    // the six empty lots: pale paving with a dashed gold edge
    const lotTex = h.canvasTex(256, 256, (c, w, hh) => {
      c.fillStyle = '#F6EEDF'; c.fillRect(0, 0, w, hh);
      h.speckle(c, w, hh, 0.07, '90,70,45', 6);
      c.strokeStyle = '#C9952E'; c.lineWidth = 7; c.setLineDash([22, 14]); c.strokeRect(10, 10, w - 20, hh - 20);
    });
    P08_LOTS.forEach(([x, z]) => g.add(box(P08_LOT, 0.004, P08_LOT, std('#ffffff', { map: lotTex, roughness: 0.9 }), x, 0.004, z)));
    // harbour sheds along the quay, a green strip with trees along the front, a few homes along the east edge
    [[-0.47, 0.09], [-0.3, 0.07], [-0.06, 0.08]].forEach(([x, w], i) => {
      g.add(box(w, 0.022, 0.05, std(['#C9C6BF', '#D8CFC0', '#BFC8C4'][i], { roughness: 0.85 }), x, 0.004, -0.27));
      g.add(box(w + 0.004, 0.004, 0.054, std(['#2F8C88', '#B4583A', '#1F6B66'][i], { roughness: 0.7 }), x, 0.026, -0.27));
    });
    const grassM = std('#ffffff', { map: TEX.grass(), roughness: 0.95 });
    flat(h, g, new THREE.PlaneGeometry(1.1, 0.06), grassM, 0.02, 0.375, 0.0047);
    [[0.565, -0.16, 0.06, 0.1, '#F3EADA', h.COL.teal], [0.565, 0.2, 0.06, 0.085, '#EAD9C0', h.COL.red], [0.565, 0.31, 0.06, 0.07, '#F6EFE2', h.COL.gold]]
      .forEach(([x, z, w, hh, wall, acc]) => at(g, h.house(w, hh, 0.07, wall, acc), x, z, -Math.PI / 2));
    // trees, lamps and parked scooters along the streets (never on a lot)
    [[-0.27, -0.25], [-0.27, -0.03], [-0.27, 0.12], [-0.27, 0.36], [0.15, -0.25], [0.15, 0.36], [0.27, -0.03], [0.27, 0.12], [0.27, 0.36], [-0.15, 0.36], [0.56, 0.37], [-0.51, 0.37], [0.56, -0.26], [-0.12, -0.27]]
      .forEach(([x, z], i) => at(g, h.smallTree(), x, z, i, 1.0));
    [[-0.3, 0.055], [0.3, 0.055], [-0.1, -0.005], [0.12, 0.055], [0.52, -0.005]].forEach(([x, z]) => at(g, h.lamp(), x, z));
    const sc = ['#F3F1EC', '#B23A27', '#2F8C88', '#E1B655'];
    [[-0.36, 0.06, Math.PI / 2], [-0.34, 0.06, Math.PI / 2], [0.36, -0.01, Math.PI / 2], [0.06, 0.06, Math.PI / 2], [-0.5, -0.01, Math.PI / 2]].forEach(([x, z, r], i) => at(g, h.scooter(sc[i % 4]), x, z, r, 1.5));
    [[-0.12, 0.06], [0.33, -0.01], [-0.24, 0.3], [0.24, -0.2]].forEach(([x, z], i) => at(g, h.person(['#3F6F8F', '#F2C9C0', '#F3DE9A', '#B9D3A4'][i]), x, z, i * 1.7, 1.6));
    return { root: g };
  },
  // the six places, each built at the origin on its own pad (the pad hides the lot's dashed edge)
  // the team's models: school building, townhouses, market, old town (front to +Z, fitted to the lot)
  school: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h));
    at(g, h.kitPiece('tSchool', { width: 0.166 }), 0, -0.004, 0, 1, 0.006);
    return { root: g };
  },
  homes: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h));
    at(g, h.kitPiece('tHomes', { width: 0.15 }), 0, -0.024, 0, 1, 0.006);
    [[-0.058, 0.06], [-0.043, 0.062], [0.052, 0.064]].forEach(([x, z], i) => at(g, h.scooter(['#F3F1EC', '#2F8C88', '#B23A27'][i]), x, z, 0, 1.4, 0.006));
    at(g, h.person('#F2C9C0'), 0.012, 0.064, 0.5, 1.6, 0.006);
    return { root: g };
  },
  market: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h));
    at(g, h.kitPiece('tMarket', { width: 0.166 }), 0, -0.034, 0, 1, 0.006);
    [[-0.045, 0.035, '#3F6F8F'], [0.0, 0.06, '#F3DE9A'], [-0.065, 0.06, '#B9D3A4'], [0.04, 0.03, '#F2C9C0'], [0.062, 0.058, '#CFE3EA']]
      .forEach(([x, z, c], i) => at(g, h.person(c), x, z, i * 1.9 + 3, 1.6, 0.006));
    return { root: g };
  },
  park: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h, { grass: true }));
    const path = h.std('#ffffff', { map: h.TEX.paving(), roughness: 0.9 });
    flat(h, g, new h.THREE.CircleGeometry(0.04, 40), path, 0, 0, 0.0068);
    flat(h, g, new h.THREE.PlaneGeometry(0.022, 0.07), path, 0, 0.055, 0.0068);
    at(g, h.kitBanyan(0.14), 0, -0.01, 0, 1, 0.006);
    [[-0.065, -0.06], [0.065, -0.06], [0.065, 0.06]].forEach(([x, z], i) => at(g, h.smallTree(), x, z, i, 0.9, 0.006));
    [[-0.045, 0.05, 0.4], [0.045, 0.05, -0.4]].forEach(([x, z, r]) => {
      const b = new h.THREE.Group();
      b.add(h.box(0.03, 0.003, 0.009, h.M.wood, 0, 0.008, 0)); b.add(h.box(0.03, 0.008, 0.002, h.M.wood, 0, 0.011, -0.004));
      [-1, 1].forEach((s) => b.add(h.box(0.002, 0.008, 0.008, h.M.woodD, s * 0.012, 0, 0)));
      at(g, b, x, z, r, 1, 0.006);
    });
    at(g, h.person('#3F6F8F'), -0.03, 0.035, 2.4, 1.5, 0.006); at(g, h.person('#F2C9C0'), 0.02, 0.03, -0.8, 1.5, 0.006);
    return { root: g };
  },
  temple: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h));
    at(g, h.kitShrine(0.075, { burner: false, statue: false }), 0, -0.03, 0, 1, 0.006);
    at(g, h.kitPiece('tTable', { width: 0.032 }), 0, 0.012, 0, 1, 0.006);
    at(g, banyanSeat(h, 0.09, false), -0.055, -0.045, 0, 1, 0.006);
    at(g, h.smallTree(), 0.06, -0.05, 2, 0.85, 0.006);
    at(g, h.person('#B9D3A4'), 0.045, 0.045, -0.6, 1.5, 0.006); at(g, h.person('#3F6F8F'), 0.03, 0.06, 2.6, 1.5, 0.006);
    return { root: g };
  },
  oldStreet: (h) => {
    const g = new h.THREE.Group(); lightsDay(h, g, { sun: [0.55, 1.0, 0.6] }); g.add(lotPad(h));
    at(g, h.kitPiece('tOldStreet', { width: 0.166 }), 0, -0.034, 0, 1, 0.006);
    [[-0.05, 0.045], [-0.035, 0.045], [0.06, 0.05]].forEach(([x, z], i) => at(g, h.scooter(['#E1B655', '#F3F1EC', '#B23A27'][i]), x, z, 0, 1.4, 0.006));
    [[0.0, 0.04, '#F2C9C0'], [0.02, 0.055, '#3F6F8F']].forEach(([x, z, c], i) => at(g, h.person(c), x, z, i * 2.2, 1.6, 0.006));
    return { root: g };
  },
};


/* ================= P09: a shopping street of family businesses, and a year-end (Weiya) company meal ================= */
function banquetTable(h, { seats = 8, guests = [] } = {}) {
  const { THREE, std, mesh, box } = h;
  const g = new THREE.Group();
  const cloth = std('#B8321F', { roughness: 0.8 }), white = std('#FFFBF3', { roughness: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(0.062, 0.066, 0.034, 40), cloth, 0, 0.017, 0));            // table with its red cloth
  g.add(mesh(new THREE.CylinderGeometry(0.063, 0.063, 0.002, 40), std('#C9952E', { metalness: 0.4, roughness: 0.4 }), 0, 0.029, 0));   // gold hem
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.002, 40), white, 0, 0.035, 0));              // tabletop
  g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.003, 40), std('#E9E4DA', { roughness: 0.25 }), 0, 0.0375, 0));   // lazy Susan
  // shared dishes on the lazy Susan: a fish, greens, shrimp, buns and a soup pot
  const dish = (x, z, food, r = 0.009) => { g.add(mesh(new THREE.CylinderGeometry(r, r * 0.8, 0.002, 20), white, x, 0.0398, z)); g.add(food); food.position.x += x; food.position.z += z; };
  const fish = mesh(new THREE.SphereGeometry(0.007, 14, 10), std('#D98A3D', { roughness: 0.5 }), 0, 0.042, 0); fish.scale.set(1.6, 0.45, 0.8); dish(-0.016, -0.008, fish, 0.011);
  const greens = mesh(new THREE.SphereGeometry(0.006, 12, 8), std('#5E8F42', { roughness: 0.8 }), 0, 0.041, 0); greens.scale.set(1.2, 0.5, 1.2); dish(0.016, -0.01, greens);
  const shrimp = new THREE.Group(); for (let i = 0; i < 5; i++) shrimp.add(mesh(new THREE.TorusGeometry(0.0022, 0.0011, 5, 10, Math.PI * 1.4), std('#E5683F', { roughness: 0.5 }), Math.cos(i * 1.25) * 0.004, 0.0415, Math.sin(i * 1.25) * 0.004)); dish(0.006, 0.017, shrimp);
  const buns = new THREE.Group(); for (let i = 0; i < 4; i++) buns.add(mesh(new THREE.SphereGeometry(0.0028, 10, 8), std('#F6EEDF', { roughness: 0.7 }), (i % 2 - 0.5) * 0.006, 0.042, (Math.floor(i / 2) - 0.5) * 0.006)); dish(-0.014, 0.014, buns);
  g.add(mesh(new THREE.CylinderGeometry(0.007, 0.006, 0.008, 18), std('#E9E4DA', { roughness: 0.3 }), 0, 0.043, 0));    // soup pot in the middle
  g.add(mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.0012, 18), std('#C98A4A', { roughness: 0.4 }), 0, 0.0472, 0));
  // red banquet chairs, people sitting at most of them, a plate and a teacup at every seat
  const chairM = std('#B23A27', { roughness: 0.6 });
  const cols = ['#3F6F8F', '#F2C9C0', '#F3DE9A', '#B9D3A4', '#CFE3EA', '#7E9FB8', '#E8D5B5', '#C7432C'];
  for (let i = 0; i < seats; i++) {
    const a = i / seats * Math.PI * 2, cx = Math.cos(a), cz = Math.sin(a);
    const chair = new THREE.Group();
    chair.add(box(0.016, 0.003, 0.016, chairM, 0, 0.016, 0));
    chair.add(box(0.016, 0.02, 0.003, chairM, 0, 0.019, -0.0075));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => chair.add(box(0.0018, 0.016, 0.0018, std('#C9952E', { metalness: 0.4, roughness: 0.4 }), sx * 0.0065, 0, sz * 0.0065)));
    chair.position.set(cx * 0.082, 0, cz * 0.082); chair.rotation.y = -a - Math.PI / 2; g.add(chair);
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.005, 0.0012, 16), white, cx * 0.05, 0.0365, cz * 0.05));
    g.add(mesh(new THREE.CylinderGeometry(0.0022, 0.0018, 0.004, 10), white, cx * 0.042, 0.038, cz * 0.042 + 0.008 * cx));
    if (guests.includes(i)) {
      const p = h.person(cols[i % cols.length]); p.scale.setScalar(1.75); p.position.set(cx * 0.084, 0.012, cz * 0.084); p.rotation.y = -a - Math.PI / 2; g.add(p);
    }
  }
  return g;
}

export const P09 = {
  street: (h) => {
    const { THREE, std, TEX } = h; const g = new THREE.Group();
    lightsDay(h, g, { sun: [0.7, 1.0, 0.75] });
    roundPlinth(h, g, 0.23);
    // a pedestrian shopping street: paving in front of the shops (the plinth top)
    // three family shops (the team's storefront model)
    [[-0.135, -0.075, 0.32], [0, -0.1, 0], [0.135, -0.075, -0.32]].forEach(([x, z, r]) => at(g, h.kitPiece('tStorefront', { width: 0.11 }), x, z, r));
    at(g, h.kitPiece('stallFood', { width: 0.055 }), -0.1, 0.03, 0.35);
    at(g, h.kitPiece('stallAcc', { width: 0.055 }), 0.11, 0.035, -0.4);
    const sc = ['#F3F1EC', '#B23A27', '#2F8C88', '#E1B655'];
    [[-0.04, 0.085, Math.PI / 2], [-0.02, 0.085, Math.PI / 2], [0.17, 0.09, Math.PI / 2]].forEach(([x, z, r], i) => at(g, h.scooter(sc[i]), x, z, r, 1.6));
    at(g, h.scooter('#2F8C88'), -0.12, 0.12, -Math.PI / 2, 1.6);
    // shop owners and neighbours chatting
    [[-0.07, 0.04, 2.4, '#3F6F8F'], [-0.05, 0.05, -0.8, '#F2C9C0'], [0.03, 0.02, 0.4, '#F3DE9A'], [0.05, 0.04, 3.4, '#B9D3A4'], [0.15, 0.0, 1.0, '#CFE3EA'], [-0.16, 0.0, 0.3, '#C7432C']]
      .forEach(([x, z, r, c]) => at(g, h.person(c), x, z, r, 1.7));
    at(g, h.lamp(), 0.19, 0.06); at(g, h.lamp(), -0.19, 0.06);
    [[-0.06, -0.02], [0.07, -0.03]].forEach(([x, z]) => at(g, h.pottedPlant(), x, z, 0, 1.6));
    return { root: g };
  },
  meal: (h) => {
    const { THREE, std, mesh, box, canvasTex, speckle } = h; const g = new THREE.Group();
    lightsDay(h, g, { warm: 2, sun: [0.6, 1.0, 0.8] });
    const floor = canvasTex(256, 256, (c, w, hh) => {
      c.fillStyle = '#C9A57A'; c.fillRect(0, 0, w, hh);
      for (let y = 0; y < hh; y += 16) { c.fillStyle = `rgba(110,70,35,${0.12 + (y % 32 ? 0.05 : 0)})`; c.fillRect(0, y, w, 1.5); for (let x = (y / 16 % 2) * 40; x < w; x += 80) c.fillRect(x, y, 1.5, 16); }
      speckle(c, w, hh, 0.08, '90,55,25', 6);
    }, [2, 2]);
    roundPlinth(h, g, 0.23, std('#ffffff', { map: floor, roughness: 0.6 }));
    // two of the team's Weiya tables, colleagues sitting around them on red banquet chairs
    const weiya = (x, z, r, guests) => {
      const t = new THREE.Group(); t.add(h.kitPiece('tWeiya', { width: 0.15 }));
      const chairM = std('#B23A27', { roughness: 0.6 }), cols = ['#3F6F8F', '#F2C9C0', '#F3DE9A', '#B9D3A4', '#CFE3EA', '#7E9FB8', '#E8D5B5', '#C7432C'];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.2, cx = Math.cos(a), cz = Math.sin(a);
        const ch = new THREE.Group();
        ch.add(box(0.017, 0.003, 0.017, chairM, 0, 0.018, 0)); ch.add(box(0.017, 0.022, 0.003, chairM, 0, 0.021, -0.008));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => ch.add(box(0.0018, 0.018, 0.0018, std('#C9952E', { metalness: 0.4, roughness: 0.4 }), sx * 0.007, 0, sz * 0.007)));
        ch.position.set(cx * 0.094, 0, cz * 0.094); ch.rotation.y = -a - Math.PI / 2; t.add(ch);
        if (guests.includes(i)) { const p = h.person(cols[i]); p.scale.setScalar(1.8); p.position.set(cx * 0.096, 0.013, cz * 0.096); p.rotation.y = -a - Math.PI / 2; t.add(p); }
      }
      at(g, t, x, z, r);
    };
    weiya(-0.09, -0.04, 0, [0, 1, 2, 3, 5, 6, 7]);
    weiya(0.1, 0.03, 0.4, [0, 1, 3, 4, 5, 7]);
    // two red lanterns on stands, and a host greeting a colleague by the door
    [[-0.19, -0.12], [0.19, -0.1]].forEach(([x, z]) => {
      const s = new THREE.Group();
      s.add(mesh(new THREE.CylinderGeometry(0.0012, 0.0015, 0.12, 6), std('#6B4A32'), 0, 0.06, 0));
      s.add(box(0.02, 0.002, 0.002, std('#6B4A32'), 0.008, 0.12, 0));
      const L = mesh(new THREE.SphereGeometry(0.012, 16, 12), std('#C7432C', { roughness: 0.6, emissive: '#B23A27', emissiveIntensity: 0.45 }), 0.016, 0.1, 0); L.scale.set(1, 1.15, 1); s.add(L);
      s.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 12), std('#C9952E', { metalness: 0.5, roughness: 0.35 }), 0.016, 0.115, 0));
      s.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 12), std('#C9952E', { metalness: 0.5, roughness: 0.35 }), 0.016, 0.085, 0));
      at(g, s, x, z);
    });
    at(g, h.person('#1F6B66'), 0.05, 0.15, 0.6, 1.75); at(g, h.person('#F3DE9A'), 0.08, 0.16, -2.5, 1.75);
    at(g, h.pottedPlant(), -0.17, 0.11, 0, 2.2); at(g, h.pottedPlant(), 0.2, -0.0, 0, 2.2);
    return { root: g };
  },
};

// the zuoya picture: the team's lunar calendar on a small round plinth
P09.calendar = (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tCalendar', { width: 0.24 })); return { root: g }; };
// for AR: the Weiya table and the storefront on their own
P09.weiyaAR = (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tWeiya', { width: 0.4 })); return { root: g }; };

/* ================= P10: a landscape inspired by Meinong (rice fields, a tobacco-curing barn, a Hakka courtyard house,
   oil-paper umbrellas drying, green mountains behind). Landscape only: no Bogong shrine, no fuchang. ================= */
function hakkaHouse(h) {
  const { THREE, std, box, mesh, brickMat, TEX } = h;
  const g = new THREE.Group(), H = 0.022;
  const roofMat = std('#6E6A64', { map: TEX.tiles(), roughness: 0.8, color: '#9A938A' });
  const gable = (w, d, x, y, z, ry = 0) => {
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.004, 0); sh.lineTo(0, 0.016); sh.lineTo(d / 2 + 0.004, 0); sh.lineTo(-d / 2 - 0.004, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 0.006, bevelEnabled: false }); geo.translate(0, 0, -(w + 0.006) / 2);
    const m = new THREE.Mesh(geo, roofMat); m.position.set(x, y, z); m.rotation.y = ry + Math.PI / 2; return m;
  };
  g.add(box(0.11, 0.002, 0.08, std('#E2CFA6', { roughness: 1 }), 0, 0, 0.012));            // the sunny courtyard (禾埕)
  g.add(box(0.11, H, 0.024, brickMat, 0, 0, -0.026)); g.add(gable(0.11, 0.024, 0, H, -0.026));
  [-1, 1].forEach((s) => { g.add(box(0.022, H * 0.9, 0.06, brickMat, s * 0.044, 0, 0.016)); g.add(gable(0.06, 0.022, s * 0.044, H * 0.9, 0.016, Math.PI / 2)); });
  g.add(box(0.014, 0.014, 0.002, std('#2A170F'), 0, 0.002, -0.0135));
  // oil-paper umbrellas drying in the courtyard
  ['#E1B655', '#B23A27', '#2F8C88', '#F3DE9A', '#C7432C'].forEach((c, i) => {
    const u = new THREE.Group();
    const cone = mesh(new THREE.ConeGeometry(0.011, 0.005, 16, 1, true), std(c, { roughness: 0.6, side: THREE.DoubleSide }), 0, 0.006, 0); u.add(cone);
    u.add(mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.012, 4), std('#6B4A32'), 0, 0.004, 0));
    u.position.set(-0.03 + i * 0.016, 0.002, 0.02 + (i % 2) * 0.018); u.rotation.set(0.5, i, 0.3); g.add(u);
  });
  return g;
}
function tobaccoBarn(h) {
  const { THREE, std, box, mesh, TEX } = h;
  const g = new THREE.Group();
  const wall = std('#EADFC8', { roughness: 0.95 }), frame = std('#6B4A32', { roughness: 0.8 });
  const roofMat = std('#ffffff', { map: TEX.tiles(), roughness: 0.75, color: '#B9A89A' });
  const gable = (w, d, rise, x, y, z) => {
    const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.005, 0); sh.lineTo(0, rise); sh.lineTo(d / 2 + 0.005, 0); sh.lineTo(-d / 2 - 0.005, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 0.008, bevelEnabled: false }); geo.translate(0, 0, -(w + 0.008) / 2);
    const m = new THREE.Mesh(geo, roofMat); m.position.set(x, y, z); m.rotation.y = Math.PI / 2; return m;
  };
  // the tall curing room with a raised vent roof on the ridge (the shape that makes a tobacco barn easy to spot)
  g.add(box(0.05, 0.075, 0.05, wall, 0, 0, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(box(0.004, 0.076, 0.004, frame, sx * 0.024, 0, sz * 0.024)));
  g.add(box(0.052, 0.004, 0.052, frame, 0, 0.04, 0));
  g.add(gable(0.05, 0.05, 0.022, 0, 0.075, 0));
  g.add(box(0.018, 0.014, 0.05, wall, 0, 0.09, 0));                                          // the vent
  g.add(gable(0.05, 0.018, 0.009, 0, 0.104, 0));
  // the lower working shed beside it
  g.add(box(0.04, 0.032, 0.05, wall, 0.045, 0, 0));
  g.add(gable(0.05, 0.04, 0.012, 0.045, 0.032, 0));
  g.add(box(0.012, 0.016, 0.002, std('#3A2A1E'), 0.045, 0, 0.026));
  [0.016, 0.05].forEach((y) => g.add(box(0.012, 0.01, 0.002, std('#4F7470'), -0.012, y, 0.026)));
  return g;
}
function palm(h, height = 0.09) {
  const { THREE, std, mesh } = h;
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.0016, 0.0022, height, 6), std('#8C7A62'), 0, height / 2, 0));
  for (let i = 0; i < 7; i++) {
    const leaf = mesh(new THREE.ConeGeometry(0.004, 0.03, 4), std('#4F7F38', { roughness: 0.9 }), 0, height, 0);
    leaf.geometry.translate(0, 0.015, 0); leaf.rotation.set(1.9, i * 0.9, 0); g.add(leaf);
  }
  return g;
}
export const P10 = {
  meinong: (h) => {
    const { THREE, std, TEX, mesh, box, M } = h; const g = new THREE.Group();
    lightsDay(h, g, { sun: [0.6, 1.0, 0.85] });
    g.add(box(0.94, 0.02, 0.62, M.wood, 0, -0.02, 0));
    g.add(box(0.92, 0.004, 0.6, std('#ffffff', { map: TEX.grass(), roughness: 0.95 }), 0, 0, 0));
    [[0.94, 0.004, 0.006, 0, 0.31], [0.94, 0.004, 0.006, 0, -0.31], [0.006, 0.004, 0.62, 0.47, 0], [0.006, 0.004, 0.62, -0.47, 0]]
      .forEach(([w, hh, d, x, z]) => g.add(box(w, hh, d, M.gold, x, 0, z)));
    // green mountains along the back (Meinong sits at the foot of the hills)
    const hill = (x, z, r, hgt, c) => { const m = mesh(new THREE.SphereGeometry(r, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), std(c, { roughness: 0.95 }), x, 0, z); m.scale.set(1, hgt / r, 0.3); g.add(m); };
    // two rows of low, rounded hills: the far row darker and bluer (haze), the near row lighter
    hill(-0.25, -0.3, 0.22, 0.11, '#5F8A6A'); hill(0.08, -0.3, 0.26, 0.13, '#56806A'); hill(0.36, -0.3, 0.2, 0.1, '#5F8A6A');
    hill(-0.4, -0.27, 0.14, 0.07, '#7FA35A'); hill(-0.1, -0.275, 0.16, 0.075, '#8DB867'); hill(0.2, -0.27, 0.15, 0.07, '#7FA35A'); hill(0.43, -0.265, 0.1, 0.055, '#8DB867');
    // clumps of trees and bamboo at the foot of the hills
    [[-0.43, -0.2], [-0.4, -0.215], [-0.37, -0.195], [-0.17, -0.21], [-0.14, -0.2], [-0.02, -0.215], [0.01, -0.2], [0.04, -0.212], [0.16, -0.205], [0.33, -0.2], [0.36, -0.215], [0.43, -0.205]]
      .forEach(([x, z], i) => at(g, h.smallTree(), x, z, i, 1.0 + (i % 3) * 0.15));
    // rice paddies in a patchwork
    const fm = [std('#ffffff', { map: TEX.field(), roughness: 0.6 }), std('#EEF2B8', { map: TEX.field(), roughness: 0.6 }), std('#CFE9E2', { map: TEX.field(), roughness: 0.3 })];
    let k = 0;
    for (let x = -0.4; x < 0.43; x += 0.082) for (let z = -0.13; z < 0.27; z += 0.074) {
      if (x > -0.33 && x < -0.12 && z < 0.02) continue;                 // the farmhouse
      if (x > 0.18 && x < 0.36 && z < 0.02) continue;                    // the tobacco barn
      if (Math.abs(z - 0.09) < 0.035) continue;                          // the path
      flat(h, g, new THREE.PlaneGeometry(0.074, 0.066), fm[k++ % 3], x, z, 0.0048);
    }
    // a stream with stone banks, and the farm path with a small bridge
    const path = std('#BFA67C', { roughness: 1 });
    flat(h, g, new THREE.PlaneGeometry(0.92, 0.026), path, 0, 0.09, 0.0049);
    const stream = new THREE.CatmullRomCurve3([[-0.47, 0.25], [-0.25, 0.2], [-0.05, 0.27], [0.15, 0.22], [0.47, 0.26]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const N = 80, pos = [], idx = [];
    for (let i = 0; i <= N; i++) { const t = i / N, p = stream.getPointAt(t), tg = stream.getTangentAt(t); const nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1; pos.push(p.x + nx / l * 0.018, 0.0058, p.z + nz / l * 0.018, p.x - nx / l * 0.018, 0.0058, p.z - nz / l * 0.018); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setIndex(idx); sg.computeVertexNormals();
    g.add(new THREE.Mesh(sg, std('#7DBDB4', { roughness: 0.25, emissive: '#1F6B66', emissiveIntensity: 0.1 })));
    for (let i = 0; i < 18; i++) { const p = stream.getPointAt(i / 17); g.add(mesh(new THREE.SphereGeometry(0.004 + (i % 3) * 0.001, 6, 5), M.stoneD, p.x + (i % 2 ? 0.02 : -0.02), 0.004, p.z)); }
    // the farmhouse (伙房) with umbrellas drying, the tobacco barn (菸樓), palms and bamboo
    at(g, hakkaHouse(h), -0.22, -0.05, 0, 1.25);
    at(g, tobaccoBarn(h), 0.27, -0.06, -0.25, 1.15);
    [[-0.36, -0.07], [-0.08, -0.06], [0.39, 0.0], [0.13, -0.1]].forEach(([x, z], i) => at(g, palm(h, 0.08 + (i % 2) * 0.02), x, z, i));
    // a farmer cycling along the path, and one in the field
    const bike = new THREE.Group();
    [-1, 1].forEach((s) => { const w = mesh(new THREE.TorusGeometry(0.006, 0.0009, 6, 18), std('#3A3A3A'), s * 0.008, 0.006, 0); bike.add(w); });
    bike.add(box(0.016, 0.0012, 0.0012, std('#2F8C88'), 0, 0.008, 0));
    const rider = h.person('#3F6F8F'); rider.position.set(0, 0.006, 0); rider.scale.setScalar(1.4); bike.add(rider);
    rider.add(mesh(new THREE.ConeGeometry(0.0055, 0.0035, 12), std('#E3C77E'), 0, 0.0172, 0));
    at(g, bike, 0.05, 0.09, 0.0, 1.6);
    const f = h.person('#B9D3A4'); f.add(mesh(new THREE.ConeGeometry(0.0055, 0.0035, 12), std('#E3C77E'), 0, 0.0172, 0)); at(g, f, -0.02, 0.0, 0.6, 1.7);
    return { root: g };
  },
};

// the team's Meinong models, each on its own (P10 culture cards): the settlement tile, the tobacco barn, the Bogong shrine
P10.settlement = (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tMeinong', { width: 0.4 })); return { root: g }; };
P10.barn = (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tBarn', { width: 0.42 })); return { root: g }; };
P10.bogong = (h) => { const g = new h.THREE.Group(); g.add(h.kitPiece('tBogong', { width: 0.37 })); return { root: g }; };

/* debug: look at kit pieces */
export const DEBUG = {
  kit: (h) => {
    const { THREE } = h; const g = new THREE.Group();
    at(g, h.kitPiece('storefront', { width: 0.2 }), -0.25, 0);
    at(g, h.kitPiece('stallFood', { width: 0.12 }), 0.0, 0);
    at(g, h.kitPiece('stallAcc', { width: 0.12 }), 0.16, 0);
    at(g, h.kitPiece('temple', { width: 0.2 }), 0.38, 0);
    return { root: g };
  },
};
