/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { CatalogueBodyType } from "../CatalogueData";
import { AvatarLoader } from "./avatar-loader";

const keyReplace = {
  "top:secondary": "topSecondary",
  "bottom:secondary": "bottomSecondary",
};

export const mmlExport = function (avatarLoader: AvatarLoader): string {
  let code = "";

  const className = [avatarLoader.getBodyType(), `skin${avatarLoader.getSkin()?.name ?? ""}`].join(
    " ",
  );

  code += `<m-character class="${className}" src="${encodeURI(avatarLoader.urls.torso ?? "")}">\n`;

  for (const key in avatarLoader.urls) {
    if (key === "torso") continue;
    const url = avatarLoader.urls[key];
    if (!url) continue;
    const className = key in keyReplace ? keyReplace[key as keyof typeof keyReplace] : key;
    code += `    <m-model class="${className}" src="${encodeURI(url)}"></m-model>\n`;
  }

  code += `</m-character>`;

  return code;
};

export const mmlImport = function (code: string, avatarLoader: AvatarLoader) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, "text/html");
  const rootNode = doc.body;

  const character = rootNode.querySelector("m-character");
  if (!character) {
    console.log("character not found");
    return;
  }

  // body type
  const bodyTypes = new Set(["bodyA", "bodyB"]);
  const classItems = Array.from(character.classList);
  const bodyType =
    classItems.filter((item) => {
      return bodyTypes.has(item);
    })?.[0] ?? "BodyA";
  avatarLoader.setBodyType(bodyType as CatalogueBodyType, true);

  // skin
  classItems.forEach((item) => {
    if (!item.startsWith("skin")) return;

    const skinIndex = parseInt(item.slice(4), 10);
    if (isNaN(skinIndex)) return;

    const skinName = (skinIndex + "").padStart(2, "0");

    avatarLoader.setSkin({ name: skinName, index: skinIndex }, true);
  });

  avatarLoader.load("torso", character.getAttribute("src"), true);

  const slots = [
    "legs",
    "head",
    "hair",
    "top",
    "topSecondary",
    "bottom",
    "bottomSecondary",
    "shoes",
  ];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotName = slot in keyReplace ? keyReplace[slot as keyof typeof keyReplace] : slot;
    const node = character.querySelector(`m-model.${slot}`);
    const src = node?.getAttribute("src");

    if (!node || !src) {
      avatarLoader.unload(slotName);
      continue;
    }

    if (slot === "legs") {
      avatarLoader.legs = true;
    }

    avatarLoader.load(slotName, src, true);
  }
};
