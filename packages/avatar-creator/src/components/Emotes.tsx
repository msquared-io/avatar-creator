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

import { CatalogueData } from "../CatalogueData";
import styles from "./Emotes.module.css";

export function Emotes({
  data,
  appState,
  app,
}: {
  data: CatalogueData;
  app: AppBase;
  appState: "home" | "configurator";
}) {
  const [active, setActive] = useState(false);

  const onClick = (emote: string) => {
    if (active) {
      app.fire("anim", emote);
    }
    setActive(!active);
  };

  // count how many emote animations are available
  const emotesCount = data.animations?.filter((item) => {
    return !!item.emote;
  })?.length;

  // there might be no animations
  if (!emotesCount) {
    return <></>;
  }

  return (
    <div
      className={`${styles.emotes} ${active || emotesCount === 1 ? styles.active : ""} ${appState === "home" ? "" : styles.hidden}`}
    >
      {data.animations.map((item) => {
        if (item.idle) {
          return null;
        }

        return (
          <span
            key={item.name}
            className={styles.icon}
            onClick={() => {
              onClick(item.name);
            }}
          >
            {item.emote}
          </span>
        );
      })}
    </div>
  );
}
