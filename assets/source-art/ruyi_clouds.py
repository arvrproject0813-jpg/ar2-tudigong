# Usage: python3 ruyi_clouds.py <old clouds svg (git history)> <new svg>
# Redraw the auspicious (ruyi) clouds: same places, sizes and colours as before, but each cloud is one
# flowing shape: scalloped lobes that curl, and a tail that grows out of the body and tapers away.
import sys, re, math
import xml.etree.ElementTree as ET
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')

def spiral(cx, cy, r, turns=1.6, start=0.0, cw=True, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n
        a = start + (1 if cw else -1) * t * turns * 2 * math.pi
        rr = r * (1 - t * 0.92)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts

def d_of(pts, close=False):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if close else '')

def smooth_d(poly):
    # Catmull-Rom → cubic Bézier through the outline points, for a soft brush-like edge
    p = list(poly.exterior.coords)[:-1]
    n = len(p); out = f'M{p[0][0]:.1f} {p[0][1]:.1f}'
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out += f' C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return out + ' Z'

def tail_poly(x0, y0, x1, y1, w0, lift, n=40):
    # a ribbon from (x0,y0) to (x1,y1): gentle S-curve, thick at the root, sharp at the tip, tip flicks up
    top, bot = [], []
    for i in range(n + 1):
        t = i / n
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t - lift * math.sin(t * math.pi) * 0.5 + lift * 0.35 * math.sin(t * 2 * math.pi)
        w = w0 * (1 - t) ** 1.25 * (0.75 + 0.25 * math.cos(t * math.pi / 2))
        top.append((x, y - w * 0.55)); bot.append((x, y + w * 0.45))
    return Polygon(top + bot[::-1]).buffer(0)

def redraw(src, dst):
    tree = ET.parse(src); root = tree.getroot()
    for g in root.findall(NS + 'g'):
        circles = [(float(c.get('cx')), float(c.get('cy')), float(c.get('r'))) for c in g.findall(NS + 'circle')][5:]   # the 5 fill circles
        rect = g.find(NS + 'rect'); rx0, ry0, rw, rh = (float(rect.get(k)) for k in ('x', 'y', 'width', 'height'))
        fill = g.findall(NS + 'circle')[5].get('fill')
        tail = g.findall(NS + 'path')[0]
        tail_xs = [float(v) for v in re.findall(r'(-?\d+\.?\d*) -?\d+\.?\d*', tail.get('d'))]
        tip_x = max(tail_xs)
        shadow = g.find(NS + 'ellipse')
        stroke_w = float(tail.get('stroke-width'))
        H = rh                                     # base height sets the scale
        base_y = ry0 + rh                          # bottom of the old body
        left, right = rx0, rx0 + rw
        # body: the old top lobes, plus soft scallops underneath instead of a flat ruler-straight base
        parts = [Point(cx, cy).buffer(r, 48) for cx, cy, r in circles]
        k = 3
        for i in range(k):
            t = (i + 0.5) / k
            parts.append(Point(left + rw * (0.08 + 0.84 * t), base_y - H * 0.55).buffer(H * 0.68, 48))
        # a curl lobe on the tail side, where the tail is born
        lx, ly, lr = circles[0]
        root_x, root_y = right - H * 0.1, base_y - H * 0.35
        parts.append(Point(root_x, root_y).buffer(H * 0.55, 48))
        # the tail grows out of that lobe and sweeps away, tapering to a point
        parts.append(tail_poly(root_x - H * 0.6, root_y + H * 0.05, tip_x, root_y - H * 0.55, H * 1.05, H * 0.9))
        shape = unary_union(parts).buffer(H * 0.32, 32).buffer(-H * 0.32, 32).simplify(0.4)
        # rebuild the group
        for ch in list(g):
            if ch.tag != NS + 'ellipse': g.remove(ch)
        body = ET.SubElement(g, NS + 'path', {'d': smooth_d(shape), 'fill': fill, 'stroke': '#C9952E', 'stroke-width': f'{stroke_w * 1.05:.2f}', 'stroke-linejoin': 'round', 'opacity': '.96'})
        sw = f'{stroke_w * 0.8:.2f}'
        # curls in the big lobes (each one starts at the lobe's lower edge and winds in)
        for cx, cy, r in sorted(circles, key=lambda c: -c[2])[:3]:
            cw = cx > (left + right) / 2
            pts = spiral(cx, cy + r * 0.1, r * 0.62, turns=1.55, start=(math.pi * 0.55 if cw else math.pi * 0.45), cw=not cw)
            ET.SubElement(g, NS + 'path', {'d': d_of(pts), 'fill': 'none', 'stroke': '#C9952E', 'stroke-width': sw, 'stroke-linecap': 'round', 'opacity': '.85'})
        # the root curl: a spiral at the tail's root whose line runs out along the tail, tying the two together
        rc = spiral(root_x, root_y - H * 0.05, H * 0.42, turns=1.5, start=math.pi * 0.5, cw=False)[::-1]
        line = []
        for i in range(1, 26):
            t = i / 26 * 0.5
            x0, y0, x1, y1 = root_x, root_y + H * 0.37, tip_x, root_y - H * 0.55
            x = x0 + (x1 - x0) * t
            y = y0 + (y1 - y0) * t - H * 0.9 * math.sin(t * math.pi) * 0.5 + H * 0.9 * 0.35 * math.sin(t * 2 * math.pi) + H * 0.06 * t
            line.append((x, y))
        ET.SubElement(g, NS + 'path', {'d': d_of(rc), 'fill': 'none', 'stroke': '#C9952E', 'stroke-width': sw, 'stroke-linecap': 'round', 'opacity': '.8'})
    tree.write(dst, encoding='unicode')

redraw(sys.argv[1], sys.argv[2])
