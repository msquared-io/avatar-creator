/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

export type CatalogSkin = {
  name: string; // E.g. "06"
};

export type CatalogBasicPart = {
  thumbnail?: string;
  model: string;
  secondaryModel?: string;
  torso?: boolean;
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

export type CatalogBodyType = {
  name: string;
  body: CatalogBody;
  parts: Record<string, CatalogSectionSkinned | CatalogSectionUnskinned>;
};

export type Catalog = {
  version: "0.1.0";
  skin: CatalogSkin[];
  bodyTypes: CatalogBodyType[];
};
