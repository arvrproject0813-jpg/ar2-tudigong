# Voice guide, page narration and P11 sentence audio with Kokoro-82M v1.1-zh (English af_sol, Mandarin zf_018, speed 0.92).
# usage: venv/bin/python make.py guide p07 p08 …   |   make.py narration p01 … p12   |   make.py p11
# Setup (once, in this folder): python3 -m venv venv && . venv/bin/activate && pip install kokoro-onnx soundfile
#   && pip install --ignore-requires-python "misaki[zh]==0.9.4" && pip install addict regex pypinyin-dict cn2an jieba ordered-set
# Model files (not in the repo, ~380 MB): kokoro-v1.1-zh.onnx and voices-v1.1-zh.bin from
#   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1 , and config.json from
#   https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh/resolve/main/config.json . Needs ffmpeg.
import sys, os, re, json, subprocess, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from misaki import zh
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from en_g2p import phonemes as en_phonemes      # English words -> phonemes this model knows (see en_g2p.py)
D = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(D, '../../..'))   # the repo root (this file is assets/source-art/tts/make.py)
OUT = os.path.join(D, 'out')
os.makedirs(OUT, exist_ok=True)
k = Kokoro(os.path.join(D, 'kokoro-v1.1-zh.onnx'), os.path.join(D, 'voices-v1.1-zh.bin'), vocab_config=os.path.join(D, 'config.json'))
g2p = zh.ZHG2P(version='1.1')
SPEED = 0.92
# Names and Chinese terms (Tudigong, Kaohsiung, zuoya …) have fixed pronunciations in en_g2p.py.

def content():
    s = open(os.path.join(REPO, 'content/content.js'), encoding='utf-8').read()
    i = s.index('const CONTENT = '); j = s.rindex(';\nexport default CONTENT;')
    return json.loads(s[i + len('const CONTENT = '):j])

def en_audio(text):
    samples, sr = k.create(en_phonemes(text, diph=True), voice='af_sol', speed=SPEED, is_phonemes=True)
    return samples, sr

def zh_audio(text):
    t = re.sub(r'\s*\bAR\b\s*', '擴增實境', text)          # "AR" is read as 擴增實境 (augmented reality)
    t = re.sub(r'[A-Za-z]+', '', t)
    if t != text: print('  (removed Latin letters from Chinese line)', text)
    ph, _ = g2p(t)
    samples, sr = k.create(ph, voice='zf_018', speed=SPEED, is_phonemes=True)
    return samples, sr

def write_mp3(samples, sr, path, kbps='64k'):
    wav = os.path.join(OUT, '_tmp.wav'); sf.write(wav, samples, sr)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    af = 'adelay=250:all=1,apad=pad_dur=0.4,loudnorm=I=-18:TP=-1.5:LRA=11'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', af, '-ar', '24000', '-ac', '1', '-b:a', kbps, path], check=True)
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

elif sys.argv[1] == 'narration':
    # the page narration (CONTENT.pXX.narration, the Listen button in "Story and words"), one sentence at a time:
    #   assets/audio/pXX_en.mp3 (English mode), pXX_zh.mp3 (中文 mode), pXX.mp3 (雙語 mode: English, then Mandarin)
    def sentences(text, zh=False):
        parts = re.split(r'(?<=[。！？])' if zh else r'(?<=[.?!])\s+(?=[A-Z“"])', text.strip())
        return [p.strip() for p in parts if p.strip()]
    def speak(text, zh=False):
        out, sr = [], 24000
        for i, sent in enumerate(sentences(text, zh)):
            a, sr = zh_audio(sent) if zh else en_audio(sent)
            if i: out.append(np.zeros(int(sr * 0.35), dtype=np.float32))
            out.append(a.astype(np.float32))
        return np.concatenate(out), sr
    for pid in sys.argv[2:]:
        n = C[pid]['narration']
        print(pid)
        en, sr = speak(n['en']); write_mp3(en, sr, f'{REPO}/assets/audio/{pid}_en.mp3', '48k')
        zh, sr2 = speak(n['zh'], zh=True); write_mp3(zh, sr2, f'{REPO}/assets/audio/{pid}_zh.mp3', '48k')
        both = np.concatenate([en, np.zeros(int(sr * 0.9), dtype=np.float32), zh])
        write_mp3(both, sr, f'{REPO}/assets/audio/{pid}.mp3', '48k')
