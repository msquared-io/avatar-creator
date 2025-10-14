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
import { CatalogPartKey } from "../types/Catalog";
import styles from "./SlotItem.module.css";

// Extend Window interface to include avatarLoader
declare global {
  interface Window {
    avatarLoader: any;
  }
}

export default function SlotItem({
  skin,
  slot,
  modelUrl,
  thumbnailUrl,
  active,
  avatarLoader,
  onClick,
}: {
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
    <svg
      className={`${styles.slotItem} ${active ? styles.active : ""} ${loading ? styles.loading : ""}`}
      onClick={onClick}
      width="98"
      height="98"
      viewBox="-2 -2 102 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="slot-clip">
          <path d="M5.44056 97.5C2.70694 97.5 0.5 95.2844 0.5 92.56V19.94C0.5 17.7625 1.36746 15.6697 2.9038 14.1336L14.1349 2.90357C15.6713 1.36739 17.7643 0.5 19.942 0.5H92.5594C95.2931 0.5 97.5 2.71559 97.5 5.44V78.05C97.5 80.2275 96.6325 82.3203 95.0962 83.8564L83.8651 95.0864C82.3287 96.6226 80.2357 97.49 78.058 97.49L5.44056 97.5Z" />
        </clipPath>
      </defs>

      <path
        d="M5.44056 97.5C2.70694 97.5 0.5 95.2844 0.5 92.56V19.94C0.5 17.7625 1.36746 15.6697 2.9038 14.1336L14.1349 2.90357C15.6713 1.36739 17.7643 0.5 19.942 0.5H92.5594C95.2931 0.5 97.5 2.71559 97.5 5.44V78.05C97.5 80.2275 96.6325 82.3203 95.0962 83.8564L83.8651 95.0864C82.3287 96.6226 80.2357 97.49 78.058 97.49L5.44056 97.5Z"
        strokeWidth="4"
        stroke="inherit"
        fill="inherit"
      />

      <image
        href={thumbnailUrl}
        x="6"
        y="6"
        width="86"
        height="86"
        clipPath="url(#slot-clip)"
        className={`${styles.slotItemImage} ${skin ? styles.slotSkinMask : ""}`}
      />
    </svg>
  );
}
