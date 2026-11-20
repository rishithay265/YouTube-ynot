"""Find a quote's exact word boxes on a page image from tesseract TSV output.
Returns per-line highlight rects (image px) and the crop that holds those lines."""
import csv, re, sys, json
def load(tsv):
    rows = [r for r in csv.DictReader(open(tsv), delimiter='\t', quoting=csv.QUOTE_NONE) if r['level'] == '5' and r['text'].strip()]
    return [dict(t=r['text'], x=int(r['left']), y=int(r['top']), w=int(r['width']), h=int(r['height']), line=(r['block_num'], r['par_num'], r['line_num'])) for r in rows]
def n(s): return re.sub(r'[^a-z0-9$]', '', s.lower().replace('’', "'"))
def find(words, quote):
    q = [n(x) for x in quote.split() if n(x)]
    ws = [n(w['t']) for w in words]
    best = None
    for i in range(len(ws)):
        k, j, score = 0, i, 0
        while k < len(q) and j < len(ws):
            if not ws[j]: j += 1; continue
            if ws[j] == q[k] or (len(q[k]) > 3 and (ws[j].startswith(q[k][:4]) or q[k].startswith(ws[j][:4]))): score += 1
            elif ws[j].replace('-', '') == ''.join(q[k:k+2]): score += 2; k += 1
            else: break
            k += 1; j += 1
        if best is None or score > best[0]: best = (score, i, j)
    score, i, j = best
    hit = words[i:j]
    lines = {}
    for w in hit: lines.setdefault(w['line'], []).append(w)
    rects = []
    for ln in lines.values():
        x0 = min(w['x'] for w in ln); x1 = max(w['x'] + w['w'] for w in ln)
        y0 = min(w['y'] for w in ln); y1 = max(w['y'] + w['h'] for w in ln)
        rects.append(dict(x=x0, y=y0, w=x1 - x0, h=y1 - y0))
    return dict(score=score, of=len(q), text=' '.join(w['t'] for w in hit), rects=rects)
if __name__ == '__main__':
    words = load(sys.argv[1]); print(json.dumps(find(words, sys.argv[2])))
