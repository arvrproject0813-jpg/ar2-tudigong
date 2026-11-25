// kaohsiung-map.js — a simplified, schematic map of Kaohsiung (not to scale, not for navigation), drawn in SVG.
// Used on P08 (From Kaohsiung to My Neighborhood) and P10 (Meinong). Shapes are rough tracings of the coast,
// the Kaoping River (the border with Pingtung) and the city's northern border, smoothed into soft curves.
//
//   const m = kaohsiungMap({ uid });   m.svg = <svg>, m.pct(lon, lat) = [x%, y%] for placing HTML pins on top.
//   view: [x, y, w, h] in map units shows only part of the map (P10: downtown to Meinong); m.xy(lon, lat) = map units.
const W0 = 120.14, E0 = 120.86, N0 = 23.1, S0 = 22.44, K = 1000;
const COS = Math.cos(22.8 * Math.PI / 180);
const X = (lon) => (lon - W0) * COS * K, Y = (lat) => (N0 - lat) * K;
export const MAP_W = X(E0), MAP_H = Y(S0);                       // ≈ 664 × 660
const P = ([lon, lat]) => [X(lon), Y(lat)];

// coast from the south (Kaoping River mouth) up to the north edge
const COAST = [[120.47, 22.44], [120.43, 22.474], [120.405, 22.478], [120.38, 22.49], [120.355, 22.51], [120.335, 22.53], [120.31, 22.555], [120.29, 22.58], [120.275, 22.605],
  [120.262, 22.625], [120.258, 22.645], [120.262, 22.665], [120.27, 22.685], [120.262, 22.705], [120.248, 22.73], [120.235, 22.76], [120.222, 22.79], [120.21, 22.82],
  [120.2, 22.85], [120.195, 22.88], [120.19, 22.91], [120.175, 22.96], [120.16, 23.02], [120.15, 23.1]];
// Kaoping River from its mouth upstream (north-east), leaving the map on the east edge
const RIVER = [[120.43, 22.474], [120.425, 22.51], [120.42, 22.55], [120.425, 22.59], [120.435, 22.63], [120.445, 22.67], [120.46, 22.705], [120.48, 22.74], [120.505, 22.77],
  [120.535, 22.8], [120.56, 22.82], [120.585, 22.845], [120.61, 22.87], [120.64, 22.892], [120.68, 22.905], [120.73, 22.918], [120.79, 22.935], [120.86, 22.96]];
// the northern border (with Tainan), from the coast at Hunei east to the top edge
const NORTH = [[120.195, 22.905], [120.235, 22.918], [120.27, 22.925], [120.3, 22.938], [120.34, 22.955], [120.38, 22.975], [120.42, 23.0], [120.46, 23.03], [120.5, 23.055], [120.54, 23.08], [120.565, 23.1]];
const LOVE = [[120.335, 22.705], [120.318, 22.68], [120.302, 22.658], [120.293, 22.638], [120.284, 22.619]];
const CIJIN = [[120.255, 22.621], [120.266, 22.603], [120.283, 22.58], [120.3, 22.558], [120.316, 22.541], [120.322, 22.544], [120.306, 22.562], [120.289, 22.585], [120.272, 22.607], [120.262, 22.623]];

/** Smooth open curve through points (Catmull-Rom → cubic Bézier). `move` false continues the current path. */
function curve(pts, move = true) {
  let d = move ? `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : `L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const closedCurve = (pts) => `${curve([...pts, pts[0]])} Z`;

export function kaohsiungMap({ uid = `km${Math.random().toString(36).slice(2, 7)}`, river = true, love = true, mountains = true, view = null } = {}) {
  const coast = COAST.map(P);
  // sea: everything west of the coast
  const sea = `M0 0 L${coast[coast.length - 1][0].toFixed(1)} 0 ${curve([...coast].reverse(), false).replace(/^L[^C]*/, '')} L${coast[0][0].toFixed(1)} ${MAP_H} L0 ${MAP_H} Z`;
  // Kaohsiung: the coast from Hunei down to the river mouth, up the river, along the east and top edges, back along the north border
  const hunei = COAST.findIndex(([, lat]) => lat >= 22.905);
  const coastS = coast.slice(1, hunei + 1).reverse();                  // Hunei → river mouth (south)
  const riv = RIVER.map(P), north = NORTH.map(P);
  const city = `${curve(coastS)} ${curve(riv, false).slice(curve(riv, false).indexOf('C'))} L${MAP_W} ${riv[riv.length - 1][1].toFixed(1)} L${MAP_W} 0 L${north[north.length - 1][0].toFixed(1)} 0 ${curve([...north].reverse(), false).slice(curve([...north].reverse(), false).indexOf('C'))} Z`;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  const [vx, vy, vw, vh] = view || [0, 0, MAP_W, MAP_H];
  svg.setAttribute('viewBox', `${vx} ${vy} ${(+vw).toFixed(0)} ${(+vh).toFixed(0)}`);
  svg.setAttribute('class', 'kmap');
  svg.setAttribute('aria-hidden', 'true');
  const hills = [];
  if (mountains) {
    // little hill marks in the north-east (the mountains above Meinong and beyond), and Shoushan by the harbour
    [[120.64, 23.06], [120.7, 23.02], [120.76, 23.06], [120.8, 23.0], [120.68, 22.97], [120.74, 22.96], [120.6, 23.0], [120.82, 23.08], [120.56, 22.98], [120.62, 22.94]]
      .forEach(([lon, lat], i) => { const [x, y] = P([lon, lat]); const s = 11 + (i % 3) * 3; hills.push(`<path class="km-hill" d="M${(x - s).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y - s * 1.3).toFixed(1)} ${(x + s).toFixed(1)} ${y.toFixed(1)}"/>`); });
    const [sx, sy] = P([120.268, 22.648]);
    hills.push(`<path class="km-hill is-small" d="M${(sx - 8).toFixed(1)} ${sy.toFixed(1)} Q${sx.toFixed(1)} ${(sy - 10).toFixed(1)} ${(sx + 8).toFixed(1)} ${sy.toFixed(1)}"/>`);
  }
  // soft grid like an old survey map, waves in the sea
  const grid = [];
  for (let x = 40; x < MAP_W; x += 60) grid.push(`<path d="M${x} 0V${MAP_H.toFixed(0)}"/>`);
  for (let y = 40; y < MAP_H; y += 60) grid.push(`<path d="M0 ${y}H${MAP_W.toFixed(0)}"/>`);
  const waves = [];
  for (let i = 0; i < 9; i++) { const x = 20 + (i % 3) * 40 + (i % 2) * 14, y = 80 + i * 62; waves.push(`<path d="M${x} ${y}q6 -5 12 0t12 0"/>`); }
  svg.innerHTML = `
    <defs>
      <pattern id="${uid}-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V8" stroke="rgba(31,107,102,.13)" stroke-width="2"/></pattern>
      <radialGradient id="${uid}-sea" cx="0.1" cy="0.6" r="0.9"><stop offset="0" stop-color="#CFE5E1"/><stop offset="1" stop-color="#B5D6D1"/></radialGradient>
    </defs>
    <rect class="km-land" width="${MAP_W.toFixed(0)}" height="${MAP_H.toFixed(0)}"/>
    <g class="km-grid">${grid.join('')}</g>
    <path class="km-city" d="${city}"/>
    <path class="km-city-hatch" d="${city}" fill="url(#${uid}-hatch)"/>
    <path class="km-sea" d="${sea}" fill="url(#${uid}-sea)"/>
    <g class="km-waves">${waves.join('')}</g>
    <path class="km-coast" d="${curve(coast)}"/>
    <path class="km-cijin" d="${closedCurve(CIJIN.map(P))}"/>
    ${river ? `<path class="km-river" d="${curve(riv)}"/>` : ''}
    ${love ? `<path class="km-love" d="${curve(LOVE.map(P))}"/>` : ''}
    <path class="km-border" d="${curve(north)}"/>
    <g class="km-hills">${hills.join('')}</g>`;
  return { svg, pct: (lon, lat) => [(X(lon) - vx) / vw * 100, (Y(lat) - vy) / vh * 100], xy: (lon, lat) => [X(lon), Y(lat)], ratio: vw / vh };
}

/** Places on the map (lon, lat). */
export const KMAP = {
  downtown: [120.305, 22.628], hood: [120.302, 22.642], meinong: [120.545, 22.895],
  label: [120.43, 22.81], strait: [120.185, 22.6], river: [120.5, 22.73], love: [120.322, 22.69], harbor: [120.29, 22.596],
  qishan: [120.48, 22.885],
};
