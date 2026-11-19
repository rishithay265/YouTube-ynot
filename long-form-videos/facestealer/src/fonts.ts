import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

loadFont({family: 'Evidence Sans', url: staticFile('fonts/Arial.ttf'), weight: '400'});
loadFont({family: 'Evidence Sans', url: staticFile('fonts/Arial-Bold.ttf'), weight: '700'});
loadFont({family: 'Evidence Display', url: staticFile('fonts/Arial-Black.ttf'), weight: '900'});

export const fonts = {
  body: 'Evidence Sans, Arial, sans-serif',
  display: 'Evidence Display, Arial Black, sans-serif',
};

