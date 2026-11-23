# Checkpoint A: narrator auditions

Same excerpt for every voice (`excerpt.txt`, ~37 s): the Matrika names, Shivaduti, the recognition line, Chandika's
command to Chamunda, the 4.22 echo, and the last line. Voice brief: an echo of Raktabija, but younger and more fragile.

| File | Provider / voice | Character error (Whisper large-v3, independent) | Heard differently |
| --- | --- | --- | --- |
| listen_A1_mohit_take1.mp3 | ElevenLabs eleven_v4, "Mohit" (XuoDMtv7nNW0kZq3o1W2) | 4.8% | ऐन्द्री → "एंद्री" |
| listen_A2_manish_take1.mp3 | ElevenLabs eleven_v4, "manish documentary voice +" (42U38l5tV4aoBj6ThBcu) | 16.7% (partly Whisper inventing a tail in silence) | ब्रह्माणी → "भ्यम्माणी", ऐन्द्री → "एंद्री", हृदय → "हिरदे" |
| (pending) | Gemini gemini-3.8-flash-tts, Hindi voice from its Voice Library | — | needs GEMINI_API_KEY |

`listen_*` files are loudness-matched to -16 LUFS so the voices compare fairly; the raw takes sit beside them, and
`asr_report.json` holds every transcript. CER ignores nukta and chandrabindu spelling variants.

## ऐन्द्री / ऐरावत check (Mohit)

`listen_P_mohit_aindri_t1.mp3` ("ऐन्द्री। ऐन्द्री का वज्र।") and `listen_P_mohit_airavat_t1.mp3` ("ऐरावत। ऐरावत पर सवार।").
Whisper hears both with ए ("एंद्री", "एरावत"): the voice uses the modern Hindi vowel /ɛː/, not the Sanskrit
diphthong /ai/. If the diphthong is wanted, the fix is an IPA substitution in the TTS text (eleven_v4 reads /…/ as IPA),
for example ऐन्द्री → /ˈaɪn̪d̪riː/ and ऐरावत → /aɪˈraːʋət̪/.
