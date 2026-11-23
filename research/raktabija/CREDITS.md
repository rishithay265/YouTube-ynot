# Credits and licences: मैं रक्तबीज नहीं था

Every sound, image and word in the film, with where it came from and on what terms.

## Narration
| What | Source | Terms |
|---|---|---|
| Hindi narration, 9 sections | ElevenLabs text-to-speech, model `eleven_v4`, voice **Mohit** (`XuoDMtv7nNW0kZq3o1W2`, ElevenLabs Voice Library), generated on the channel's ElevenLabs account | ElevenLabs paid plan: commercial use of generated audio permitted under the ElevenLabs Terms of Service. Check the Voice Library terms for Mohit before monetising. |
| Script | Our own Hindi script (`script.json`), rooted in the Devi Mahatmya | Ours |
| Word timings | ElevenLabs Scribe (`eleven_scribe_v1`) forced alignment; checked against Whisper large-v3 (MIT licence, run locally) | Tool output, no third-party content |

## Music
| What | Source | Terms |
|---|---|---|
| Tanpura-style drone bed (Sa-Pa strings tuned to D), low pad, high warm pad | Synthesised in code in `sound.py` (additive strings with a moving jivari band, sine pads) | Original, made for this film |

## Sound effects
| What | Source | Terms |
|---|---|---|
| Wind, earth rumble, thumps and footsteps, heartbeat, thunder (vajra), temple bells (ghanta and the Matrika chimes), bowstring, lion growl, gold-dust shimmer, drops, whooshes, suction, swells, ember crackle | Synthesised in code in `sound.py` | Original, made for this film |
| `drone_hit`, `title_boom`, `fall_whoosh` | The repository's own sound library (`library/sfx`), generated earlier for this channel from text prompts (see `src/episodes/rewind/episode.json`, `sound.clips`) | The channel's own generated clips |

No third-party music or sound effects are used.

## Picture
| What | Source | Terms |
|---|---|---|
| Every frame (figures, battlefield, cards, thumbnail) | Drawn in code (React/SVG, Remotion): `src/episodes/raktabija/{world,cast,scenes,castsheet,thumb}.tsx` | Original. No AI image or video generation. |
| TheGodmanFiles logo (trishul-eye) | Channel brand asset, used on the opening and closing cards and the thumbnail only | The channel's own |

## Fonts (Google Fonts, all SIL Open Font License 1.1)
- Tiro Devanagari Hindi and Tiro Devanagari Sanskrit (John Hudson and Fiona Ross, Tiro Typeworks).
- Cormorant Garamond (Christian Thalmann, Catharsis Fonts): the closest Google Font to the banner wordmark.
- Marcellus (Astigmatic): loaded as the second wordmark candidate.

## Text
- Devi Mahatmya (Markandeya Purana chs. 81–93), chapters 4, 7 and 8: public domain.
- Verse 4.22, quoted on screen in Sanskrit, IAST transliteration, and our own Hindi and English renderings.
- References consulted: Durga Saptashati (Gita Press, Gorakhpur); Swami Jagadiswarananda, *Devi-Mahatmyam* (Sri Ramakrishna Math); F. E. Pargiter, *The Markandeya Purana* (1904). We quote none of their translations.
