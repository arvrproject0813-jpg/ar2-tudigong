# English text -> Kokoro phonemes for kokoro-v1.1-zh.
# espeak-ng (through kokoro-onnx) turns the words into phonemes, then two fixes:
#  1. symbols this model has no token for are rewritten. Above all ɚ: it was silently dropped, so "culture" came out
#     as "cultch", "corners" as "corns", "lunar" as "loon", "record" as "wrecked", "inquiry" as "in greek".
#  2. names and Chinese terms are respelled for espeak, and the respelling's phonemes are swapped for fixed ones.
import re
from kokoro_onnx.tokenizer import Tokenizer
_tok = Tokenizer()
#           word in the text (regex)   respelling        phonemes to use
NAMES = [(r"\bTudigong\b",        "Too-dee-gong",      "tˈuːdˈiːɡˈɔŋ"),
         (r"\bBogong\b",          "Bo-gong",           "bˈoʊɡˈɔŋ"),
         (r"\bMeinong\b",         "May-nong",          "mˈeɪnˈɔŋ"),
         (r"\bKaohsiung\b",       "Gow-shyoong",       "ɡˌaʊʃjˈʊŋ"),
         (r"\b[Zz]uoya\b",        "zwoh-yah",          "zwˈoʊjˈɑː"),
         (r"\bTouya\b",           "Toe-yah",           "tˈoʊjˈɑː"),
         (r"\bWeiya\b",           "Way-yah",           "wˈeɪjˈɑː"),
         (r"\b[Ff]uchang\b",      "foo-chahng",        "fˈuːʧˈɑːŋ"),
         (r"\bHakka\b",           "Hah-kah",           "hˈɑːkə"),
         (r"\bFude Zhengshen\b",  "Foo-duh Jung-shun", "fˈuːdə ʤˈʌŋʃˈʌn"),
         (r"\bYong['’]an\b",      "Yong-ahn",          "jˈʊŋˈɑːn"),
         (r"\bAR\b",              "A-R",               "ˈeɪˈɑːɹ")]
_resp = {r: _tok.phonemize(r, 'en-us').strip() for _, r, _ in NAMES}
def phonemes(text, diph=False):
    t = text.replace('’', "'")
    expect = {}
    for pat, resp, _ in NAMES:
        n = len(re.findall(pat, t))
        if n: t = re.sub(pat, resp, t); expect[resp] = n
    ph = _tok.phonemize(t, 'en-us')
    for pat, resp, target in NAMES:
        if resp in expect:
            got = ph.count(_resp[resp])
            if got != expect[resp]: print(f'  ! {resp}: expected {expect[resp]}× {_resp[resp]}, found {got}× in: {ph}')
            ph = ph.replace(_resp[resp], target)
    ph = ph.replace('ɚ', 'əɹ').replace('ɝ', 'ɜɹ').replace('dʒ', 'ʤ').replace('tʃ', 'ʧ')
    if diph:
        for a, b in (('eɪ', 'A'), ('aɪ', 'I'), ('aʊ', 'W'), ('ɔɪ', 'Y'), ('oʊ', 'O')): ph = ph.replace(a, b)
        ph = ph.replace('ː', '')
    return ph
if __name__ == '__main__':
    import sys
    for s in sys.argv[1:]: print(phonemes(s)); print(phonemes(s, True))
