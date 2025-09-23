/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { DeepReadonly } from "./DeepReadonly";

export type CatalogSkin = {
  name: string;
};

export type CatalogPartKey = "head" | "hair" | "top" | "bottom" | "shoes" | "outfit";

export type CatalogBasicPart = {
  thumbnail?: string;
  model: string;
  secondaryModel?: string;
  torso?: boolean;
  legs?: boolean;
};

export type CatalogSkinnedPart = Record<string, CatalogBasicPart>;

export type CatalogSectionSkinned = {
  skin: true;
  parts: CatalogSkinnedPart[];
};

export type CatalogSectionUnskinned = {
  skin: false;
  parts: CatalogBasicPart[];
};

export type CatalogBody = {
  torsoArms: CatalogSkinnedPart;
  arms: CatalogSkinnedPart;
  legs: CatalogSkinnedPart;
};

export type CatalogBodyTypeKey = "bodyA" | "bodyB";

export type CatalogBodyType = {
  name: CatalogBodyTypeKey;
  body: CatalogBody;
  parts: Record<string, CatalogSectionSkinned | CatalogSectionUnskinned>;
};

export type Catalog = DeepReadonly<{
  version: "0.1.0";
  skin: CatalogSkin[];
  bodyTypes: CatalogBodyType[];
}>;
