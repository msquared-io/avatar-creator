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
import {
  Catalog,
  CatalogBasicPart,
  CatalogBodyTypeKey,
  CatalogPartKey,
  CatalogSkin,
} from "../types/Catalog";
import { DeepReadonly } from "../types/DeepReadonly";
import styles from "./SectionBasic.module.css";
import SlotItem from "./SlotItem";

export default function SectionBasic({
  slot,
  title,
  skin,
  bodyType,
  selected,
  setSlot,
  setSecondary,
  data,
  avatarLoader,
}: {
  slot: CatalogPartKey;
  title: string;
  skin?: CatalogSkin;
  bodyType: CatalogBodyTypeKey;
  selected: string | null;
  setSlot: (value: string) => void;
  setSecondary?: (value: string | null) => void;
  data: Catalog;
  avatarLoader: AvatarLoader;
}) {
  const [parts, setParts] = useState<DeepReadonly<Array<CatalogBasicPart>>>([]);

  useEffect(() => {
    if (!data.bodyTypes) {
      return;
    }

    const bodyTypeData = data.bodyTypes.find(({ name }) => name === bodyType);
    const slotSection = bodyTypeData?.parts[slot];
    if (!slotSection) {
      setParts([]);
      return;
    }

    if (slotSection.skin) {
      if (!skin?.name) {
        setParts([]);
        return;
      }
      setParts(slotSection.parts.map((skinnedPart) => skinnedPart[skin?.name]));
    } else {
      setParts(slotSection.parts);
    }
  }, [data, skin, bodyType]);

  return (
    <div className={styles.section}>
      <h2>{title}</h2>
      <ul>
        {parts.map((part) => {
          return (
            <SlotItem
              active={selected === part.model}
              key={part.model}
              bodyType={bodyType}
              avatarLoader={avatarLoader}
              slot={slot}
              onClick={() => {
                setSlot(part.model);
                if (setSecondary) setSecondary(part.secondaryModel ?? null);
              }}
              modelUrl={part.model}
              thumbnailUrl={part.thumbnail}
            />
          );
        })}
      </ul>
    </div>
  );
}
