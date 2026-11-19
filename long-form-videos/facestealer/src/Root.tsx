import React from 'react';
import {Composition} from 'remotion';
import {FaceStealerFilm, FaceStealerStill, TOTAL_FRAMES} from './FaceStealer';
import './fonts';

export const Root: React.FC = () => (
  <>
    <Composition id="FaceStealer" component={FaceStealerFilm} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FaceStealerStill" component={FaceStealerStill} durationInFrames={1} fps={30} width={1920} height={1080} />
  </>
);

