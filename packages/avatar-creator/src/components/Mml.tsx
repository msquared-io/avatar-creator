import * as React from "react";
import { useState } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./Mml.module.css";
import MmlButtons from "./MmlButtons";
import MmlOverlay from "./MmlOverlay";

export default function Mml({
  onSave,
  isLoading,
  avatarLoader,
}: {
  onSave?: () => void;
  isLoading?: boolean;
  avatarLoader: AvatarLoader;
}) {
  const [active, setActive] = useState(false);

  return (
    <>
      <div className={styles.mml}>
        <MmlButtons setOverlayActive={setActive} onSave={onSave} isLoading={isLoading} />
      </div>
      {active && <MmlOverlay setActive={setActive} avatarLoader={avatarLoader} />}
    </>
  );
}
