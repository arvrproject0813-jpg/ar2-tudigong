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
 * Build the neighbourhood with any three.js build (A-Frame's THREE in AR, the three module on P04/P05).
 * Returns { root, parts, markers, lanterns, anchors }. +Y is up, the plinth is about 0.94 × 0.62 units.
 * anchors = points above the four places the P04 pins point at (temple, fields, market, street corner).
 *
 * Options
 *   street: the P05 street-corner layout (no big central temple, more homes, the small shrine on the corner)
 *   mood:   'day' (default) · 'dawn' (P05 before: cool light, shops shuttered, no laundry, lanterns unlit)
 *           · 'awake' (P05 after: day + people in the street and market)
 * Every "random" detail comes from a seeded generator, so the same options always build the same scene
 * (the two P05 renders line up exactly).
 */
export function buildNeighborhood(THREE, { markers: withMarkers = true, shadows = false, street = false, mood = 'day', place = null, life = false } = {}) {
  const dawn = mood === 'dawn', people = mood === 'awake' || !!place;
  let seed = 20261022;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* ---------- painted canvas textures ---------- */
  const canvasTex = (w, h, draw, repeat) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    t.anisotropy = 4;
    return t;
  };
  const speckle = (g, w, h, a = 0.06, dark = '58,42,30', n = 18) => {
    for (let i = 0; i < w * h / n; i++) { g.fillStyle = `rgba(${dark},${rnd() * a})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
  };
  const TEX = {
    // glazed clay roof tiles: rows of half-round tiles with light on one side and shadow between
    tiles: () => canvasTex(256, 128, (g, w, h) => {
      g.fillStyle = '#9C4A2E'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 12) {
        const gr = g.createLinearGradient(x, 0, x + 12, 0);
        gr.addColorStop(0, '#8A3E26'); gr.addColorStop(0.35, '#D07A55'); gr.addColorStop(0.6, '#C0603F'); gr.addColorStop(1, '#7A3520');
        g.fillStyle = gr; g.fillRect(x + 1, 0, 10, h);
        for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(60,24,12,.35)'; g.fillRect(x + 1, y, 10, 2); }
      }
      speckle(g, w, h, 0.12, '40,20,10', 10);
    }, [3, 1]),
    // fired brick with mortar and colour variation
    brick: () => canvasTex(256, 128, (g, w, h) => {
      g.fillStyle = '#C9B8A0'; g.fillRect(0, 0, w, h);
      const tones = ['#A9452F', '#B24E35', '#9E3F2A', '#B75A3E', '#A44A33', '#923A27'];
      for (let r = 0; r < 16; r++) for (let c = -1; c < 17; c++) {
        g.fillStyle = tones[Math.floor(rnd() * tones.length)];
        g.fillRect(c * 16 + (r % 2) * 8 + 1, r * 8 + 1, 14, 6);
      }
      speckle(g, w, h, 0.18, '40,20,10', 8);
    }, [2, 2]),
    // the neighbourhood ground: worn paving with a soft grid
    paving: () => canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = '#EEE6D6'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
        g.fillStyle = `rgba(${170 + rnd() * 30},${160 + rnd() * 25},${140 + rnd() * 25},${0.08 + rnd() * 0.1})`;
        g.fillRect(x + 1, y + 1, 30, 30);
      }
      g.strokeStyle = 'rgba(150,135,110,.3)'; g.lineWidth = 1;
      for (let i = 0; i <= w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
      speckle(g, w, h, 0.1, '90,70,45', 6);
    }, [3, 2]),
    grass: () => canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#9DC27C'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) {
        const x = rnd() * w, y = rnd() * h;
        g.strokeStyle = ['rgba(70,110,45,.45)', 'rgba(170,205,130,.5)', 'rgba(110,150,75,.4)'][i % 3];
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 4); g.stroke();
      }
    }, [2, 2]),
    // flooded rice paddy: rows of seedlings over water that catches the sky
    field: () => canvasTex(256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#B9D3A4'); gr.addColorStop(1, '#93BB78');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let y = 4; y < h; y += 9) for (let x = 3; x < w; x += 7) {
        g.fillStyle = `rgba(${60 + rnd() * 30},${110 + rnd() * 30},${40 + rnd() * 20},.85)`;
        g.fillRect(x + rnd() * 2, y, 2, 4);
      }
      for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,250,230,.35)'; g.fillRect(rnd() * w, rnd() * h, 14 + rnd() * 20, 2); }
      g.strokeStyle = '#7E9F5E'; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
    }),
    // asphalt with a dashed centre line; along = the long side of the road
    asphalt: (along) => canvasTex(along === 'x' ? 512 : 64, along === 'x' ? 64 : 512, (g, w, h) => {
      g.fillStyle = '#8F8A80'; g.fillRect(0, 0, w, h);
      speckle(g, w, h, 0.35, '40,40,40', 3);
      speckle(g, w, h, 0.25, '200,195,185', 6);
      g.fillStyle = 'rgba(245,240,225,.9)';
      if (along === 'x') { for (let x = 6; x < w; x += 40) g.fillRect(x, h / 2 - 1.5, 22, 3); g.fillRect(0, 3, w, 2); g.fillRect(0, h - 5, w, 2); }
      else { for (let y = 6; y < h; y += 40) g.fillRect(w / 2 - 1.5, y, 3, 22); g.fillRect(3, 0, 2, h); g.fillRect(w - 5, 0, 2, h); }
    }),
    water: () => canvasTex(64, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#4E9690'); gr.addColorStop(0.5, '#7DBDB4'); gr.addColorStop(1, '#4E9690');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(235,250,245,.35)'; g.fillRect(8 + rnd() * (w - 24), rnd() * h, 6 + rnd() * 10, 1.5); }
    }, [1, 3]),
    // qilou facade: weathered plaster, framed windows (some with iron grilles), balcony ledges,
    // a blank sign band and an arcade with an open shop (or a shutter at dawn)
    facade: (wall, accent, open) => canvasTex(256, 384, (g, w, h) => {
      g.fillStyle = wall; g.fillRect(0, 0, w, h);
      speckle(g, w, h, 0.07, '90,70,50', 10);
      for (let i = 0; i < 14; i++) {            // rain streaks under the sills
        const x = rnd() * w; const gr = g.createLinearGradient(0, 0, 0, 60);
        g.fillStyle = 'rgba(110,90,70,.08)'; g.fillRect(x, rnd() * 260, 3 + rnd() * 4, 30 + rnd() * 50);
      }
      for (let f = 0; f < 3; f++) {
        const y = 22 + f * 92;
        g.fillStyle = 'rgba(70,55,40,.22)'; g.fillRect(0, y + 64, w, 6);   // balcony ledge shadow
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, y + 62, w, 3);
        for (let k = 0; k < 3; k++) {
          const x = 18 + k * 80;
          g.fillStyle = '#E9E4DA'; g.fillRect(x - 3, y - 3, 62, 54);       // frame
          const gl = g.createLinearGradient(x, y, x + 56, y + 48); gl.addColorStop(0, '#9FC3C0'); gl.addColorStop(1, '#4F7470');
          g.fillStyle = gl; g.fillRect(x, y, 56, 48);
          g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(x + 4, y + 4, 12, 40);
          g.strokeStyle = '#5C6B6A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 28, y); g.lineTo(x + 28, y + 48); g.stroke();
          if (rnd() < 0.5) {                                                // iron window grille
            g.strokeStyle = 'rgba(55,60,62,.85)'; g.lineWidth = 2;
            for (let b = 0; b <= 56; b += 9) { g.beginPath(); g.moveTo(x + b, y - 2); g.lineTo(x + b, y + 50); g.stroke(); }
            g.beginPath(); g.moveTo(x - 2, y + 24); g.lineTo(x + 58, y + 24); g.stroke();
          }
          if (rnd() < 0.3) { g.fillStyle = '#D7D3CB'; g.fillRect(x + 60, y + 30, 16, 12); g.fillStyle = '#AFAAA0'; g.fillRect(x + 62, y + 33, 12, 2); }   // air conditioner
        }
      }
      g.fillStyle = accent; g.fillRect(0, 296, w, 16);                      // sign band (no writing)
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 297, w, 4);
      g.fillStyle = '#3B2C21'; g.fillRect(0, 312, w, 72);                   // arcade
      if (open) {
        const sh = g.createLinearGradient(0, 316, 0, 384); sh.addColorStop(0, '#F6DDA8'); sh.addColorStop(1, '#C99A5A');
        g.fillStyle = sh; g.fillRect(14, 318, w - 28, 66);
        for (let s = 0; s < 3; s++) { g.fillStyle = 'rgba(120,80,40,.45)'; g.fillRect(20, 330 + s * 16, w - 40, 3); }
        for (let i = 0; i < 26; i++) { g.fillStyle = ['#C0603F', '#2F8C88', '#E1B655', '#F3EADA'][i % 4]; g.fillRect(22 + rnd() * (w - 50), 322 + Math.floor(rnd() * 3) * 16, 6, 8); }
      } else {
        g.fillStyle = '#A7A49C'; g.fillRect(14, 318, w - 28, 66);
        for (let y = 320; y < 384; y += 5) { g.fillStyle = 'rgba(80,78,72,.4)'; g.fillRect(14, y, w - 28, 1.5); }
      }
      g.fillStyle = wall; for (let c = 0; c < 4; c++) g.fillRect(c * 80 - 4, 312, 12, 72);   // arcade pillars
    }),
    awning: (c1) => canvasTex(128, 32, (g, w, h) => {
      for (let x = 0; x < w; x += 16) { g.fillStyle = (x / 16) % 2 ? '#FFF8EC' : c1; g.fillRect(x, 0, 16, h); }
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h - 5, w, 5);
    }),
    plaster: (c) => canvasTex(64, 64, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); speckle(g, w, h, 0.08, '90,70,50', 6); }),
  };

  /* ---------- materials ---------- */
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
  const M = {
    gold: std(COL.gold, { metalness: 0.55, roughness: 0.32, emissive: '#5A3C08', emissiveIntensity: 0.3 }),
    goldL: std(COL.goldL, { metalness: 0.45, roughness: 0.3, emissive: '#7A5410', emissiveIntensity: 0.3 }),
    red: std(COL.red, { roughness: 0.55 }),
    redD: std(COL.redD),
    teal: std(COL.tealD, { roughness: 0.45 }),
    stone: std('#B5AB98', { roughness: 0.95, map: TEX.plaster('#B5AB98') }),
    stoneD: std('#8C8270', { roughness: 0.95 }),
    wood: std(COL.wood), woodD: std(COL.woodD),
    leafD: std('#3F6A2B', { roughness: 0.9 }), leaf: std('#5E8F42', { roughness: 0.9 }), leafL: std('#8DB867', { roughness: 0.9 }),
    water: std('#ffffff', { roughness: 0.2, map: TEX.water(), emissive: '#1F6B66', emissiveIntensity: 0.08 }),
    dark: std('#2A170F', { roughness: 1 }),
    lantern: std('#C7432C', { roughness: 0.6, emissive: '#B23A27', emissiveIntensity: dawn ? 0.08 : 0.5 }),
    metal: std('#9C9C96', { roughness: 0.5, metalness: 0.4 }),
    tire: std('#2B2B2B', { roughness: 0.9 }),
    pot: std('#B8653F', { roughness: 0.85 }),
    roofTop: std('#D9CDB8', { map: TEX.plaster('#D9CDB8') }),
  };

  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z);

  /* ---------- the shrine (土地公廟): walls, curved tiled roof, swallowtail ridge, gold ornaments, lanterns ---------- */
  const tileMat = std('#ffffff', { map: TEX.tiles(), side: THREE.DoubleSide, roughness: 0.75 });
  const brickMat = std('#ffffff', { map: TEX.brick(), roughness: 0.9 });
  function shrine() {
    const g = new THREE.Group();
    const W = 0.2, D = 0.13, H = 0.12;
    g.add(box(W + 0.07, 0.012, D + 0.07, M.stone, 0, 0, 0.006));
    g.add(box(W + 0.04, 0.012, D + 0.04, M.stoneD, 0, 0.012, 0.004));
    const y0 = 0.024;
    g.add(box(W, H, D, brickMat, 0, y0, 0));
    g.add(box(W + 0.004, 0.018, D + 0.004, M.stone, 0, y0, 0));
    const door = new THREE.Group();
    door.add(mesh(new THREE.PlaneGeometry(0.07, 0.085), M.dark, 0, y0 + 0.018 + 0.0425, D / 2 + 0.001));
    const fr = (w, h, x, y) => mesh(new THREE.BoxGeometry(w, h, 0.006), M.gold, x, y, D / 2 + 0.003);
    door.add(fr(0.082, 0.008, 0, y0 + 0.106), fr(0.007, 0.09, -0.038, y0 + 0.063), fr(0.007, 0.09, 0.038, y0 + 0.063));
    door.add(mesh(new THREE.BoxGeometry(0.05, 0.006, 0.004), M.goldL, 0, y0 + 0.03, D / 2 + 0.002));
    g.add(door);
    [-1, 1].forEach((s) => {
      const px = s * (W / 2 + 0.004), pz = D / 2 + 0.006;
      g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, H + 0.004, 16), M.red, px, y0 + H / 2, pz));
      [0.02, H - 0.012].forEach((hy) => {
        const ring = mesh(new THREE.TorusGeometry(0.0095, 0.0022, 6, 16), M.gold, px, y0 + hy, pz);
        ring.rotation.x = Math.PI / 2; g.add(ring);
      });
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.07, 0.004), M.red, s * 0.062, y0 + 0.06, D / 2 + 0.002));
      g.add(mesh(new THREE.BoxGeometry(0.024, 0.074, 0.002), M.gold, s * 0.062, y0 + 0.06, D / 2 + 0.0005));
    });
    g.add(box(W + 0.03, 0.014, D + 0.02, M.teal, 0, y0 + H, 0));
    for (let i = 0; i < 9; i++) g.add(mesh(new THREE.SphereGeometry(0.0035, 8, 6), M.goldL, -W / 2 + 0.01 + i * (W - 0.02) / 8, y0 + H + 0.007, D / 2 + 0.011));
    const rw = W / 2 + 0.035, rd = D / 2 + 0.032, ridgeY = 0.065, curl = 0.032;
    const rg = new THREE.PlaneGeometry(2, 2, 32, 16);
    const p = rg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = p.getY(i), av = Math.abs(v), au = Math.abs(u);
      p.setXYZ(i, u * rw * (1 + 0.05 * av), ridgeY * (1 - av) ** 1.15 + curl * au ** 6 * av + 0.012 * av * av, v * rd);
    }
    rg.computeVertexNormals();
    const roofY = y0 + H + 0.014;
    g.add(mesh(rg, tileMat, 0, roofY, 0));
    [-1, 1].forEach((s) => {
      const pts = []; for (let i = 0; i <= 20; i++) { const u = -1 + i / 10; pts.push(new THREE.Vector3(u * rw * 1.05, roofY + curl * Math.abs(u) ** 6 + 0.012, s * rd)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0025, 6), M.gold));
    });
    const ridgePts = [[-rw - 0.05, 0.05], [-rw - 0.02, 0.012], [-rw + 0.03, 0.0], [0, 0.0], [rw - 0.03, 0.0], [rw + 0.02, 0.012], [rw + 0.05, 0.05]]
      .map(([x, y]) => new THREE.Vector3(x, roofY + ridgeY + 0.004 + y, 0));
    const ridgeCurve = new THREE.CatmullRomCurve3(ridgePts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(ridgeCurve, 60, 0.008, 10), M.teal));
    const ridgeTrim = new THREE.Mesh(new THREE.TubeGeometry(ridgeCurve, 60, 0.0035, 6), M.gold);
    ridgeTrim.position.y = 0.009; g.add(ridgeTrim);
    [-1, 1].forEach((s) => g.add(mesh(new THREE.SphereGeometry(0.006, 10, 8), M.goldL, s * (rw + 0.05), roofY + ridgeY + 0.055, 0)));
    g.add(mesh(new THREE.SphereGeometry(0.012, 16, 12), M.goldL, 0, roofY + ridgeY + 0.026, 0));
    g.add(mesh(new THREE.TorusGeometry(0.01, 0.002, 6, 16, Math.PI), M.gold, 0, roofY + ridgeY + 0.036, 0));
    [-1, 1].forEach((s) => {
      const pts = [[0.02, 0.006], [0.035, 0.03], [0.055, 0.022], [0.07, 0.035], [0.085, 0.018]].map(([x, y]) => new THREE.Vector3(s * x, roofY + ridgeY + y, 0));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0035, 6), M.gold));
      [[0.1, '#D2593F'], [0.11, COL.goldL], [0.095, '#CDE8E5']].forEach(([x, c]) => g.add(mesh(new THREE.SphereGeometry(0.0045, 8, 6), std(c, { roughness: 0.4 }), s * x, roofY + ridgeY + 0.008, 0.006)));
    });
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
    [-1, 1].forEach((s) => {
      const L = new THREE.Group(); L.position.set(s * (W / 2 + 0.03), 0.012, D / 2 + 0.04);
      L.add(box(0.026, 0.01, 0.026, M.stoneD, 0, 0, 0));
      const torso = mesh(new THREE.SphereGeometry(0.011, 12, 10), M.stone, 0, 0.022, 0);
      torso.scale.set(1, 1.3, 1); L.add(torso);
      L.add(mesh(new THREE.SphereGeometry(0.009, 12, 10), M.stone, 0, 0.042, 0.004));
      L.add(mesh(new THREE.TorusGeometry(0.0085, 0.003, 6, 12), M.stoneD, 0, 0.043, 0.002));
      g.add(L);
    });
    return g;
  }

  /* ---------- trees: soft rounded canopies in three greens ---------- */
  const canopy = (g, n, rx, rz, y0, y1, rMin, rMax) => {
    const mats = [M.leafD, M.leaf, M.leafL];
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd());
      const r = rMin + rnd() * (rMax - rMin);
      const y = y0 + rnd() * (y1 - y0);
      const blob = mesh(new THREE.IcosahedronGeometry(r, 1), mats[y > (y0 + y1) / 2 ? (i % 2 ? 2 : 1) : (i % 3 ? 1 : 0)], Math.cos(a) * rx * d, y, Math.sin(a) * rz * d);
      blob.scale.set(1, 0.82, 1);
      g.add(blob);
    }
  };
  function banyan() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.012, 0.024, 0.13, 10), M.wood, 0, 0.065, 0));
    for (let i = 0; i < 4; i++) {          // spreading limbs
      const a = i * Math.PI / 2 + 0.4, limb = mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.08, 6), M.wood, Math.cos(a) * 0.025, 0.13, Math.sin(a) * 0.02);
      limb.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(limb);
    }
    for (let i = 0; i < 16; i++) {         // aerial roots
      const a = rnd() * Math.PI * 2, r = 0.03 + rnd() * 0.06, h = 0.07 + rnd() * 0.06;
      g.add(mesh(new THREE.CylinderGeometry(0.0011, 0.0011, h, 4), M.woodD, Math.cos(a) * r, h / 2, Math.sin(a) * r));
    }
    canopy(g, 30, 0.1, 0.075, 0.15, 0.21, 0.026, 0.045);
    return g;
  }
  function smallTree() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.003, 0.005, 0.04, 6), M.wood, 0, 0.02, 0));
    canopy(g, 5, 0.012, 0.012, 0.05, 0.065, 0.016, 0.022);
    return g;
  }

  /* ---------- street life ---------- */
  function scooter(color) {
    const g = new THREE.Group(); const body = std(color, { roughness: 0.4, metalness: 0.2 });
    [-1, 1].forEach((s) => { const w = mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.0025, 12), M.tire, 0, 0.0042, s * 0.008); w.rotation.z = Math.PI / 2; g.add(w); });
    g.add(box(0.006, 0.004, 0.016, body, 0, 0.004, 0));
    g.add(box(0.0065, 0.003, 0.008, M.dark, 0, 0.008, -0.003));
    g.add(box(0.006, 0.01, 0.003, body, 0, 0.006, 0.008));
    g.add(box(0.012, 0.0012, 0.0012, M.metal, 0, 0.016, 0.009));
    return g;
  }
  function pottedPlant() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.004, 0.003, 0.006, 8), M.pot, 0, 0.003, 0));
    g.add(mesh(new THREE.IcosahedronGeometry(0.0055, 1), M.leaf, 0, 0.0095, 0));
    return g;
  }
  function lamp() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.0009, 0.0011, 0.05, 6), M.metal, 0, 0.025, 0));
    g.add(box(0.008, 0.002, 0.003, M.metal, 0.003, 0.05, 0));
    return g;
  }
  const clothes = ['#FFFFFF', '#CFE3EA', '#F2C9C0', '#F3DE9A', '#B9D3A4'];
  function person(color) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.0028, 0.0034, 0.011, 8), std(color), 0, 0.0055, 0));
    g.add(mesh(new THREE.SphereGeometry(0.0026, 10, 8), std('#D8B08C'), 0, 0.0135, 0));
    g.add(mesh(new THREE.SphereGeometry(0.0027, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.dark, 0, 0.0142, 0));
    return g;
  }

  /* ---------- qilou house: plaster facade, sign sticking out over the street, laundry, AC, plants ---------- */
  const signCols = ['#B23A27', '#1F6B66', '#E1B655', '#F3EADA', '#2F8C88'];
  function house(w, h, d, wall, accent) {
    const g = new THREE.Group();
    const face = std('#ffffff', { map: TEX.facade(wall, accent, !dawn), roughness: 0.85 });
    const side = std('#ffffff', { map: TEX.plaster(wall), roughness: 0.9 });
    g.add(box(w, h, d, [side, side, M.roofTop, M.roofTop, face, face], 0, 0, 0));
    g.add(box(w + 0.004, 0.008, d + 0.004, M.roofTop, 0, h, 0));
    // rooftop: water tank on most roofs, a little railing
    if (rnd() < 0.75) g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.016, 14), std('#DAD4C8', { roughness: 0.5 }), w * 0.2, h + 0.016, -d * 0.1));
    // vertical shop sign sticking out over the arcade (blank: no writing)
    if (rnd() < 0.7) {
      const sc = signCols[Math.floor(rnd() * signCols.length)];
      const sx = (rnd() < 0.5 ? -1 : 1) * w * 0.38;
      g.add(box(0.0035, 0.05, 0.016, std(sc, { roughness: 0.5 }), sx, h * 0.36, d / 2 + 0.008));
      g.add(box(0.0037, 0.042, 0.011, std('#FFF6E4', { roughness: 0.6 }), sx, h * 0.36 + 0.004, d / 2 + 0.008));
    }
    // laundry on a balcony line (not at dawn)
    if (!dawn && rnd() < 0.6) {
      const ly = h * (0.55 + rnd() * 0.2), lz = d / 2 + 0.004;
      const line = mesh(new THREE.CylinderGeometry(0.0004, 0.0004, w * 0.8, 4), M.metal, 0, ly, lz); line.rotation.z = Math.PI / 2; g.add(line);
      for (let i = 0; i < 4; i++) g.add(box(0.008, 0.011, 0.0008, std(clothes[Math.floor(rnd() * clothes.length)], { side: THREE.DoubleSide }), -w * 0.3 + i * w * 0.2, ly - 0.011, lz));
    }
    // potted plants by the arcade
    if (rnd() < 0.7) { const pl = pottedPlant(); pl.position.set(-w * 0.42, 0, d / 2 + 0.008); g.add(pl); }
    if (rnd() < 0.4) { const pl = pottedPlant(); pl.position.set(w * 0.42, 0, d / 2 + 0.008); g.add(pl); }
    return g;
  }

  /* ---------- market stall ---------- */
  const fruit = [COL.gold, '#E58A2E', COL.green, COL.red, '#F2C14E'];
  function stall(c1) {
    const g = new THREE.Group();
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.05, 6), M.woodD, sx * 0.025, 0.025, sz * 0.018)));
    const aw = mesh(new THREE.BoxGeometry(0.064, 0.003, 0.048), std('#ffffff', { map: TEX.awning(c1), roughness: 0.7 }), 0, 0.052, 0);
    aw.rotation.x = 0.18; g.add(aw);
    g.add(box(0.05, 0.02, 0.03, M.wood, 0, 0, 0));
    if (dawn) {            // covered with a cloth before the market opens
      g.add(box(0.052, 0.008, 0.032, std('#7F8C8A', { roughness: 0.95 }), 0, 0.02, 0));
    } else {
      for (let i = 0; i < 8; i++) {
        g.add(mesh(new THREE.CylinderGeometry(0.006, 0.005, 0.003, 10), std('#C9A46A'), -0.018 + (i % 4) * 0.012, 0.0215, -0.006 + Math.floor(i / 4) * 0.012));   // basket
        g.add(mesh(new THREE.SphereGeometry(0.0042, 10, 8), std(fruit[i % fruit.length], { roughness: 0.45 }), -0.018 + (i % 4) * 0.012, 0.026, -0.006 + Math.floor(i / 4) * 0.012));
      }
    }
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

  /* ---------- one place on its own small plinth (P05 AR camera: temple, residential, market, road, park) ---------- */
  if (place) return buildPlace(place);
  function buildPlace(id) {
    const g = new THREE.Group();
    const at = (obj, x, z, ry = 0, sc = 1) => { obj.position.set(x, 0, z); obj.rotation.y = ry; obj.scale.setScalar(sc); g.add(obj); return obj; };
    const flat = (geo, mat, x, z, y = 0.0045) => { const m = mesh(geo, mat, x, y, z); m.rotation.x = -Math.PI / 2; g.add(m); return m; };
    const paveMat = std('#ffffff', { map: TEX.paving(), roughness: 0.9 });
    const roundPlinth = (r) => {
      g.add(mesh(new THREE.CylinderGeometry(r + 0.006, r + 0.012, 0.024, 64), M.wood, 0, -0.012, 0));
      g.add(mesh(new THREE.CylinderGeometry(r, r, 0.004, 64), paveMat, 0, 0.002, 0));
      const rim = mesh(new THREE.TorusGeometry(r + 0.003, 0.0032, 8, 96), M.gold, 0, 0.002, 0); rim.rotation.x = Math.PI / 2; g.add(rim);
    };
    const folk = (pts) => pts.forEach(([x, z, ry], i) => at(person(clothes[(i + 1) % clothes.length] === '#FFFFFF' ? '#3F6F8F' : clothes[(i + 1) % clothes.length]), x, z, ry ?? rnd() * 6, 1.7));
    const scooterCols = ['#F3F1EC', '#B23A27', '#2F8C88', '#C9C6BF', '#E1B655'];
    const scoot = (x, z, ry, i) => at(scooter(scooterCols[i % scooterCols.length]), x, z, ry, 1.5);
    // movers: people who walk and scooters that ride (turned into an animation in the AR models)
    //   path = [[x, z], …]; mode 'pingpong' (there and back) or 'loop' (start again; appear = grow in / shrink out at the ends)
    const movers = [];
    let nWalk = 0;
    const walker = (path, o = {}) => { const p = at(person(['#3F6F8F', '#F2C9C0', '#F3DE9A', '#B9D3A4', '#CFE3EA', '#C7432C'][nWalk++ % 6]), path[0][0], path[0][1], 0, 1.7); movers.push({ obj: p, path, mode: 'pingpong', speed: 0.022, bob: true, ...o }); return p; };
    const rider = (path, i, o = {}) => { const sc = scoot(path[0][0], path[0][1], 0, i); movers.push({ obj: sc, path, mode: 'loop', appear: true, speed: 0.06, ...o }); return sc; };
    const circle = (r, cx = 0, cz = 0, n = 20) => Array.from({ length: n + 1 }, (_, k) => [cx + Math.cos(k / n * Math.PI * 2) * r, cz + Math.sin(k / n * Math.PI * 2) * r]);
    let lanterns = [];
    if (id === 'temple') {
      roundPlinth(0.21);
      const sh = at(shrine(), 0, -0.03); lanterns = sh.userData.lanterns;
      at(smallTree(), -0.15, -0.12, 0, 1.3); at(smallTree(), 0.15, -0.12, 1, 1.2);
      at(pottedPlant(), -0.11, 0.12, 0, 1.6); at(pottedPlant(), 0.11, 0.12, 0, 1.6);
      at(lamp(), -0.17, 0.07);
      scoot(0.16, 0.07, 0.7, 1);
      folk([[0.13, 0.13]]);
      walker([[-0.16, 0.17], [-0.035, 0.125]], { phase: 0 });          // neighbours come to pray and go again
      walker([[0.15, 0.18], [0.04, 0.128]], { phase: 0.5 });
      walker([[-0.19, 0.04], [-0.17, 0.12], [-0.08, 0.19], [0.08, 0.19], [0.18, 0.1]], { phase: 0.25, speed: 0.018 });
    } else if (id === 'residential') {
      roundPlinth(0.2);
      [[-0.088, -0.065, 0.08, 0.17, '#F3EADA', COL.teal], [0.0, -0.075, 0.08, 0.21, '#EAD9C0', COL.red], [0.088, -0.065, 0.08, 0.15, '#F6EFE2', COL.gold]]
        .forEach(([x, z, w, h, wall, acc]) => at(house(w, h, 0.07, wall, acc), x, z));
      [-0.1, -0.08, -0.06, 0.06].forEach((x, i) => scoot(x, 0.02, 0, i));
      at(lamp(), 0.14, 0.08); at(smallTree(), -0.15, 0.08, 0, 1.2);
      folk([[0.1, 0.05]]);
      walker([[-0.13, 0.06], [0.12, 0.065]], { phase: 0.1 });
      walker([[0.12, 0.145], [-0.12, 0.145]], { phase: 0.6 });
      walker([[-0.03, 0.04], [-0.02, 0.18]], { phase: 0.3, speed: 0.015 });
      rider([[-0.17, 0.105], [0.17, 0.105]], 1, { phase: 0.4 });
    } else if (id === 'market') {
      roundPlinth(0.18);
      [[-0.075, -0.03, 0.4, COL.red], [0, -0.055, 0, COL.teal], [0.075, -0.03, -0.4, COL.red]].forEach(([x, z, ry, c]) => at(stall(c), x, z, ry, 1.25));
      [[-0.12, 0.05], [0.12, 0.05], [0.0, 0.03]].forEach(([x, z]) => g.add(box(0.022, 0.014, 0.016, M.wood, x, 0, z)));   // crates
      for (let i = 0; i < 6; i++) g.add(mesh(new THREE.SphereGeometry(0.0045, 10, 8), std(fruit[i % fruit.length], { roughness: 0.45 }), -0.126 + (i % 3) * 0.006, 0.018, 0.047 + Math.floor(i / 3) * 0.006));
      at(lamp(), -0.15, -0.06);
      folk([[-0.06, 0.05, Math.PI], [0.04, 0.06, Math.PI], [0.1, 0.0, -1]]);
      walker([[-0.11, 0.075], [-0.02, 0.095], [0.09, 0.075]], { phase: 0 });   // shoppers going from stall to stall
      walker([[0.1, 0.12], [-0.08, 0.125]], { phase: 0.4 });
      walker([[-0.02, 0.17], [-0.02, 0.06]], { phase: 0.7, speed: 0.016 });
    } else if (id === 'road') {
      g.add(box(0.44, 0.024, 0.44, M.wood, 0, -0.024, 0));
      g.add(box(0.42, 0.004, 0.42, paveMat, 0, 0, 0));
      [[0.44, 0.004, 0.006, 0, 0.22], [0.44, 0.004, 0.006, 0, -0.22], [0.006, 0.004, 0.44, 0.22, 0], [0.006, 0.004, 0.44, -0.22, 0]]
        .forEach(([w, h, d, x, z]) => g.add(box(w, h, d, M.gold, x, 0, z)));
      flat(new THREE.PlaneGeometry(0.07, 0.42), std('#ffffff', { map: TEX.asphalt('z'), roughness: 0.95 }), 0.02, 0, 0.0045);
      flat(new THREE.PlaneGeometry(0.42, 0.06), std('#ffffff', { map: TEX.asphalt('x'), roughness: 0.95 }), 0, 0.05, 0.0048);
      for (let i = 0; i < 5; i++) g.add(box(0.058, 0.0012, 0.007, std('#F4F0E6', { roughness: 0.8 }), 0.02, 0.0045, -0.005 - i * 0.013));   // zebra crossing
      at(house(0.09, 0.13, 0.07, '#F2E2CC', COL.red), -0.12, -0.13); at(house(0.08, 0.11, 0.07, '#E9E1CF', COL.teal), 0.13, -0.13);
      const mini = shrine(); mini.scale.setScalar(0.42); const mw = new THREE.Group(); mw.add(mini); at(mw, 0.13, 0.14, 0); lanterns = mini.userData.lanterns;
      rider([[0.036, -0.2], [0.036, 0.2]], 0, { phase: 0 });          // scooters riding both ways on both roads
      rider([[0.004, 0.2], [0.004, -0.2]], 1, { phase: 0.45 });
      rider([[-0.2, 0.064], [0.2, 0.064]], 2, { phase: 0.2 });
      rider([[0.2, 0.036], [-0.2, 0.036]], 4, { phase: 0.7 });
      at(lamp(), -0.03, -0.02); at(lamp(), 0.07, 0.1); at(smallTree(), -0.16, 0.15, 0, 1.2);
      folk([[-0.1, -0.05]]);
      walker([[-0.03, -0.03], [0.075, -0.03]], { phase: 0.15, speed: 0.016 });   // crossing at the zebra crossing
      walker([[-0.18, 0.13], [-0.05, 0.13]], { phase: 0.5 });
      walker([[0.07, -0.18], [0.07, -0.06]], { phase: 0.8 });
    } else if (id === 'park') {
      roundPlinth(0.21);
      flat(new THREE.CircleGeometry(0.2, 64), std('#ffffff', { map: TEX.grass(), roughness: 0.95 }), 0, 0, 0.0045);
      flat(new THREE.PlaneGeometry(0.034, 0.2), paveMat, 0.0, 0.105, 0.0052);       // path in from the front
      flat(new THREE.CircleGeometry(0.05, 48), paveMat, 0.0, 0.0, 0.0052);           // little plaza round the banyan
      at(banyan(), 0.0, -0.01, 0, 0.95);
      [[-0.13, 0.06, 1.15], [0.14, 0.07, 1.2], [-0.1, -0.13, 1.3], [0.12, -0.12, 1.1]].forEach(([x, z, sc], i) => at(smallTree(), x, z, i, sc));
      [[-0.05, 0.1, 0.3], [0.06, 0.1, -0.3]].forEach(([x, z, ry]) => {
        const b = new THREE.Group();
        b.add(box(0.045, 0.004, 0.014, M.wood, 0, 0.012, 0)); b.add(box(0.045, 0.012, 0.003, M.wood, 0, 0.016, -0.006));
        [-1, 1].forEach((sx) => b.add(box(0.003, 0.012, 0.012, M.woodD, sx * 0.019, 0, 0)));
        at(b, x, z, ry);
      });
      at(lamp(), 0.03, 0.17);
      folk([[-0.05, 0.115, Math.PI]]);
      walker(circle(0.075), { mode: 'loop', phase: 0, speed: 0.02 });     // strolling round the banyan
      walker(circle(0.075), { mode: 'loop', phase: 0.5, speed: 0.02 });
      walker([[0.0, 0.2], [0.0, 0.08]], { phase: 0.3, speed: 0.016 });
      walker([[-0.17, -0.03], [-0.11, -0.08], [-0.04, -0.13]], { phase: 0.7 });
    }
    return { root: g, parts: [], markers: [], lanterns, anchors: {}, movers };
  }

  const root = new THREE.Group();
  const parts = [];
  const add = (obj, x, z, delay, ry = 0) => { obj.position.set(x, 0, z); obj.rotation.y = ry; obj.scale.setScalar(0.0001); root.add(obj); parts.push({ obj, delay }); return obj; };

  // lights: warm late-morning sun, or a cool, low dawn light
  root.add(new THREE.HemisphereLight(dawn ? '#C9D3DA' : '#FFF4E0', dawn ? '#4A4A50' : '#6A5638', dawn ? 0.5 : 0.6));
  const sun = new THREE.DirectionalLight(dawn ? '#F1D9C6' : '#FFE6BF', dawn ? 0.55 : 1.0);
  sun.position.set(dawn ? -0.9 : 0.6, dawn ? 0.55 : 1.0, dawn ? 0.7 : 0.8); root.add(sun);
  if (shadows) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.002;
    Object.assign(sun.shadow.camera, { left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.1, far: 3 });
  }
  const fill = new THREE.DirectionalLight(dawn ? '#B9CCE0' : '#CFE6E3', dawn ? 0.35 : 0.3); fill.position.set(-0.8, 0.6, -0.4); root.add(fill);

  // museum plinth: paved top, wood sides, gold trim
  const plinth = new THREE.Group();
  plinth.add(box(0.94, 0.02, 0.62, M.wood, 0, -0.02, 0));
  plinth.add(box(0.92, 0.004, 0.6, std('#ffffff', { map: TEX.paving(), roughness: 0.9 }), 0, 0, 0));
  [[0.94, 0.004, 0.006, 0, 0.31], [0.94, 0.004, 0.006, 0, -0.31], [0.006, 0.004, 0.62, 0.47, 0], [0.006, 0.004, 0.62, -0.47, 0]]
    .forEach(([w, h, d, x, z]) => plinth.add(box(w, h, d, M.gold, x, 0, z)));
  add(plinth, 0, 0, 0);

  // ground: rice paddies (left), canal, two asphalt roads, a grass lot
  const ground = new THREE.Group();
  const fieldMat = std('#ffffff', { map: TEX.field(), roughness: 0.6 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const f = mesh(new THREE.PlaneGeometry(0.085, 0.085), fieldMat, -0.4 + i * 0.09, 0.006, -0.17 + j * 0.09);
    f.rotation.x = -Math.PI / 2; ground.add(f);
  }
  const canal = mesh(new THREE.PlaneGeometry(0.03, 0.56), M.water, -0.12, 0.007, 0); canal.rotation.x = -Math.PI / 2; ground.add(canal);
  [-1, 1].forEach((s) => ground.add(box(0.004, 0.006, 0.56, M.stoneD, -0.12 + s * 0.017, 0.004, 0)));   // canal kerbs
  const road1 = mesh(new THREE.PlaneGeometry(0.06, 0.58), std('#ffffff', { map: TEX.asphalt('z'), roughness: 0.95 }), 0.2, 0.0065, 0); road1.rotation.x = -Math.PI / 2; ground.add(road1);
  const road2 = mesh(new THREE.PlaneGeometry(0.62, 0.05), std('#ffffff', { map: TEX.asphalt('x'), roughness: 0.95 }), 0.16, 0.0068, 0.18); road2.rotation.x = -Math.PI / 2; ground.add(road2);
  const grass = mesh(new THREE.PlaneGeometry(0.28, 0.2), std('#ffffff', { map: TEX.grass(), roughness: 0.95 }), 0.0, 0.0062, 0.16); grass.rotation.x = -Math.PI / 2; ground.add(grass);
  add(ground, 0, 0, 0.1);

  // shrine at the centre (the hero), banyan behind it, houses, market
  let lanterns = [];
  if (!street) { const sh = shrine(); lanterns = sh.userData.lanterns; add(sh, 0.04, 0.03, 0.35); }
  add(banyan(), -0.2, -0.05, 0.5);
  // a small street-corner shrine where the two roads meet, facing the street
  const mini = shrine(); mini.scale.setScalar(0.42);
  const miniWrap = new THREE.Group(); miniWrap.add(mini);
  if (street) { add(miniWrap, 0.3, 0.255, 0.55); lanterns = mini.userData.lanterns; }
  else add(miniWrap, 0.285, 0.118, 0.55);
  // qilou houses in two rows behind the shrine, facades towards the viewer (+z = bottom edge of the card)
  const H = [[0.22, -0.2, 0.08, 0.17, '#F3EADA', COL.teal], [0.31, -0.2, 0.08, 0.21, '#EAD9C0', COL.red], [0.4, -0.2, 0.08, 0.15, '#F6EFE2', COL.gold],
             [0.27, -0.08, 0.08, 0.12, '#E9E1CF', COL.green], [0.37, -0.08, 0.09, 0.14, '#F2E2CC', COL.teal], [0.12, -0.22, 0.07, 0.13, '#F3E3CF', COL.red]];
  if (street) H.push([0.0, 0.0, 0.08, 0.13, '#F2E2CC', COL.red], [0.09, 0.0, 0.07, 0.11, '#E9E1CF', COL.teal], [0.36, 0.06, 0.08, 0.12, '#F3EADA', COL.gold]);
  H.forEach(([x, z, w, h, wall, acc], i) => add(house(w, h, 0.07, wall, acc), x, z, 0.6 + i * 0.07));
  [[-0.26, 0.2, COL.teal], [-0.18, 0.2, COL.red], [-0.34, 0.2, COL.red]].forEach(([x, z, c], i) => add(stall(c), x, z, 0.75 + i * 0.06));
  [[-0.42, -0.24], [0.44, 0.24], [-0.02, 0.26]].forEach(([x, z], i) => add(smallTree(), x, z, 0.85 + i * 0.05));

  // street details: parked scooters, lamps
  const details = new THREE.Group();
  const scooterCols = ['#F3F1EC', '#B23A27', '#2F8C88', '#C9C6BF', '#E1B655'];
  [[0.236, -0.02, 0], [0.236, 0.0, 0], [0.236, 0.02, 0], [-0.1, 0.215, Math.PI / 2], [-0.07, 0.215, Math.PI / 2], [0.165, -0.15, 0], [0.42, 0.21, Math.PI / 2]]
    .forEach(([x, z, ry], i) => { const s = scooter(scooterCols[i % scooterCols.length]); s.position.set(x, 0, z); s.rotation.y = ry; s.scale.setScalar(1.5); s.userData.kind = 'scooter'; details.add(s); });
  [[0.236, -0.26], [0.236, 0.08], [0.0, 0.212], [-0.3, 0.145]].forEach(([x, z]) => { const l = lamp(); l.position.set(x, 0, z); details.add(l); });
  add(details, 0, 0, 0.9);

  // people (P05 'awake' only): shoppers at the market, neighbours on the street and near the shrine
  if (people) {
    const crowd = new THREE.Group();
    [[-0.3, 0.245], [-0.22, 0.245], [-0.26, 0.25], [-0.15, 0.24], [-0.33, 0.165], [0.19, 0.06], [0.21, -0.12], [0.26, 0.2],
     street ? [0.17, 0.27] : [0.06, 0.13], [0.05, 0.05], [0.12, 0.05], [0.33, 0.0]]
      .forEach(([x, z], i) => { const p = person(clothes[i % clothes.length] === '#FFFFFF' ? '#3F6F8F' : clothes[i % clothes.length]); p.position.set(x, 0, z); p.rotation.y = rnd() * 6; p.scale.setScalar(1.7); crowd.add(p); });
    add(crowd, 0, 0, 1.0);
  }

  // moving people and scooters (only for the animated AR model of the street corner)
  const movers = [];
  if (life) {
    const lifeG = new THREE.Group();
    const cols = ['#3F6F8F', '#F2C9C0', '#F3DE9A', '#B9D3A4', '#CFE3EA', '#C7432C'];
    [[[-0.36, 0.255], [-0.14, 0.255]], [[0.12, 0.285], [0.27, 0.285]], [[0.25, -0.26], [0.25, 0.12]], [[0.15, -0.2], [0.15, 0.1]], [[-0.05, 0.215], [0.13, 0.215]]]
      .forEach((path, i) => { const p = person(cols[i % cols.length]); p.scale.setScalar(1.7); p.position.set(path[0][0], 0, path[0][1]); lifeG.add(p); movers.push({ obj: p, path, mode: 'pingpong', speed: 0.022, bob: true, phase: i * 0.21 }); });
    [[[0.212, -0.29], [0.212, 0.29]], [[0.188, 0.29], [0.188, -0.29]], [[-0.15, 0.19], [0.47, 0.19]], [[0.47, 0.17], [-0.15, 0.17]]]
      .forEach((path, i) => { const sc = scooter(['#F3F1EC', '#B23A27', '#2F8C88', '#E1B655'][i]); sc.scale.setScalar(1.5); sc.position.set(path[0][0], 0, path[0][1]); lifeG.add(sc); movers.push({ obj: sc, path, mode: 'loop', appear: true, speed: 0.07, phase: i * 0.27 }); });
    add(lifeG, 0, 0, 1.0);
  }

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
  return { root, parts, markers, lanterns, anchors, movers };
}

/**
 * Turn a built place's movers and lanterns into one looping AnimationClip (for the AR models).
 * Every mover's trip is fitted to a whole number of rounds in `length` seconds so the clip loops seamlessly.
 */
export function lifeClip(THREE, n, { length = 12, fps = 12 } = {}) {
  const tracks = [];
  const steps = Math.round(length * fps), times = Array.from({ length: steps + 1 }, (_, i) => i / fps);
  const yAxis = new THREE.Vector3(0, 1, 0), zAxis = new THREE.Vector3(0, 0, 1), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  (n.movers || []).forEach((m, k) => {
    const o = m.obj; o.name = o.name || `mover_${k}`;
    let pts = m.path.map(([x, z]) => new THREE.Vector2(x, z));
    if (m.mode === 'pingpong') pts = pts.concat(pts.slice(0, -1).reverse());
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = pts[i].distanceTo(pts[i - 1]); seg.push(d); total += d; }
    const rounds = Math.max(1, Math.round(length / (total / m.speed)));
    const base = o.scale.x, pos = [], rot = [], scl = [];
    times.forEach((t) => {
      const u = (((t / length) * rounds + (m.phase || 0)) % 1 + 1) % 1;
      let d = u * total, i = 0;
      while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; }
      const a = pts[i], b = pts[i + 1], f = seg[i] ? d / seg[i] : 0;
      const x = a.x + (b.x - a.x) * f, z = a.y + (b.y - a.y) * f;
      const stepPhase = u * total / 0.012;                                   // about one step every 1.2 cm
      const y = m.bob ? Math.abs(Math.sin(stepPhase * Math.PI)) * 0.0022 : 0;
      pos.push(x, y, z);
      q.setFromAxisAngle(yAxis, Math.atan2(b.x - a.x, b.y - a.y));
      if (m.bob) q.multiply(q2.setFromAxisAngle(zAxis, Math.sin(stepPhase * Math.PI) * 0.06));
      rot.push(q.x, q.y, q.z, q.w);
      let s = 1;
      if (m.appear) { const e = 0.06; s = u < e ? u / e : u > 1 - e ? (1 - u) / e : 1; }
      scl.push(base * s, base * s, base * s);
    });
    tracks.push(new THREE.VectorKeyframeTrack(`${o.name}.position`, times, pos));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${o.name}.quaternion`, times, rot));
    if (m.appear) tracks.push(new THREE.VectorKeyframeTrack(`${o.name}.scale`, times, scl));
  });
  (n.lanterns || []).forEach((L, k) => {
    L.name = L.name || `lantern_${k}`;
    const rot = [];
    times.forEach((t) => { q.setFromAxisAngle(zAxis, Math.sin(t / 1.5 * Math.PI * 2 + k * 1.3) * 0.12); rot.push(q.x, q.y, q.z, q.w); });
    tracks.push(new THREE.QuaternionKeyframeTrack(`${L.name}.quaternion`, times, rot));
  });
  return new THREE.AnimationClip('Neighbourhood life', length, tracks);
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
      // MindAR's card plane is XY (+Y = the card's top edge, +Z = towards the camera).
      // The model stands upright in front of the card and faces the viewer, like a pop-up book:
      // its ground sits along the lower part of the card, tipped back 24° so the streets and fields stay visible.
      this.holder.position.set(0, -0.2, 0.16);
      this.holder.scale.setScalar(0.78);
      this.holder.rotation.x = 0.42;
      this.el.object3D.add(this.holder);
      this.n = null; this.t0 = null;
      this.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const use = (n) => { if (!this.holder) return; this.n = n; this.holder.add(n.root); this.t0 = null; };
      customModelExists().then((yes) => (yes
        ? loadNeighborhoodGLB(A.THREE, A.THREE.GLTFLoader, A.THREE.DRACOLoader).catch((e) => { console.warn('Own model failed to load, using the built-in one.', e); return buildNeighborhood(A.THREE); })
        : buildNeighborhood(A.THREE))).then(use);
    },
    tick(time) {
      if (!this.n || !this.el.object3D.visible) return;     // still loading, or card not in view
      if (this.t0 === null) this.t0 = time;
      const t = (time - this.t0) / 1000;
      tickNeighborhood(this.n, t);
      // a slow sway left and right shows that it is 3D (none when Reduce Motion is on)
      if (!this.still) this.n.root.rotation.y = Math.sin(t * 0.5) * 0.22;
    },
    remove() { this.el.object3D.remove(this.holder); this.holder = null; },
  });
}
