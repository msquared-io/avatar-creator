/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AvatarCreatorApp, CatalogueAnimation, ImportBehaviorMode } from "@msquared/avatar-creator";

// We import .glb files as URLs via esbuild file loader.
import clap from "./assets/anim/clap.glb";
import idle from "./assets/anim/idle.glb";
import pickMe from "./assets/anim/pick_me.glb";
import spawnAndWave from "./assets/anim/spawn_and_wave.glb";
import thumbsDown from "./assets/anim/thumbs_down.glb";
import thumbsUp from "./assets/anim/thumbs_up.glb";

const ANIMATIONS: CatalogueAnimation[] = [
  {
    name: "Idle",
    file: idle,
    idle: true,
    emote: "👋",
  },
  {
    name: "Appear",
    file: spawnAndWave,
    emote: "😎",
    appear: true,
  },
  {
    name: "Clap",
    file: clap,
    emote: "👏",
  },
  {
    name: "Wave",
    file: pickMe,
    emote: "👋",
  },
  {
    name: "ThumbsDown",
    file: thumbsDown,
    emote: "👎",
  },
  {
    name: "ThumbsUp",
    file: thumbsUp,
    emote: "👍",
  },
];

export default function PreviewApp() {
  const dataUrl = process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json";
  return (
    <AvatarCreatorApp
      dataUrl={dataUrl}
      animations={ANIMATIONS}
      importBehavior={{ mode: ImportBehaviorMode.None }}
    />
  );
}
