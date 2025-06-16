import * as React from "react";


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

  const [items, setItems] = useState<Array<CataloguePart>>([]);


    if (!data.genders) {
      return;
    }












    <div className={styles.section}>
      <h2>{title}</h2>












              avatarLoader={avatarLoader}














