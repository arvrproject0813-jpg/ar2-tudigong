# Usage: python3 xiangyun_clouds.py <original clouds svg (git ee5f7c3)> <new svg>
#
# Redraws each auspicious cloud (祥雲) in the classic hand-drawn style: a head of round lobes, each lobe
# with a curl that starts in the notch between two lobes and winds inward, a smooth underside, and a tail
# that flows out of the bottom of the head and tapers to a point that flicks up. Same places, sizes and
# fill colours as the original layer; gold outline (#C9952E).
import sys, re, math, random
import xml.etree.ElementTree as ET
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union
from shapely import affinity

NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
GOLD = '#C9952E'

def smooth_d(poly):
    p = list(poly.exterior.coords)[:-1]
    n = len(p); out = f'M{p[0][0]:.1f} {p[0][1]:.1f}'
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return out + ' Z'

def line_d(pts):
    # smooth open curve through points
    out = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    n = len(pts)
    for i in range(n - 1):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return out

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])

def circ_meet(a, b):
    # the two crossing points of circles a and b
    (x0, y0, r0), (x1, y1, r1) = a, b
    d = math.hypot(x1 - x0, y1 - y0)
    if d >= r0 + r1 or d <= abs(r0 - r1): return []
    l = (r0 * r0 - r1 * r1 + d * d) / (2 * d); h = math.sqrt(max(r0 * r0 - l * l, 0))
    mx, my = x0 + l * (x1 - x0) / d, y0 + l * (y1 - y0) / d
    return [(mx + h * (y1 - y0) / d, my - h * (x1 - x0) / d), (mx - h * (y1 - y0) / d, my + h * (x1 - x0) / d)]

def curl(lobe, other, shape, turns=1.15, end=0.2):
    """A curl in `lobe` that starts at its notch with `other` and winds inward, away from `other`."""
    cx, cy, r = lobe
    pts = [p for p in circ_meet(lobe, other) if shape.exterior.distance(Point(p)) < r * 0.08]
    if not pts: return None
    nx, ny = max(pts, key=lambda p: -p[1])           # the upper notch if both are on the outline
    a0 = math.atan2(ny - cy, nx - cx)
    b = math.atan2(other[1] - cy, other[0] - cx)
    da = (a0 - b + math.pi) % (2 * math.pi) - math.pi
    sgn = 1 if da > 0 else -1
    out = []
    for i in range(46):
        t = i / 45
        a = a0 + sgn * t * turns * 2 * math.pi
        rr = r * (end + (0.95 - end) * (1 - t) ** 1.5)       # peels away from the edge, then winds in
        out.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return out

def make_cloud(L, T, W, tip, rnd, flip=False):
    """Head box: left L, top T, width W. Tail tip (x, y). Returns (outline polygon, curl polylines)."""
    j = lambda v, s=0.06: v * (1 + rnd.uniform(-s, s))
    # lobes in head units (x right, y down), tail goes right
    k = rnd.uniform(-1, 1)                         # each cloud leans a little differently
    U = [  # (x, y, r)
        (0.17, 0.36 + 0.03 * k, j(0.165, .1)),          # A left
        (0.39 - 0.03 * k, 0.23, j(0.225, .08)),         # B top, biggest
        (0.66 + 0.02 * k, 0.25 - 0.03 * k, j(0.19, .1)),   # C top right
        (0.84, 0.42 + 0.02 * k, j(0.15, .12)),          # D right
        (0.27, 0.50, j(0.14, .08)),                     # E lower left
    ]
    lob = [(L + x * W, T + y * W, r * W) for x, y, r in U]
    body = Polygon([(L + 0.18 * W, T + 0.40 * W), (L + 0.80 * W, T + 0.36 * W), (L + 0.86 * W, T + 0.55 * W), (L + 0.30 * W, T + 0.62 * W)])
    # tail: centreline from the bottom of the head out to the tip, dipping a little then rising
    root = (L + 0.55 * W, T + 0.56 * W)
    tx, ty = tip
    c1 = (root[0] + 0.30 * (tx - root[0]), root[1] + 0.10 * W)
    c2 = (root[0] + 0.68 * (tx - root[0]), ty + 0.10 * W)
    w0 = 0.15 * W
    top, bot, mid = [], [], []
    N = 60
    for i in range(N + 1):
        t = i / N
        x, y = bez(root, c1, c2, tip, t)
        x2, y2 = bez(root, c1, c2, tip, min(t + 0.01, 1)); x1_, y1_ = bez(root, c1, c2, tip, max(t - 0.01, 0))
        dx, dy = x2 - x1_, y2 - y1_; d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d                     # normal, pointing down for a rightward tail
        w = w0 * (1 - t) ** 1.15
        top.append((x - nx * w * 0.55, y - ny * w * 0.55)); bot.append((x + nx * w * 0.45, y + ny * w * 0.45)); mid.append((x, y))
    tail = Polygon(top + bot[::-1]).buffer(0)
    shape = unary_union([Point(x, y).buffer(r, 64) for x, y, r in lob] + [body, tail])
    shape = shape.buffer(0.02 * W, 24).buffer(-0.02 * W, 24)
    # a smooth underside: fill the little dips between the lower lobe and the tail's root
    closed = shape.buffer(0.18 * W, 32).buffer(-0.18 * W, 32)
    belly = Polygon([(L - W, T + 0.5 * W), (L + 0.66 * W, T + 0.5 * W), (L + 0.66 * W, T + 2 * W), (L - W, T + 2 * W)])
    shape = unary_union([shape, closed.intersection(belly)])
    if shape.geom_type != 'Polygon': shape = max(shape.geoms, key=lambda g: g.area)
    A, B, C, D, E = lob
    curls = [curl(B, A, shape, 1.2), curl(C, D, shape, 1.1), curl(A, E, shape, 0.95, 0.25), curl(D, C, shape, 0.9, 0.28)]
    # the tail's inner line: runs back along the tail and rolls into a curl in the lower-left lobe
    tl = [mid[i] for i in range(int(N * 0.62), 2, -2)]
    ex, ey, er = E
    a0 = math.atan2(tl[-1][1] - ey, tl[-1][0] - ex)
    sp = []
    for i in range(1, 30):
        t = i / 29
        a = a0 + t * 1.05 * 2 * math.pi
        rr = er * (0.8 - 0.58 * t)
        sp.append((ex + 0.1 * er + rr * math.cos(a), ey + rr * math.sin(a)))
    tailline = tl + sp
    curls = [c for c in curls if c] + [tailline]
    if flip:
        cx = L + W / 2
        shape = affinity.scale(shape, -1, 1, origin=(cx, 0))
        curls = [[(2 * cx - x, y) for x, y in c] for c in curls]
    return shape.simplify(0.3), curls

def redraw(src, dst):
    tree = ET.parse(src); root = tree.getroot()
    rnd = random.Random(7)
    for gi, g in enumerate(root.iter(NS + 'g')):
        cs = g.findall(NS + 'circle')
        rect = g.find(NS + 'rect')
        if rect is None or len(cs) < 10: continue
        circles = [(float(c.get('cx')), float(c.get('cy')), float(c.get('r'))) for c in cs[5:10]]
        fill = cs[5].get('fill')
        tail = g.findall(NS + 'path')[0]
        pts = [(float(a), float(b)) for a, b in re.findall(r'(-?\d+\.?\d*) (-?\d+\.?\d*)', tail.get('d'))]
        tipx = max(p[0] for p in pts)
        stroke_w = float(tail.get('stroke-width'))
        rx0, ry0, rw, rh = (float(rect.get(k)) for k in ('x', 'y', 'width', 'height'))
        left = min(rx0, min(c[0] - c[2] for c in circles))
        right = max(rx0 + rw, max(c[0] + c[2] for c in circles))
        bottom = ry0 + rh
        W = (right - left) * 0.84
        left += (right - left - W) * 0.3
        T = max(bottom - 0.66 * W, 6 + stroke_w)      # the head sits on the old base line (kept inside the tile)
        bottom = T + 0.66 * W
        tip = (min(tipx, left + W * 1.95), bottom - 0.40 * W)   # tails about one head long, like brush-drawn clouds
        shape, curls = make_cloud(left, T, W, tip, rnd)
        for ch in list(g):
            if ch.tag != NS + 'ellipse': g.remove(ch)
        sw = stroke_w * 1.0
        ET.SubElement(g, NS + 'path', {'d': smooth_d(shape), 'fill': fill, 'stroke': GOLD, 'stroke-width': f'{sw:.2f}', 'stroke-linejoin': 'round', 'opacity': '.97'})
        for c in curls:
            ET.SubElement(g, NS + 'path', {'d': line_d(c), 'fill': 'none', 'stroke': GOLD, 'stroke-width': f'{sw * 0.82:.2f}', 'stroke-linecap': 'round', 'opacity': '.9'})
    tree.write(dst, encoding='unicode')

if __name__ == '__main__':
    redraw(sys.argv[1], sys.argv[2])
