import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { FaceStealerThumb, FaceStealerThumbUserFixed } from './episodes/facestealer/thumb';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => {
  const common = { fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} width={e.width} height={e.height} {...common} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} width={e.width} height={e.height} {...common} />
        </React.Fragment>
      ))}
      <Composition id="FaceStealerThumb" component={FaceStealerThumb} durationInFrames={1} width={1920} height={1080} {...common} />
      <Composition id="FaceStealerThumbUserFixed" component={FaceStealerThumbUserFixed} durationInFrames={1} width={1672} height={941} {...common} />
      <Composition id="Cast" component={CastSheet} durationInFrames={1} width={STUDIO.width} height={STUDIO.height} {...common} />
    </>
  );
};
