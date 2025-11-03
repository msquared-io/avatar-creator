/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { Catalog, CatalogBodyTypeKey } from "../types/Catalog";
import { AvatarState, AvatarStateManager } from "./avatar-state-manager";

/**
 * Generates MML code from the current avatar state
 * @param stateManager The avatar state manager
 * @param formatted Whether to format the MML code with indentation
 * @returns MML string representing the avatar
 */
export function getAvatarMml(stateManager: AvatarStateManager, formatted: boolean = false): string {
  const state = stateManager.getState();
  if (!state) return "";

  const urls = stateManager.getCurrentUrls();
  let code = "";

  const isOutfit = !!state.outfit;
  const className = isOutfit ? "outfit" : [state.bodyType, `skin${state.skin.name}`].join(" ");

  // Get the torso/outfit URL for the src attribute
  const srcUrl = urls.get("outfit") || urls.get("torso") || "";
  code += `<m-character class="${className}" src="${encodeURI(srcUrl)}">${formatted ? "\n" : ""}`;

  // Add all other parts as m-model elements
  for (const [key, url] of urls.entries()) {
    if (key === "torso" || key === "outfit" || key === "legs") continue;

    code += `${formatted ? "\t" : ""}<m-model class="${key}" src="${encodeURI(url)}"></m-model>${formatted ? "\n" : ""}`;
  }

  code += `</m-character>`;

  return code;
}

/**
 * Parses MML code and returns the avatar state
 * @param code The MML code to parse
 * @param catalog The catalog for looking up parts
 * @returns Parsed avatar state or null if invalid
 */
export function parseMmlToState(code: string, catalog: Catalog): Partial<AvatarState> | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, "text/html");
  const rootNode = doc.body;

  const character = rootNode.querySelector("m-character");
  if (!character) {
    console.log("character not found");
    return null;
  }

  const classItems = Array.from(character.classList);
  const isOutfit = classItems.includes("outfit");

  if (isOutfit) {
    const src = character.getAttribute("src");
    if (src) {
      return {
        outfit: src,
        head: null,
        hair: null,
        top: null,
        topSecondary: null,
        bottom: null,
        bottomSecondary: null,
        shoes: null,
      };
    }
    return null;
  } else {
    // Parse body type
    const bodyTypes = new Set<CatalogBodyTypeKey>(["bodyA", "bodyB"]);
    const bodyType =
      (classItems.find((item) =>
        bodyTypes.has(item as CatalogBodyTypeKey),
      ) as CatalogBodyTypeKey) ?? "bodyA";

    // Parse skin
    let skinName = "00";
    classItems.forEach((item) => {
      if (!item.startsWith("skin")) return;

      const skinIndex = parseInt(item.slice(4), 10);
      if (isNaN(skinIndex)) return;

      skinName = (skinIndex + "").padStart(2, "0");
    });

    const skin = catalog.skin.find((s) => s.name === skinName) || catalog.skin[0];

    // Parse individual parts
    const slots = ["head", "hair", "top", "topSecondary", "bottom", "bottomSecondary", "shoes"];

    const newState: Partial<AvatarState> = {
      bodyType,
      skin,
      outfit: null,
    };

    for (const slot of slots) {
      const node = character.querySelector(`m-model.${slot}`);
      const src = node?.getAttribute("src");

      switch (slot) {
        case "head":
          newState.head = src ?? null;
          break;
        case "hair":
          newState.hair = src ?? null;
          break;
        case "top":
          newState.top = src ?? null;
          break;
        case "topSecondary":
          newState.topSecondary = src ?? null;
          break;
        case "bottom":
          newState.bottom = src ?? null;
          break;
        case "bottomSecondary":
          newState.bottomSecondary = src ?? null;
          break;
        case "shoes":
          newState.shoes = src ?? null;
          break;
      }
    }

    return newState;
  }
}
