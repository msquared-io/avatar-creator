/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useEffect, useState } from "react";

import { CatalogueBodyType } from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./SlotItem.module.css";

// Extend Window interface to include avatarLoader
declare global {
  interface Window {
    avatarLoader: any;
  }
}

export default function SlotItem({
  image,
  bodyType,
  skin,
  slot,
  url,
  active,
  avatarLoader,
  onClick,
}: {
  image: string;
  bodyType?: CatalogueBodyType;
  skin?: number;
  slot?: string;
  url?: string;
  active: boolean;
  avatarLoader: AvatarLoader;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!avatarLoader) return;

    const evtLoading = avatarLoader.on(`loading:${slot}:${url}.glb`, () => {
      setLoading(true);
    });

    const evtLoaded = avatarLoader.on(`loaded:${slot}:${url}.glb`, () => {
      setLoading(false);
    });

    // Check if already loading
    if (slot !== undefined && avatarLoader.loading.has(slot)) {
      const loadingItems = avatarLoader.loading.get(slot);
      if (loadingItems && loadingItems.indexOf(url + ".glb") !== -1) {
        setLoading(true);
      }
    }

    return () => {
      if (evtLoading && evtLoading.off) evtLoading.off();
      if (evtLoaded && evtLoaded.off) evtLoaded.off();
    };
  }, [slot, url]);

  return (
    <li
      className={`${styles.slotItem} ${active ? styles.active : ""} ${loading ? styles.loading : ""}`}
      data-bodytype={bodyType ?? null}
      data-skin={skin ?? null}
      onClick={onClick}
    >
      <img src={image} draggable="false" />
    </li>
  );
}
