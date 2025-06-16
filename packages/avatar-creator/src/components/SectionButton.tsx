import * as React from "react";

import { CataloguePartsKeys } from "../CatalogueData";
import styles from "./SectionButton.module.css";

export default function SectionButton({
  slot,
  setSection,
  active,
}: {
  slot: CataloguePartsKeys | "gender";
  setSection: (section: CataloguePartsKeys | "gender") => void;
  active: boolean;
}) {
  return (
    <li
      className={`${styles.sectionButton} ${active ? styles.active : ""}`}
      data-slot={slot}
      onClick={() => setSection(slot)}
    >
      <div className={styles.icon} />
    </li>
  );
}
