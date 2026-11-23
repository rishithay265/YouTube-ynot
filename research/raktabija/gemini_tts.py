"""Gemini TTS for the Raktabija film (the repo's second documented voice provider; see voice_google.md).

  python research/raktabija/gemini_tts.py voices hi-IN                 # list Hindi voices in the Voice Library
  python research/raktabija/gemini_tts.py say <voice> <text-file> <out.wav> [style]

The API key is read from GEMINI_API_KEY in the repo's .env (gitignored) or the environment. In the cloud session the
key lives in the environment's network secrets and the proxy sends it; .env then only needs a placeholder value.
Stdlib only, so it runs anywhere python3 does.
"""
import base64, json, os, re, sys, urllib.parse, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
API = 'https://generativelanguage.googleapis.com/v1beta'
MODEL = 'gemini-3.8-flash-tts'  # as in voice_google.md


def key():
    env = os.path.join(ROOT, '.env')
    if os.path.exists(env):
        for line in open(env):
            m = re.match(r'\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$', line)
            if m: return m.group(1).strip('"\'')
    return os.environ.get('GEMINI_API_KEY', '')


def call(method, path, body=None, query=None):
    url = f'{API}/{path}' + ('?' + urllib.parse.urlencode(query, doseq=True) if query else '')
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'x-goog-api-key': key(), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())


def to_gemini(text):
    """ElevenLabs-style [tags] -> Gemini: pauses become inline <pause> tags, other tags are dropped (style carries them)."""
    text = re.sub(r'\[(short pause|pause|long pause)\]', r'<\1>', text)
    return re.sub(r'\[[^\]]*\]\s*', '', text).strip()


def say(voice, text, out, style):
    body = {
        'model': MODEL,
        'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': to_gemini(text),
                                                       'annotations': [{'type': 'speech_metadata', 'style': style}]}]}],
        'response_format': {'type': 'audio', 'mime_type': 'audio/wav'},
        'generation_config': {'speech_config': [{'voice': voice}]},
    }
    res = call('POST', 'interactions', body)
    audio = [c for s in res.get('steps', []) if s.get('type') == 'model_output' for c in s.get('content', []) if c.get('type') == 'audio']
    if not audio: raise SystemExit('no audio in response: ' + json.dumps(res)[:500])
    open(out, 'wb').write(base64.b64decode(audio[-1]['data']))
    print('wrote', out)


if __name__ == '__main__':
    if sys.argv[1] == 'voices':
        res = call('GET', 'voices', query={'language_code': sys.argv[2:] or ['hi-IN']})
        for v in res.get('voices', []):
            print(v.get('id'), '|', v.get('display_name'), '|', v.get('gender'), '|', v.get('pitch'), '|', v.get('accent'), '|', (v.get('description') or '')[:120])
    elif sys.argv[1] == 'say':
        style = sys.argv[5] if len(sys.argv) > 5 else ('A young man speaking Hindi, hushed and fragile, with an echo of a proud '
                                                        'warrior in his voice; slow, intimate, cinematic narration.')
        say(sys.argv[2], open(sys.argv[3]).read(), sys.argv[4], style)
