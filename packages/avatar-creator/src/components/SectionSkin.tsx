import * as React from "react";

import skin_1Url from "../assets/img/thumbnails/skin_1.webp";
import skin_2Url from "../assets/img/thumbnails/skin_2.webp";
import skin_3Url from "../assets/img/thumbnails/skin_3.webp";
import skin_4Url from "../assets/img/thumbnails/skin_4.webp";
import skin_5Url from "../assets/img/thumbnails/skin_5.webp";
import skin_6Url from "../assets/img/thumbnails/skin_6.webp";
import skin_7Url from "../assets/img/thumbnails/skin_7.webp";
import { CatalogueSkin } from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./SectionSkin.module.css";
import SlotItem from "./SlotItem";

const skinImages: Record<number, string> = {
  1: skin_1Url,
  2: skin_2Url,
  3: skin_3Url,
  4: skin_4Url,
  5: skin_5Url,
  6: skin_6Url,
  7: skin_7Url,
};

export default function SectionSkin({
  skins,
  skin,
  setSkin,
  avatarLoader,
}: {
  skins: ReadonlyArray<CatalogueSkin>;
  skin: CatalogueSkin;
  setSkin: (value: CatalogueSkin) => void;
  avatarLoader: AvatarLoader;
}) {
  return (
    <div className={styles.skin}>
      <h2>Skin</h2>
      <ul>
        {skins.map((item) => {
          return (
            <SlotItem
              key={item.index}
              skin={item.index}
              avatarLoader={avatarLoader}
              active={skin.index === item.index}
              onClick={() => {
                setSkin(item);
              }}
              image={skinImages[item.index]}
            />
          );
        })}
      </ul>
    </div>
  );
}
