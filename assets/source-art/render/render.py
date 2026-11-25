"""Drive render.html with Playwright.  python3 render.py <jobs.json>
jobs.json: [{"out": "assets/img/x.png", "opts": {...window.shot options...}, "ss": 2}, {"glb": "assets/models/x.glb", "opts": {...}}]
Images are rendered at ss× the size and scaled down (smooth edges). Paths are relative to the repo root."""
import asyncio, base64, io, json, socket, subprocess, sys, time, os
from playwright.async_api import async_playwright
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
def free_port():
    s = socket.socket(); s.bind(('', 0)); p = s.getsockname()[1]; s.close(); return p
async def main(jobs):
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    results = {}
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
            pg = await b.new_page(viewport={'width': 400, 'height': 300})
            pg.on('pageerror', lambda e: print('PAGE ERROR', e))
            pg.on('console', lambda m: print('console:', m.text) if m.type in ('error', 'warning') else None)
            await pg.goto(f'http://localhost:{port}/assets/source-art/render/render.html')
            ok = await pg.evaluate('window.ready')
            print('kit loaded:', ok)
            for job in jobs:
                o = dict(job['opts'])
                if 'glb' in job:
                    b64 = await pg.evaluate('(o) => window.glb(o)', o)
                    path = os.path.join(ROOT, job['glb']); os.makedirs(os.path.dirname(path), exist_ok=True)
                    open(path, 'wb').write(base64.b64decode(b64)); print('glb', job['glb'], os.path.getsize(path)); continue
                ss = job.get('ss', 2)
                W, H = o['w'], o['h']
                o['w'], o['h'] = W * ss, H * ss
                r = await pg.evaluate('(o) => window.shot(o)', o)
                img = Image.open(io.BytesIO(base64.b64decode(r['url'].split(',', 1)[1]))).convert('RGBA')
                if ss != 1: img = img.resize((W, H), Image.LANCZOS)
                path = os.path.join(ROOT, job['out']); os.makedirs(os.path.dirname(path), exist_ok=True)
                if path.endswith('.webp'): img.save(path, 'WEBP', quality=job.get('q', 86), method=6)
                else: img.save(path)
                scale = 1 / ss
                results[job['out']] = {'pts': {k: [v[0] * scale, v[1] * scale] for k, v in r['pts'].items()},
                                       'anchors': {k: [v[0] * scale, v[1] * scale] for k, v in r['anchors'].items()},
                                       'size': [W, H], 'extra': r.get('extra')}
                print('img', job['out'], os.path.getsize(path))
            await b.close()
    finally:
        srv.kill()
    return results
if __name__ == '__main__':
    jobs = json.load(open(sys.argv[1]))
    res = asyncio.run(main(jobs))
    out = sys.argv[2] if len(sys.argv) > 2 else None
    if out: json.dump(res, open(out, 'w'), indent=1)
    else: print(json.dumps(res, indent=1)[:3000])
