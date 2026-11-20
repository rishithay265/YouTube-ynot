import json,subprocess,sys
from pocketsphinx import Decoder
from tokens import tokens
S=json.load(open('script_v2.json'))['sections']
def ed(a,b):
    d=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        p,d[0]=d[0],i
        for j,y in enumerate(b,1): p,d[j]=d[j],min(d[j]+1,d[j-1]+1,p+(x!=y))
    return d[-1]
n=sys.argv[1]; i=int(n[1])-1
raw=subprocess.run(['ffmpeg','-v','error','-i',f'tts/{n}.mp3','-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
d=Decoder(samprate=16000); d.start_utt(); d.process_raw(raw,full_utt=True); d.end_utt()
hyp=[s.word.split('(')[0] for s in d.seg() if not s.word.startswith('<') and not s.word.startswith('[') and s.word!='<sil>']
ref=[w for t in tokens(S[i]) for w in t[2]]
a=json.load(open(f'al/{n}.json'))
spec={w['w']:round(w['e']-w['s'],2) for w in a if w['w'] in ('APT','38','IC3.gov','AI','FaceStealer','FBI')}
print(n,'WER %.3f'%(ed(ref,hyp)/len(ref)),spec)
