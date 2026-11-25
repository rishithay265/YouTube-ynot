"""dl.py gNN <url> <generation_id>: save one ElevenLabs take as vo/gNN.mp3, note its id, print the next script to record."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
g, url, gid = sys.argv[1:4]
subprocess.run(['curl', '-sL', '-o', os.path.join(D, g + '.mp3'), url], check=True)
p = os.path.join(D, 'generations.json'); G = json.load(open(p)); G[g] = gid; json.dump(G, open(p, 'w'), indent=1)
d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(D, g + '.mp3')], capture_output=True, text=True).stdout.strip()
print(g, 'saved', d, 's')
S = json.load(open(os.path.join(D, 'scripts.json')))
todo = [k for k in S if k != 'g04' and not os.path.exists(os.path.join(D, k + '.mp3'))]
print('left:', todo)
if todo: print('NEXT', todo[0]); print(S[todo[0]]['A'] + '\n\n' + S[todo[0]]['B'])
