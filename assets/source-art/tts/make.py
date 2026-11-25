# Voice guide + P11 sentence audio with Kokoro-82M v1.1-zh (English af_sol, Mandarin zf_018, speed 0.92).
# usage: venv/bin/python make.py guide p07 p08 …   |   venv/bin/python make.py p11
# Setup (once, in this folder): python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile
#   && pip install --ignore-requires-python "misaki[zh]==0.9.4" && pip install addict regex pypinyin-dict cn2an jieba ordered-set
# Model files (not in the repo, ~380 MB): kokoro-v1.1-zh.onnx and voices-v1.1-zh.bin from
#   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1 , and config.json from
#   https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh/resolve/main/config.json . Needs ffmpeg.
import sys, os, re, json, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from misaki import zh
D = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(D, '../../..'))   # the repo root (this file is assets/source-art/tts/make.py)
OUT = os.path.join(D, 'out')
os.makedirs(OUT, exist_ok=True)
k = Kokoro(os.path.join(D, 'kokoro-v1.1-zh.onnx'), os.path.join(D, 'voices-v1.1-zh.bin'), vocab_config=os.path.join(D, 'config.json'))
g2p = zh.ZHG2P(version='1.1')
SPEED = 0.92
RESPELL = [(r'\bTudigong\b', 'Too-dee-gong'), (r'\bTouya\b', 'Toe-yah'), (r'\bWeiya\b', 'Way-yah'), (r'\bBogong\b', 'Bo-gong'),
           (r'\bMeinong\b', 'May-nong'), (r'\bzuoya\b', 'dzwoh-yah'), (r'\bZuoya\b', 'Dzwoh-yah'), (r'\bfuchang\b', 'foo-chahng'),
           (r'\bFuchang\b', 'Foo-chahng'), (r'\bKaohsiung\b', 'Gow-shyoong'), (r'\bHakka\b', 'Hah-kah')]

def content():
    s = open(os.path.join(REPO, 'content/content.js'), encoding='utf-8').read()
    i = s.index('const CONTENT = '); j = s.rindex(';\nexport default CONTENT;')
    return json.loads(s[i + len('const CONTENT = '):j])

def en_audio(text):
    t = text
    for a, b in RESPELL: t = re.sub(a, b, t)
    t = t.replace('’', "'")
    samples, sr = k.create(t, voice='af_sol', speed=SPEED, lang='en-us')
    return samples, sr

def zh_audio(text):
    t = re.sub(r'[A-Za-z]+', '', text)
    if t != text: print('  (removed Latin letters from Chinese line)', text)
    ph, _ = g2p(t)
    samples, sr = k.create(ph, voice='zf_018', speed=SPEED, is_phonemes=True)
    return samples, sr

def write_mp3(samples, sr, path):
    wav = os.path.join(OUT, '_tmp.wav'); sf.write(wav, samples, sr)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    af = 'adelay=250:all=1,apad=pad_dur=0.4,loudnorm=I=-18:TP=-1.5:LRA=11'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', af, '-ar', '24000', '-ac', '1', '-b:a', '64k', path], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    print(f'  {os.path.relpath(path, REPO)}  {d:.1f}s')

C = content()
if sys.argv[1] == 'guide':
    for pid in sys.argv[2:]:
        g = C[pid]['guide']
        print(pid)
        s, sr = en_audio(g['en']); write_mp3(s, sr, f'{REPO}/assets/audio/guide/{pid}_en.mp3')
        s, sr = zh_audio(g['zh']); write_mp3(s, sr, f'{REPO}/assets/audio/guide/{pid}_zh.mp3')
elif sys.argv[1] == 'p11':
    frames = C['p11']['frames']
    for t, f in enumerate(frames):
        ok = [i for i, o in enumerate(f['options']) if o.get('ok', True)]
        blanks = f['en'].count('___')
        combos = [[a, b] for a in ok for b in ok if a != b] if blanks == 2 else [[a] for a in ok]
        for fill in combos:
            parts = f['en'].split('___')
            text = ''.join(p + (f['options'][fill[i]]['en'] if i < len(fill) else '') for i, p in enumerate(parts))
            key = f"t{t + 1}_{'_'.join(map(str, fill))}"
            print(key, text)
            s, sr = en_audio(text); write_mp3(s, sr, f'{REPO}/assets/audio/p11/{key}.mp3')
