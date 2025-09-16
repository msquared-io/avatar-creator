/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

export enum AnimationType {
  Idle = "idle",
  Appear = "appear",
  Trigger = "trigger",
}

export type Animation = {
  name: string;
  file: string;
  type: AnimationType;
  emote?: string;
};

export type AnimationData = Animation[];
