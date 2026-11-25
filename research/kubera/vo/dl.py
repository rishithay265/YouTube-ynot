"""dl.py S# <url> <generation_id>: save one ElevenLabs take as vo/S#.mp3, note its id, print the next section's text."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
s, url, gid = sys.argv[1:4]
subprocess.run(['curl', '-sL', '-o', os.path.join(D, s + '.mp3'), url], check=True)
p = os.path.join(D, 'generations.json'); G = json.load(open(p)) if os.path.exists(p) else {}
G[s] = gid; json.dump(G, open(p, 'w'), indent=1)
d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(D, s + '.mp3')], capture_output=True, text=True).stdout.strip()
print(s, 'saved', d, 's')
J = json.load(open(os.path.join(D, 'scripts.json')))
todo = [k for k in J if not os.path.exists(os.path.join(D, k + '.mp3'))]
print('left:', todo)
if todo:
    print('NEXT', todo[0]); print('\n\n'.join(x for x in J[todo[0]]['tts'] if x != '<<CHANT>>'))
