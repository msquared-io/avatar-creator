/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

export type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends object
    ? {
        readonly [K in keyof T]: DeepReadonly<T[K]>;
      }
    : T;

export type CataloguePart = {
  file: string; //URL
  secondary?: string; //URL
  torso?: boolean;
  legs?: boolean;
};

export type CatalogueParts = {
  head: {
    skin: true;
    list: Array<CataloguePart>;
  };
  hair: {
    list: Array<CataloguePart>;
  };
  top: {
    list: Array<CataloguePart>;
  };
  bottom: {
    list: Array<CataloguePart>;
  };
  shoes: {
    list: Array<CataloguePart>;
  };
};

export type CataloguePartsKeys = keyof CatalogueParts;

export type CatalogueBodyType = "bodyA" | "bodyB";

export type CatalogueSkin = {
  name: string; // E.g. "06"
  // TODO - index seems unused
  index: number; // E.g. 6
};

export type BodyTypeBodyData = {
  body: {
    skin: true;
    torsoArms: string; //URL
    arms: string; //URL
    legsFeet: string; //URL
    legs: string; //URL
  };
};

export type CatalogueBodyTypeData = Record<CatalogueBodyType, BodyTypeBodyData & CatalogueParts>;

export type CatalogueData = DeepReadonly<{
  skin: Array<CatalogueSkin>;
  bodyTypes: CatalogueBodyTypeData;
}>;
