/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import { CataloguePartsKeys } from "../CatalogueData";
import styles from "./SectionButton.module.css";

export default function SectionButton({
  slot,
  setSection,
  active,
  droppable,
  dropOver,
}: {
  slot: CataloguePartsKeys | "bodyType";
  setSection: (section: CataloguePartsKeys | "bodyType") => void;
  active: boolean;
  droppable: boolean;
  dropOver: CataloguePartsKeys | "window" | null;
}) {
  return (
    <li
      className={`${styles.sectionButton} ${active && dropOver === null ? styles.active : ""} ${dropOver === slot ? styles.dropOver : ""} ${droppable && dropOver === "window" ? styles.dropTarget : ""} ${!droppable && dropOver !== null ? styles.dropInvalid : ""}`}
      data-slot={slot}
      data-drop={droppable ? slot : undefined}
      onClick={() => setSection(slot)}
    >
      <div className={styles.icon} />
    </li>
  );
}
