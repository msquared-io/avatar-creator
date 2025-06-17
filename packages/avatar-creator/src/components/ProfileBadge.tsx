/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import avatarIconPng from "../assets/img/temp/avatar-icon.png";
import styles from "./ProfileBadge.module.css";

export default function ProfileBadge({ portrait }: { portrait: string | null }) {
  return (
    <div className={styles.button}>
      <img src={portrait || avatarIconPng} draggable="false" />
      <svg
        width="62"
        height="62"
        viewBox="0 0 62 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.3174 0.5H57.001C59.4842 0.500093 61.5 2.51612 61.5 5V43.6904C61.4999 45.5542 60.808 47.352 59.5635 48.7275L59.3066 48.9961L48.998 59.3066C47.5927 60.7121 45.6809 61.4999 43.6934 61.5H4.99902C2.51576 61.4999 0.5 59.4839 0.5 57V18.3096C0.500106 16.4458 1.19199 14.648 2.43652 13.2725L2.69336 13.0039L13.0117 2.69336C14.3293 1.37563 16.0923 0.600486 17.9453 0.508789L18.3174 0.5Z"
          stroke="rgba(203,166,255,0.25)"
          fill="rgba(0, 0, 0, 0.25)"
        />
      </svg>
    </div>
  );
}
