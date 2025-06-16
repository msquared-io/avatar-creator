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
  gender,
  selected,
  setSlot,
  setSecondary,
  data,
  avatarLoader,
}: {
  slot: CataloguePartsKeys;
  title: string;
  skin?: CatalogueSkin;
  gender: CatalogueBodyType;
  selected: string | null;
  setSlot: (value: string) => void;
  setSecondary?: (value: string | null) => void;
  data: CatalogueData;
  avatarLoader: AvatarLoader;
}) {
  const [items, setItems] = useState<Array<CataloguePart>>([]);

  useEffect(() => {
    if (!data.genders) {
      return;
    }

    const items = [];

    const item = data.genders[gender][slot];
    for (let i = 0; i < item.list.length; i++) {
      items.push(item.list[i]);
    }

    setItems(items);
  }, [data, gender]);

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
              gender={gender}
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

