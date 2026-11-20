"""Script text -> display tokens (what captions show) and the words actually spoken (what the aligner matches)."""
import re
SPECIAL = {
    'A.P.T.': ['a', 'p', 't'], '38': ['thirty', 'eight'], 'I.C.3': ['i', 'c', 'three'], 'AI': ['a', 'i'],
}
DISPLAY = {'A.P.T.': 'APT', 'I.C.3': 'IC3'}

def norm(w):
    return re.sub(r"[^a-z']", '', w.lower().replace('’', "'"))

def tokens(text):
    """[(display, punct, [spoken words])]. Hyphenated words are one caption token but several spoken words."""
    out = []
    for raw in text.split():
        m = re.match(r'^(.*?)([.,!?;:]*)$', raw)
        core, p = m.group(1), m.group(2)
        if core in SPECIAL:
            spoken = SPECIAL[core]
        elif core + p in SPECIAL:
            core, p, spoken = core + p, '', SPECIAL[core + p]
        else:
            spoken = [norm(x) for x in core.split('-') if norm(x)]
        disp = DISPLAY.get(core, core)
        out.append((disp, p[-1:] if p else '', spoken))
    # "I.C.3 dot gov" reads better on screen as one token
    merged = []
    i = 0
    while i < len(out):
        if out[i][0] == 'IC3' and i + 2 < len(out) and out[i + 1][0] == 'dot' and out[i + 2][0].startswith('gov'):
            merged.append(('IC3.gov', out[i + 2][1], out[i][2] + out[i + 1][2] + out[i + 2][2])); i += 3; continue
        merged.append(out[i]); i += 1
    return merged
