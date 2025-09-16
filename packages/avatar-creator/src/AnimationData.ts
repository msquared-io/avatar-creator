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

/**
 * @typedef {Object} Animation
 * @property {string} name - The name of the animation
 * @property {string} file - The file of the animation
 * @property {AnimationType} type - The type of the animation: idle, appear, trigger. Idle is the default animation. Appear is the animation that is played when the avatar appears. Trigger is the animation that is played when the avatar is triggered.
 * @property {string} emote - The emote of the animation
 */
export type Animation = {
  name: string;
  file: string;
  type: AnimationType;
  emote?: string;
};

export type AnimationData = Animation[];
