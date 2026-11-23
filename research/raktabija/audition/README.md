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
