/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { CatalogueData } from "../CatalogueData";
import {
  Catalog,
  CatalogBasicPart,
  CatalogBody,
  CatalogBodyType,
  CatalogSectionSkinned,
  CatalogSectionUnskinned,
  CatalogSkinnedPart,
} from "../types/Catalog";

const BASIC_PART_KEYS = ["hair", "top", "bottom", "shoes", "outfit"] as const;

export function transpileCatalog(oldFormatCatalog: CatalogueData): Catalog {
  const skin = oldFormatCatalog.skin.map((skin) => ({ name: skin.name }));

  return {
    version: "0.1.0",

    skin,

    bodyTypes: Object.entries(oldFormatCatalog.bodyTypes).map(
      ([bodyType, bodyTypeData]): CatalogBodyType => {
        const body: CatalogBody = {
          torsoArms: Object.fromEntries(
            skin.map((skin) => [
              skin.name,
              {
                name: skin.name,
                model: `${bodyTypeData.body.torsoArms}_${skin.name}.glb`,
              },
            ]),
          ),
          arms: Object.fromEntries(
            skin.map((skin) => [
              skin.name,
              {
                name: skin.name,
                model: `${bodyTypeData.body.arms}_${skin.name}.glb`,
              },
            ]),
          ),
          legs: Object.fromEntries(
            skin.map((skin) => [
              skin.name,
              {
                name: skin.name,
                model: `${bodyTypeData.body.legs}_${skin.name}.glb`,
              },
            ]),
          ),
        };

        const oldHead = bodyTypeData.head;

        const head: CatalogSectionSkinned = {
          skin: true,
          parts: oldHead.list.map((oldHeadPart): CatalogSkinnedPart => {
            const skinnedParts: [string, CatalogBasicPart][] = skin.map(
              ({ name: skinName }): [string, CatalogBasicPart] => [
                skinName,
                {
                  thumbnail: `${oldHeadPart.file}_${skinName}.webp`,
                  model: `${oldHeadPart.file}_${skinName}.glb`,
                },
              ],
            );

            return Object.fromEntries(skinnedParts);
          }),
        };

        // Create unskinned sections for basic parts.
        const basicParts = Object.fromEntries(
          BASIC_PART_KEYS.map((partKey) => {
            const oldPartData = bodyTypeData[partKey];
            const section: CatalogSectionUnskinned = {
              skin: false,
              parts: oldPartData.list.map((oldPart): CatalogBasicPart => {
                const part: CatalogBasicPart = {
                  thumbnail: `${oldPart.file}.webp`,
                  model: `${oldPart.file}.glb`,
                };
                if (oldPart.torso) {
                  part.torso = true;
                }
                if (oldPart.secondary) {
                  part.secondaryModel = `${oldPart.secondary}.glb`;
                }

                return part;
              }),
            };
            return [partKey, section];
          }),
        );

        const parts: CatalogBodyType["parts"] = {
          head,
          ...basicParts,
        };
        return {
          name: bodyType,
          parts,
          body,
        };
      },
    ),
  };
}
