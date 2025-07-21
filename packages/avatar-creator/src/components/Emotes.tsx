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

import styles from "./Emotes.module.css";

export default function Mml({
  appState,
  app,
}: {
  app: AppBase;
  appState: "home" | "configurator";
}) {
  const [active, setActive] = useState(false);

  const onClick = (evt: React.MouseEvent<HTMLSpanElement>) => {
    if (active) {
      const emote = (evt.target as HTMLElement).getAttribute("data-emote");
      app.fire("anim", emote);
    }
    setActive(!active);
  };

  return (
    <div
      className={`${styles.emotes} ${active ? styles.active : ""} ${appState === "home" ? "" : styles.hidden}`}
    >
      <span className={styles.icon} onClick={onClick} data-emote="appear">
        😎
      </span>
      <span className={styles.icon} onClick={onClick} data-emote="clap">
        👏
      </span>
      <span className={styles.icon} onClick={onClick} data-emote="wave">
        👋
      </span>
      <span className={styles.icon} onClick={onClick} data-emote="thumbsDown">
        👎
      </span>
      <span className={styles.icon} onClick={onClick} data-emote="thumbsUp">
        👍
      </span>
    </div>
  );
}
