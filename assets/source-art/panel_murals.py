# Three gold line-art murals for the side panel (SVG). Opacity is baked into the strokes so the
# mural reads as a faint gilded wall painting behind the text.
import math, random
G='#B8862B'; G2='#D4A848'

def cloud(x,y,s,flip=1):
    # a ruyi cloud: three bumps with a curled spiral at one end
    k=s
    d=(f"M{x-30*k*flip:.1f} {y:.1f} "
       f"c{-2*k*flip:.1f} {-12*k:.1f} {12*k*flip:.1f} {-18*k:.1f} {20*k*flip:.1f} {-10*k:.1f} "
       f"c{4*k*flip:.1f} {-14*k:.1f} {24*k*flip:.1f} {-14*k:.1f} {26*k*flip:.1f} {0:.1f} "
       f"c{10*k*flip:.1f} {-6*k:.1f} {22*k*flip:.1f} {2*k:.1f} {18*k*flip:.1f} {12*k:.1f} "
       f"c{-3*k*flip:.1f} {6*k:.1f} {-12*k*flip:.1f} {6*k:.1f} {-13*k*flip:.1f} {0:.1f} "
       f"c{-1*k*flip:.1f} {-5*k:.1f} {6*k*flip:.1f} {-6*k:.1f} {7*k*flip:.1f} {-1*k:.1f}")
    tail=f"M{x-30*k*flip:.1f} {y:.1f} q{-30*k*flip:.1f} {6*k:.1f} {-70*k*flip:.1f} {2*k:.1f}"
    return f'<path d="{d}"/><path d="{tail}"/>'

def svg(w,h,body,extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMax slice">{extra}{body}</svg>'

def ridge(y0,amp,seed,w=400):
    random.seed(seed); pts=[]; x=-10
    d=f"M-10 {y0}"
    while x<w+10:
        step=random.uniform(40,80); h=amp*random.uniform(.4,1)
        d+=f" Q{x+step*.5:.1f} {y0-h*2:.1f} {x+step:.1f} {y0-random.uniform(0,amp*.3):.1f}"; x+=step
    return d

# ---------- 1: gilded landscape (mountains, clouds, banyan, shrine roof, paddies) ----------
def landscape():
    W,H=400,560; b=''
    # mountains: soft gold wash + outline
    for y0,amp,seed,op in [(330,60,3,.035),(370,46,9,.045),(410,30,15,.055)]:
        d=ridge(y0,amp,seed)
        b+=f'<path d="{d} V{H} H-10Z" fill="{G}" fill-opacity="{op}" stroke="{G}" stroke-opacity=".28" stroke-width="1.1"/>'
        # cun texture strokes on the slopes
        random.seed(seed+1)
        for i in range(10):
            x=random.uniform(0,W); y=y0-random.uniform(0,amp*.9)
            b+=f'<path d="M{x:.1f} {y:.1f} q6 10 2 22" stroke="{G}" stroke-opacity=".22" stroke-width="1" fill="none"/>'
    # clouds
    b+='<g fill="none" stroke="'+G+'" stroke-opacity=".38" stroke-width="1.4" stroke-linecap="round">'
    b+=cloud(300,250,1.1)+cloud(110,300,.85,-1)+cloud(220,180,.7)
    b+='</g>'
    # paddies
    for i in range(7):
        y=455+i*15; a=6+i*2
        b+=f'<path d="M-10 {y} C100 {y-a} 220 {y+a} 410 {y-a*.6}" fill="none" stroke="{G}" stroke-opacity="{.18+i*.03:.2f}" stroke-width="1.1"/>'
    # banyan (left): trunk, aerial roots, canopy of scalloped arcs
    t='<g fill="none" stroke="'+G+'" stroke-opacity=".42" stroke-width="1.4" stroke-linecap="round">'
    t+='<path d="M64 470 C66 440 60 420 70 395 M84 470 C82 445 88 420 80 395 M70 395 C60 380 50 378 40 380 M80 395 C92 380 104 378 116 382"/>'
    for x in (46,58,96,108): t+=f'<path d="M{x} 384 V{430+(x%3)*8}"/>'
    for cx,cy,r in [(40,360,24),(70,345,30),(104,356,26),(56,330,22),(90,325,22),(128,370,18),(20,378,16)]:
        t+=f'<path d="M{cx-r} {cy} a{r} {r*.8} 0 0 1 {2*r} 0"/>'
    t+='</g>'
    # shrine roofline (right) with swallowtail ridge
    s='<g fill="none" stroke="'+G+'" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round">'
    s+='<path d="M268 432 Q300 418 330 418 Q360 418 392 432"/><path d="M276 431 C266 426 262 418 264 410 M384 431 C394 426 398 418 396 410"/>'
    s+='<path d="M286 432 V470 M374 432 V470 M300 446 H360 V470 H300Z M322 470 V452 a8 8 0 0 1 16 0 V470"/><path d="M260 470 H400"/>'
    s+='</g>'
    return svg(W,H,b+t+s)

# ---------- 2: lattice window corners + cloud scroll band ----------
def lattice():
    W,H=400,700; b='<g fill="none" stroke="'+G+'" stroke-opacity=".34" stroke-width="1.5" stroke-linecap="square">'
    def corner(x,y,sx,sy):
        p=''
        for i in range(4):
            o=i*9
            p+=f'<path d="M{x+sx*o} {y+sy*(70-o)} V{y+sy*o} H{x+sx*(70-o)}"/>'
        # key-fret hook
        p+=f'<path d="M{x+sx*40} {y+sy*40} h{sx*18} v{sy*18} h{-sx*10} v{-sy*10}"/>'
        return p
    b+=corner(10,10,1,1)+corner(390,10,-1,1)+corner(10,690,1,-1)+corner(390,690,-1,-1)
    # thin double frame
    b+='<rect x="22" y="22" width="356" height="656" stroke-opacity=".16"/><rect x="28" y="28" width="344" height="644" stroke-opacity=".1"/>'
    b+='</g><g fill="none" stroke="'+G+'" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round">'
    b+=cloud(120,420,1.2,-1)+cloud(300,470,1.0)+cloud(200,540,.8,-1)+cloud(330,200,.75)
    b+='</g>'
    # a medallion of lattice (round window) in the middle-bottom
    m='<g fill="none" stroke="'+G+'" stroke-opacity=".22" stroke-width="1.2">'
    cx,cy,r=200,600,70
    m+=f'<circle cx="{cx}" cy="{cy}" r="{r}"/><circle cx="{cx}" cy="{cy}" r="{r-6}"/>'
    for i in range(-3,4):
        o=i*18
        m+=f'<path d="M{cx+o} {cy-math.sqrt(max(0,(r-6)**2-o*o)):.1f} V{cy+math.sqrt(max(0,(r-6)**2-o*o)):.1f}"/>'
        m+=f'<path d="M{cx-math.sqrt(max(0,(r-6)**2-o*o)):.1f} {cy+o} H{cx+math.sqrt(max(0,(r-6)**2-o*o)):.1f}"/>'
    m+='</g>'
    return svg(W,H,b+m).replace('xMidYMax slice','none')

# ---------- 3: gold-leaf flecks (灑金) + gilded mountain wash ----------
def flecks():
    W,H=400,700; random.seed(5); b=''
    for i in range(140):
        x=random.uniform(0,W); y=random.uniform(0,H); r=random.uniform(1.2,4.6)
        n=random.randint(4,6); pts=[]
        for k in range(n):
            a=2*math.pi*k/n+random.uniform(-.4,.4); rr=r*random.uniform(.5,1.2)
            pts.append(f"{x+rr*math.cos(a):.1f},{y+rr*math.sin(a):.1f}")
        b+=f'<polygon points="{" ".join(pts)}" fill="{random.choice([G,G2,"#E6C26A"])}" fill-opacity="{random.uniform(.18,.45):.2f}"/>'
    defs='<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+G2+'" stop-opacity=".22"/><stop offset="1" stop-color="'+G+'" stop-opacity=".04"/></linearGradient></defs>'
    for y0,amp,seed in [(560,70,4),(610,50,12)]:
        b+=f'<path d="{ridge(y0,amp,seed)} V{H} H-10Z" fill="url(#g)"/>'
        b+=f'<path d="{ridge(y0,amp,seed)}" fill="none" stroke="{G}" stroke-opacity=".3" stroke-width="1.1"/>'
    b+='<g fill="none" stroke="'+G+'" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round">'+cloud(300,470,1.0)+cloud(110,510,.8,-1)+'</g>'
    return svg(W,H,defs+b).replace('xMidYMax slice','xMidYMax slice')

for n,f in [('landscape',landscape),('lattice',lattice),('flecks',flecks)]:
    open(f'mural_{n}.svg','w').write(f())
print('ok')
