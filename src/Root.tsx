import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';
import { FaceStealerThumb, FaceStealerThumbUserFixed } from './episodes/facestealer/thumb';
import { RaktabijaCast } from './episodes/raktabija/castsheet';
import { RaktabijaThumb, RaktabijaThumbEclipse } from './episodes/raktabija/thumb';
import { TripuraCast } from './episodes/tripura/castsheet';
import { TripuraThumb } from './episodes/tripura/thumb';
import { TripuraShort, ShortDef } from './episodes/tripura/short';
import tripuraShorts from './episodes/tripura/shorts.json';
import { GitaShort, GitaDef } from './episodes/gita/short';
import gitaShorts from './episodes/gita/shorts.json';
import { KuberaFilm, KUBERA_LEN } from './episodes/kubera/film';

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
      <Composition id="RaktabijaThumb" component={RaktabijaThumb} durationInFrames={1} width={1920} height={1080} {...common} />
      <Composition id="RaktabijaThumbEclipse" component={RaktabijaThumbEclipse} durationInFrames={1} width={1920} height={1080} {...common} />
      <Composition id="RaktabijaCast" component={RaktabijaCast} durationInFrames={4} width={1920} height={1080} {...common} />
      {(tripuraShorts as ShortDef[]).map((d) => (
        <Composition key={d.id} id={d.id} component={TripuraShort} defaultProps={{ d }} durationInFrames={d.len} width={1080} height={1920} {...common} />
      ))}
      {(gitaShorts as GitaDef[]).map((d) => (
        <Composition key={d.id} id={d.id} component={GitaShort} defaultProps={{ d }} durationInFrames={d.len} width={1080} height={1920} {...common} />
      ))}
      <Composition id="KuberaFilm" component={KuberaFilm} durationInFrames={KUBERA_LEN} width={1920} height={1080} {...common} />
      <Composition id="TripuraThumb" component={TripuraThumb} durationInFrames={1} width={1920} height={1080} {...common} />
      <Composition id="TripuraCast" component={TripuraCast} durationInFrames={4} width={1920} height={1080} {...common} />
      <Composition id="Cast" component={CastSheet} durationInFrames={1} width={STUDIO.width} height={STUDIO.height} {...common} />
    </>
  );
};
