"""Builds the ElevenLabs prompt for each section from script.json: "~" -> [pause], plus a few delivery tags.
python research/raktabija/tts_prompts.py  -> writes tts/prompts.json"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'script.json')))
# delivery tags: (section, line index) -> tag placed before the line
TAGS = {('s1', 0): '[softly]', ('s1', 5): '[pause]', ('s2', 0): '[softly]', ('s2', 12): '[laughs]',
        ('s3', 3): '[whispers]', ('s3', 4): '[calmly]', ('s3', 11): '[trembling voice]', ('s4', 7): '[softly]', ('s5', 3): '[sad]',
        ('s5', 12): '[softly]', ('s6', 2): '[whispers]', ('s6', 5): '[softly]', ('s7', 6): '[pause]',
        ('s7', 14): '[softly]', ('s8', 0): '[softly]', ('s9', 0): '[softly]', ('s9', 13): '[whispers]'}
out = {}
for sec in S['sections']:
    parts = []
    for i, l in enumerate(sec['lines']):
        t = l['hi'].replace(S['pause_mark'], ' [pause] ')
        tag = TAGS.get((sec['id'], i))
        parts.append((tag + ' ' if tag else '') + t)
    out[sec['id']] = '\n'.join(parts)
os.makedirs(os.path.join(HERE, 'tts'), exist_ok=True)
json.dump(out, open(os.path.join(HERE, 'tts', 'prompts.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, len(v))
print('total chars', sum(len(v) for v in out.values()))
