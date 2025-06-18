/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useEffect, useState } from "react";

import {
  CatalogueBodyType,
  CatalogueData,
  CataloguePart,
  CataloguePartsKeys,
  CatalogueSkin,
} from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
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
  slot: CataloguePartsKeys;
  title: string;
  skin?: CatalogueSkin;
  bodyType: CatalogueBodyType;
  selected: string | null;
  setSlot: (value: string) => void;
  setSecondary?: (value: string | null) => void;
  data: CatalogueData;
  avatarLoader: AvatarLoader;
}) {
  const [items, setItems] = useState<Array<CataloguePart>>([]);

  useEffect(() => {
    if (!data.bodyTypes) {
      return;
    }

    const items = [];

    const item = data.bodyTypes[bodyType][slot];
    for (let i = 0; i < item.list.length; i++) {
      items.push(item.list[i]);
    }

    setItems(items);
  }, [data, bodyType]);

  return (
    <div className={styles.section}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => {
          let url = item.file;
          if (skin !== undefined) url = avatarLoader.getSkinBasedUrl(url, skin);

          const thumbnail = url + ".webp";

          return (
            <SlotItem
              active={selected === url}
              key={item.file}
              bodyType={bodyType}
              avatarLoader={avatarLoader}
              slot={slot}
              url={url}
              onClick={() => {
                setSlot(url);
                if (setSecondary) setSecondary(item.secondary ?? null);
              }}
              image={thumbnail}
            />
          );
        })}
      </ul>
    </div>
  );
}
