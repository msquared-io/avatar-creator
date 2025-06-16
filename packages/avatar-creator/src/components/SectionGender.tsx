import * as React from "react";

import iconGenderASVG from "../assets/img/icon-gender-a.svg";
import iconGenderBSVG from "../assets/img/icon-gender-b.svg";
import { CatalogueBodyType } from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./SectionGender.module.css";
import SlotItem from "./SlotItem";

export default function SectionGender({
  gender,
  setGender,
  avatarLoader,
}: {
  gender: CatalogueBodyType;
  setGender: (value: CatalogueBodyType) => void;
  avatarLoader: AvatarLoader;
}) {
  return (
    <div className={styles.section}>
      <h2>Gender</h2>
      <ul>
        <SlotItem
          gender="female"
          active={gender === "female"}
          avatarLoader={avatarLoader}
          onClick={() => {
            setGender("female");
          }}
          image={iconGenderBSVG}
        />
        <SlotItem
          gender="male"
          active={gender === "male"}
          avatarLoader={avatarLoader}
          onClick={() => {
            setGender("male");
          }}
          image={iconGenderASVG}
        />
      </ul>
    </div>
  );
}
