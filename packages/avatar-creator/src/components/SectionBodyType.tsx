import * as React from "react";

import iconBodyTypeASVG from "../assets/img/icon-bodytype-a.svg";
import iconBodyTypeBSVG from "../assets/img/icon-bodytype-b.svg";
import { CatalogueBodyType } from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./SectionBodyType.module.css";
import SlotItem from "./SlotItem";

export default function SectionBodyType({
  bodyType,
  setBodyType,
  avatarLoader,
}: {
  bodyType: CatalogueBodyType;
  setBodyType: (value: CatalogueBodyType) => void;
  avatarLoader: AvatarLoader;
}) {
  return (
    <div className={styles.section}>
      <h2>Body Type</h2>
      <ul>
        <SlotItem
          bodyType="bodyB"
          active={bodyType === "bodyB"}
          avatarLoader={avatarLoader}
          onClick={() => {
            setBodyType("bodyB");
          }}
          image={iconBodyTypeBSVG}
        />
        <SlotItem
          bodyType="bodyA"
          active={bodyType === "bodyA"}
          avatarLoader={avatarLoader}
          onClick={() => {
            setBodyType("bodyA");
          }}
          image={iconBodyTypeASVG}
        />
      </ul>
    </div>
  );
}
