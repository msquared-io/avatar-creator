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

export type CatalogueBodyType = "male" | "female";

export type CatalogueSkin = {
  name: string; // E.g. "06"
  // TODO - index seems unused
  index: number; // E.g. 6
};

export type GenderBodyData = {
  body: {
    skin: true;
    torsoArms: string; //URL
    arms: string; //URL
    legsFeet: string; //URL
    legs: string; //URL
  };
};

export type CatalogueGenderData = Record<CatalogueBodyType, GenderBodyData & CatalogueParts>;

export type CatalogueData = DeepReadonly<{
  skin: Array<CatalogueSkin>;
  genders: CatalogueGenderData;
}>;
