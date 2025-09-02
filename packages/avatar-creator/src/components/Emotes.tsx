/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AppBase } from "playcanvas";
import * as React from "react";
import { useState } from "react";

import { EmoteTypes } from "../scripts/avatar-loader";
import styles from "./Emotes.module.css";

export function Emotes({ appState, app }: { app: AppBase; appState: "home" | "configurator" }) {
  const [active, setActive] = useState(false);

  const onClick = (emote: EmoteTypes) => {
    if (active) {
      app.fire("anim", emote);
    }
    setActive(!active);
  };

  return (
    <div
      className={`${styles.emotes} ${active ? styles.active : ""} ${appState === "home" ? "" : styles.hidden}`}
    >
      <span
        className={styles.icon}
        onClick={() => {
          onClick(EmoteTypes.Appear);
        }}
      >
        😎
      </span>
      <span
        className={styles.icon}
        onClick={() => {
          onClick(EmoteTypes.Clap);
        }}
      >
        👏
      </span>
      <span
        className={styles.icon}
        onClick={() => {
          onClick(EmoteTypes.Wave);
        }}
      >
        👋
      </span>
      <span
        className={styles.icon}
        onClick={() => {
          onClick(EmoteTypes.ThumbsDown);
        }}
      >
        👎
      </span>
      <span
        className={styles.icon}
        onClick={() => {
          onClick(EmoteTypes.ThumbsUp);
        }}
      >
        👍
      </span>
    </div>
  );
}
