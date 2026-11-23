"""The shot list of "मैं रक्तबीज नहीं था": each shot cuts on a cue in the narration, and its marks give the local frame of
words inside it, so reveals land on the voice (the FaceStealer v2 pattern, in Hindi).

cue:   'f:0'             the first frame
       'फिर वे'           the first word of the phrase, searched forward from the previous cue
       'नए नहीं@2'        the 2nd match after the previous cue
       'after:आँखों में'   just after the phrase ends (for a held card in an inserted pause), + LEAD_AFTER frames
marks: 'name=word'       local frame where the word starts ('word+e': where it ends; 'word@2': the 2nd match in the shot)
x:     dissolve frames into this shot (default XFADE in plan.py; 0 = hard cut)
"""

SHOTS = [
    # ---------------------------------------------------------------- opening card + s1 जन्म
    dict(kind='open_card', cue='f:0', note='logo and wordmark on navy; dark before the first word'),
    dict(kind='birth', cue='पहले', marks=['dark=पहले', 'push=धकेला'], note='darkness; the earth cracks and pushes him up'),
    dict(kind='grip', cue='हाथ', marks=['gada=गदा', 'roar=गर्जना', 'fire=आग'], note='hand closes on the mace; fire in the chest'),
    dict(kind='memory', cue='मुझे सब', marks=['shumbha=शुंभ', 'army=सेनाएँ', 'vajra=वज्र'], note="memories: Shumbha's throne, marching armies, Aindri's vajra"),
    dict(kind='iam', cue='मैं जानता', marks=['name=रक्तबीज'], note='low angle, alone against the sky: "I am Raktabija"'),
    # ---------------------------------------------------------------- s2 झूठा यक़ीन
    dict(kind='field', cue='मुझे याद', marks=['shumbha=शुंभ'], note='the battlefield below the peaks; lower-third (3 s)'),
    dict(kind='bow', cue='देवी ने धनुष', marks=['pull=डोरी', 'twang=टंकार'], note='Chandika draws the bow; the twang rings across the sky'),
    dict(kind='roar', cue='सिंह', marks=['bell=घंटा', 'kali=काली', 'swallow=निगल'], note='lion, bell, then a darkness swallows every sound'),
    dict(kind='matrikas', cue='फिर वे', marks=['b=ब्रह्माणी', 'm=माहेश्वरी', 'k=कौमारी', 'v=वैष्णवी', 'va=वाराही', 'n=नारसिंही', 'a=ऐन्द्री', 's=शिवदूती'],
         note='montage: the seven Matrikas and Shivaduti, names only'),
    dict(kind='scatter', cue='हमारी', marks=['break=बिखर'], note='the Asura ranks charge and scatter into gold dust'),
    dict(kind='advance', cue='तब मैं', marks=['rb=रक्तबीज'], note='Raktabija strides forward'),
    dict(kind='power', cue='क्योंकि', marks=['fall=गिरता', 'rise=उठता'], note='a drop falls; a warrior rises from it'),
    dict(kind='vajra', cue='ऐन्द्री का', marks=['hit=माथे', 'blood=बहा', 'rise=उठा'], note="Aindri's vajra strikes the brow; the narrator rises from the soil"),
    dict(kind='laugh', cue='मारो', marks=['more=ज़्यादा'], note='Raktabija laughs; more rise around him'),
    # ---------------------------------------------------------------- s3 पहचान
    dict(kind='twin', cue='तभी', marks=['face=चेहरा', 'q=तुम'], note='side by side: the same face looks back'),
    dict(kind='count', cue='फिर एक', marks=['one=एक', 'ten=दस', 'stop=छोड़'], note='one more, ten, too many to count'),
    dict(kind='front', cue='और तब', marks=['rb=रक्तबीज', 'wound=घाव'], note='at the front of the crowd: Raktabija, the wound on his brow'),
    dict(kind='touch', cue='मैंने अपना', marks=['none=कोई'], note='he touches his own brow: no wound'),
    dict(kind='blood', cue='वह घाव', marks=['body=शरीर@2', 'blood=ख़ून'], note='not his body: his blood'),
    dict(kind='drop', cue='उसकी यादें', marks=['notrb=नहीं', 'drop=बूँद', 'title=बूँद+e'], x=10, note='into a single drop; the title drops'),
    # ---------------------------------------------------------------- s4 बढ़ती सेना
    dict(kind='chakra', cue='फिर वैष्णवी', marks=['chakra=चक्र', 'many=हज़ारों'], x=12, note="Vaishnavi's chakra; thousands rise"),
    dict(kind='weapons', cue='ऐन्द्री की', marks=['a=ऐन्द्री', 'k=कौमारी', 'v=वाराही', 'm=माहेश्वरी'], note='four strikes, four more births each'),
    dict(kind='fill', cue='हर वार', marks=['world=संसार'], note='identical warriors to the horizon'),
    dict(kind='echo', cue='हर जन्म', marks=['name=नाम', 'less=कम'], note='every birth an echo in the veins'),
    dict(kind='faces', cue='हज़ार', marks=['who=कौन'], note='a thousand identical faces: who, then, am I?'),
    dict(kind='mark', cue='बस एक', marks=['mark=निशान', 'touch=छू'], note='the earth-mark on his chest'),
    dict(kind='gods', cue='ऊपर', marks=['fear=डर', 'won=जीत'], note="the gods' faces fall; the Asuras think they have won"),
    # ---------------------------------------------------------------- s5 गिरने के लिए जन्मा
    dict(kind='charge', cue='हम सब', marks=['first=पहला'], note='they run as one; beside him, the first one'),
    dict(kind='fall', cue='कौमारी की', marks=['flash=चमकी', 'fall=गिरा', 'hold=थामा'], note="Kaumari's spear flashes; the first one falls into gold dust in his arms"),
    dict(kind='words', cue='उसने कुछ', marks=['words=शब्द'], note='the unfinished sentence'),
    dict(kind='wall', cue='और तब मुझे', marks=['wall=दीवार', 'shield=ढाल', 'front=आगे'], note='a wall of drops before the one at the front'),
    dict(kind='born', cue='मैं इसलिए', marks=['rise=उठ'], note='born to fall, so another can rise'),
    dict(kind='ego', cue='और सबसे', marks=['mace=गदा', 'indra=इंद्र', 'new=नया'], note="the hand won't let go; the stolen heaven"),
    # ---------------------------------------------------------------- s6 आदेश
    dict(kind='slow', cue='फिर सब', marks=['chandika=चंडिका', 'blood=ख़ून'], x=14, note='everything slows; Chandika speaks to Kali'),
    dict(kind='command', cue='चामुंडे', marks=['mouth=मुख', 'swallow=निगल', 'none=जन्मेंगे'], note='the command, felt through the blood'),
    dict(kind='sentence', cue='नए नहीं@2', marks=['end=अंत'], note='one sentence, the end of thousands'),
    # ---------------------------------------------------------------- s7 काली का आगमन
    dict(kind='shadow', cue='वह आई', marks=['sun=सूरज', 'name=चामुंडा'], x=16, note='her shadow swallows the last ray; Chamunda'),
    dict(kind='strike', cue='देवी ने अपनी', marks=['blood=बहा', 'mouth=मुख'], note='the blood never reaches the ground'),
    dict(kind='still', cue='और मेरी', marks=['stop=थम', 'silent=चुप', 'none=नहीं'], note='the echo stops; the ground is silent'),
    dict(kind='roam', cue='जो उसके', marks=['roam=घूमने', 'vanish=समाते'], note='she moves among them; they vanish into the dark'),
    dict(kind='relief', cue='मुझे डर', marks=['relief=राहत'], note='fear, and beneath it, relief'),
    dict(kind='laststrike', cue='रक्तबीज ने', marks=['hit=वार', 'nopain=दर्द'], note='his last blow; she feels nothing'),
    # ---------------------------------------------------------------- s8 स्रोत का अंत
    dict(kind='rain', cue='शक्ति', marks=['drink=पीती', 'fall=गिर'], note='the weapons rain; bloodless, he falls'),
    dict(kind='fallen', cue='जिसकी', marks=['stand=खड़ा'], note='the source has fallen; he is still standing'),
    dict(kind='alone', cue='पहली बार मेरे', marks=['q=सवाल', 'what=क्या'], note='for the first time, a question of his own'),
    # ---------------------------------------------------------------- s9 अंतिम क्षण
    dict(kind='before', cue='वह मेरे', marks=['down=नीचे'], x=16, note='before her, he lays down the mace'),
    dict(kind='eyes', cue='मैंने ऊपर', marks=['fierce=भयंकरता', 'under=नीचे', 'karuna=करुणा'], note='ferocity in battle, compassion in the heart'),
    dict(kind='verse', cue='after:एक ही आँखों में', delay=0.6, x=14, note='Devi Mahatmya 4.22, held'),
    dict(kind='seen', cue='और उसने', marks=['me=मुझे@2'], x=14, note='among a thousand faces, she sees him'),
    dict(kind='recog', cue='जिसे कुछ', marks=['maa=माँ'], note='the mother recognised him'),
    dict(kind='lived', cue='मैं कुछ', marks=['war=युद्ध', 'drop=बूँद'], note='a few minutes: a war long, a drop long'),
    dict(kind='purify', cue='कहते हैं', marks=['purify=पवित्र', 'realms=लोकों'], note='purified by her weapons, even foes rise to higher worlds'),
    dict(kind='nofear', cue='मैं नहीं जानता', marks=['nofear=डर'], note='no fear of falling'),
    dict(kind='final', cue='मैं रक्तबीज नहीं था', marks=['drop=बूँद', 'maa=माँ', 'caught=थाम'], x=16, note='a drop falls and is caught before it touches the ground'),
    dict(kind='closing', cue='after:थाम लिया', delay=3.2, x=24, note='closing card with the logo'),
]
