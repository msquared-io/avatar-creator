/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useEffect, useState } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import { CatalogBodyTypeKey, CatalogPartKey } from "../types/Catalog";
import styles from "./SlotItem.module.css";

// Extend Window interface to include avatarLoader
declare global {
  interface Window {
    avatarLoader: any;
  }
}

export default function SlotItem({
  bodyType,
  skin,
  slot,
  modelUrl,
  thumbnailUrl,
  active,
  avatarLoader,
  onClick,
}: {
  bodyType?: CatalogBodyTypeKey;
  skin?: string;
  slot?: CatalogPartKey;
  // No secondary needed here as loading events entirely predicated on the primary model.
  modelUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  avatarLoader: AvatarLoader;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  // Manages the loading state of the Slot Item.
  // Does not manage any of the actual loading of the avatar itself.
  useEffect(() => {
    if (!avatarLoader || !slot) {
      // If there is no avatar loader return, and do not enter the loading state, as the loading would never actually complete.
      return;
    }

    const evtLoading = avatarLoader.on(`loading:${slot}:${modelUrl}`, () => {
      setLoading(true);
    });

    const evtLoaded = avatarLoader.on(`loaded:${slot}:${modelUrl}`, () => {
      setLoading(false);
    });

    // Check if already loading, if not then enter the loading state
    const loadingItems = avatarLoader.loading.get(slot);
    if (modelUrl && loadingItems && loadingItems.indexOf(modelUrl) !== -1) {
      setLoading(true);
    }

    return () => {
      if (evtLoading && evtLoading.off) evtLoading.off();
      if (evtLoaded && evtLoaded.off) evtLoaded.off();
    };
  }, [slot, modelUrl]);

  return (
    <li
      className={`${styles.slotItem} ${active ? styles.active : ""} ${loading ? styles.loading : ""}`}
      data-bodytype={bodyType ?? null}
      data-skin={skin ?? null}
      onClick={onClick}
    >
      <img src={thumbnailUrl} draggable="false" />
    </li>
  );
}
