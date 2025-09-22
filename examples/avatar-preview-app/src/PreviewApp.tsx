/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import {
  AnimationData,
  AnimationType,
  AvatarCreatorApp,
  ImportBehaviorMode,
} from "@msquared/avatar-creator";

import clap from "./assets/anim/clap.glb";
import idle from "./assets/anim/idle.glb";
import pickMe from "./assets/anim/pick_me.glb";
import spawnAndWave from "./assets/anim/spawn_and_wave.glb";
import thumbsDown from "./assets/anim/thumbs_down.glb";
import thumbsUp from "./assets/anim/thumbs_up.glb";

const ANIMATIONS: AnimationData = [
  {
    name: "Idle",
    file: idle,
    type: AnimationType.Idle,
  },
  {
    name: "Appear",
    file: spawnAndWave,
    type: AnimationType.Appear,
    emote: "😎",
  },
  {
    name: "Clap",
    file: clap,
    type: AnimationType.Trigger,
    emote: "👏",
  },
  {
    name: "Wave",
    file: pickMe,
    type: AnimationType.Trigger,
    emote: "👋",
  },
  {
    name: "ThumbsDown",
    file: thumbsDown,
    type: AnimationType.Trigger,
    emote: "👎",
  },
  {
    name: "ThumbsUp",
    file: thumbsUp,
    type: AnimationType.Trigger,
    emote: "👍",
  },
];

export default function PreviewApp() {
  const dataUrl = process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json";
  return (
    <AvatarCreatorApp
      dataUrl={dataUrl}
      animations={ANIMATIONS}
      importBehavior={{ mode: ImportBehaviorMode.Copy }}
    />
  );
}
