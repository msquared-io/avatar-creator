/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import iconBodyTypeASVG from "../assets/img/icon-bodytype-a.svg";
import iconBodyTypeBSVG from "../assets/img/icon-bodytype-b.svg";
import { CatalogBodyTypeKey } from "../types/Catalog";
import styles from "./SectionBodyType.module.css";
import SlotItem from "./SlotItem";

export default function SectionBodyType({
  bodyType,
  setBodyType,
}: {
  bodyType: CatalogBodyTypeKey;
  setBodyType: (value: CatalogBodyTypeKey) => void;
}) {
  return (
    <div className={styles.section}>
      <h2>Body</h2>
      <ul>
        <SlotItem
          active={bodyType === "bodyB"}
          onClick={() => {
            setBodyType("bodyB");
          }}
          thumbnailUrl={iconBodyTypeBSVG}
        />
        <SlotItem
          active={bodyType === "bodyA"}
          onClick={() => {
            setBodyType("bodyA");
          }}
          thumbnailUrl={iconBodyTypeASVG}
        />
      </ul>
    </div>
  );
}
