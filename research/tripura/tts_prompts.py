"""Builds the ElevenLabs (eleven_v4, Mohit) prompt for each section from script.json.
'~' -> '…' (a pause costs one credit, not seven), one line per sentence, a few delivery tags.
python research/tripura/tts_prompts.py  -> tts/prompts.json"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'script.json')))
TAGS = {('s1', 0): '[softly]', ('s3', 2): '[mocking]', ('s7', 5): '[coldly]', ('s10', 8): '[whispers]',
        ('s11', 0): '[intense]', ('s11', 8): '[trembling voice]', ('s11', 11): '[softly]',
        ('s12', 7): '[softly]', ('s12', 15): '[softly]'}
out = {}
for sec in S['sections']:
    parts = []
    for i, l in enumerate(sec['lines']):
        t = l['hi'].replace(' ~ ', '… ').replace('~', '…')
        tag = TAGS.get((sec['id'], i))
        parts.append((tag + ' ' if tag else '') + t)
    out[sec['id']] = '\n'.join(parts)
os.makedirs(os.path.join(HERE, 'tts'), exist_ok=True)
json.dump(out, open(os.path.join(HERE, 'tts', 'prompts.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, len(v))
print('total chars', sum(len(v) for v in out.values()))
