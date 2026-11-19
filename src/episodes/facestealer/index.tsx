import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import defs from './defs.json';
import { buildShots, Def } from './scenes';

// "The Fake Video Call That Stole $400 Million" (FaceStealer). A landscape (1920 x 1080) long-form explainer built from the
// FBI FLASH AC-111226-MS and DOJ press release 26-1356 (both 12 Nov 2026). Screenshots of those pages are shown with highlights.
// All people shown are original stick-figure avatars; no real person or brand UI is imitated.

type W = { w: string; s: number; e: number; p?: string };

/** Captions read better when spelled-out letters are joined: "A I" -> "AI", "A P T thirty eight" -> "APT 38", "I C three dot gov" -> "IC3.gov". */
const capWords = (ws: W[]): W[] => {
  const out: W[] = [];
  for (let i = 0; i < ws.length; i++) {
    const a = ws[i], b = ws[i + 1], c = ws[i + 2], d = ws[i + 3], e = ws[i + 4];
    if (a.w === 'A' && b?.w === 'I') { out.push({ w: 'AI', s: a.s, e: b.e, p: b.p }); i += 1; continue; }
    if (a.w === 'A' && b?.w === 'P' && c?.w === 'T') {
      if (d?.w === 'thirty' && e?.w === 'eight') { out.push({ w: 'APT 38', s: a.s, e: e.e, p: e.p }); i += 4; } else { out.push({ w: 'APT', s: a.s, e: c.e, p: c.p }); i += 2; }
      continue;
    }
    if (a.w === 'I' && b?.w === 'C' && c?.w === 'three' && d?.w === 'dot' && e?.w === 'gov') { out.push({ w: 'IC3.gov', s: a.s, e: e.e, p: e.p }); i += 4; continue; }
    out.push(a);
  }
  return out;
};

export const facestealer = defineEpisode('FaceStealer', {
  timeline: timeline as Timeline,
  bg: '#060912',
  captions: capWords(words as W[]),
  capY: 0.9,
  shots: buildShots(defs as Def[]),
});
