/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import skin_1Url from "../assets/img/thumbnails/skin_1.webp";
import skin_2Url from "../assets/img/thumbnails/skin_2.webp";
import skin_3Url from "../assets/img/thumbnails/skin_3.webp";
import skin_4Url from "../assets/img/thumbnails/skin_4.webp";
import skin_5Url from "../assets/img/thumbnails/skin_5.webp";
import skin_6Url from "../assets/img/thumbnails/skin_6.webp";
import skin_7Url from "../assets/img/thumbnails/skin_7.webp";
import { AvatarLoader } from "../scripts/avatar-loader";
import { CatalogSkin } from "../types/Catalog";
import styles from "./SectionSkin.module.css";
import SlotItem from "./SlotItem";

const skinImages: Record<string, string> = {
  "01": skin_1Url,
  "02": skin_2Url,
  "03": skin_3Url,
  "04": skin_4Url,
  "05": skin_5Url,
  "06": skin_6Url,
  "07": skin_7Url,
};

export default function SectionSkin({
  skins,
  skin,
  setSkin,
  avatarLoader,
}: {
  skins: ReadonlyArray<CatalogSkin>;
  skin: CatalogSkin;
  setSkin: (value: CatalogSkin) => void;
  avatarLoader: AvatarLoader;
}) {
  return (
    <div className={styles.skin}>
      <h2>Skin</h2>
      <ul>
        {skins.map((item) => {
          return (
            <SlotItem
              key={item.name}
              skin={item.name}
              avatarLoader={avatarLoader}
              active={skin.name === item.name}
              onClick={() => {
                setSkin(item);
              }}
              thumbnailUrl={skinImages[item.name]}
            />
          );
        })}
      </ul>
    </div>
  );
}
