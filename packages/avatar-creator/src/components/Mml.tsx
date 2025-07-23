/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useState } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./Mml.module.css";
import MmlButtons from "./MmlButtons";
import MmlOverlayExport from "./MmlOverlayExport";
import MmlOverlayImport from "./MmlOverlayImport";

export default function Mml({
  onSave,
  isLoading,
  avatarLoader,
}: {
  onSave?: () => void;
  isLoading?: boolean;
  avatarLoader: AvatarLoader;
}) {
  const [active, setActive] = useState("");

  return (
    <>
      <div className={styles.mml}>
        <MmlButtons setOverlayActive={setActive} onSave={onSave} isLoading={isLoading} />
      </div>
      {active === "export" && (
        <MmlOverlayExport setActive={setActive} avatarLoader={avatarLoader} />
      )}
      {active === "import" && (
        <MmlOverlayImport setActive={setActive} avatarLoader={avatarLoader} />
      )}
    </>
  );
}
