/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useMemo } from "react";

import { CatalogPartKey } from "../types/Catalog";
import { IconBodyType } from "./icons/IconBodyType";
import { IconBottom } from "./icons/IconBottom";
import { IconHair } from "./icons/IconHair";
import { IconHead } from "./icons/IconHead";
import { IconOutfit } from "./icons/IconOutfit";
import { IconShoes } from "./icons/IconShoes";
import { IconTop } from "./icons/IconTop";
import styles from "./SectionButton.module.css";

const ICONS: Record<
  CatalogPartKey | "bodyType",
  React.FC<{ containerWidth: number; containerHeight: number }>
> = {
  bodyType: IconBodyType,
  head: IconHead,
  hair: IconHair,
  top: IconTop,
  bottom: IconBottom,
  shoes: IconShoes,
  outfit: IconOutfit,
};

export default function SectionButton({
  slot,
  setSection,
  active,
  droppable,
  dropOver,
}: {
  slot: CatalogPartKey | "bodyType";
  setSection: (section: CatalogPartKey | "bodyType") => void;
  active: boolean;
  droppable: boolean;
  dropOver: CatalogPartKey | "window" | null;
}) {
  const IconComponent = useMemo(() => {
    return ICONS[slot];
  }, [slot]);

  return (
    <svg
      className={`${styles.sectionButton} ${active && dropOver === null ? styles.active : ""} ${dropOver === slot ? styles.dropOver : ""} ${droppable && dropOver === "window" ? styles.dropTarget : ""} ${!droppable && dropOver !== null ? styles.dropInvalid : ""}`}
      width="98"
      height="98"
      viewBox="0 0 98 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => setSection(slot)}
      data-drop={droppable ? slot : undefined}
      data-slot={slot}
    >
      <path
        d="M5.44056 97.5C2.70694 97.5 0.5 95.2844 0.5 92.56V19.94C0.5 17.7625 1.36746 15.6697 2.9038 14.1336L14.1349 2.90357C15.6713 1.36739 17.7643 0.5 19.942 0.5H92.5594C95.2931 0.5 97.5 2.71559 97.5 5.44V78.05C97.5 80.2275 96.6325 82.3203 95.0962 83.8564L83.8651 95.0864C82.3287 96.6226 80.2357 97.49 78.058 97.49L5.44056 97.5Z"
        strokeWidth="inherit"
        stroke="inherit"
        fill="inherit"
      />
      <IconComponent containerWidth={98} containerHeight={98} />
    </svg>
  );
}
