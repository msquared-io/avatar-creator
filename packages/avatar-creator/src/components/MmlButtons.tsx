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
import { ExportBehavior } from "../types/ExportBehavior";
import { ImportBehavior } from "../types/ImportBehavior";
import Button from "./Button";
import IconExport from "./icons/IconExport";
import IconImport from "./icons/IconImport";
import mmlStyles from "./Mml.module.css";
import { MmlOverlay } from "./MmlOverlay";
import MmlOverlayExport from "./MmlOverlayExport";
import MmlOverlayImport from "./MmlOverlayImport";

export function MmlButtons({
  avatarLoader,
  exportBehavior,
  importBehavior,
}: {
  avatarLoader: AvatarLoader | null;
  exportBehavior: ExportBehavior;
  importBehavior: ImportBehavior;
}) {
  const [activeOverlay, setActiveOverlay] = useState<MmlOverlay>(MmlOverlay.None);

  return (
    <>
      <div className={mmlStyles.mml}>
        {avatarLoader &&
        (exportBehavior.mode === "default" || exportBehavior.mode === "callback") ? (
          <Button
            variant="secondary"
            size="medium"
            icon={<IconExport />}
            onClick={() =>
              exportBehavior.mode === "default"
                ? setActiveOverlay(MmlOverlay.Export)
                : exportBehavior.onExport(avatarLoader.getAvatarMml())
            }
          >
            Export
          </Button>
        ) : null}

        {avatarLoader && importBehavior.mode === "copy" ? (
          <Button
            variant="secondary"
            size="medium"
            icon={<IconImport />}
            onClick={() => setActiveOverlay(MmlOverlay.Import)}
          >
            Import
          </Button>
        ) : null}
      </div>

      {activeOverlay === MmlOverlay.Export && avatarLoader ? (
        <MmlOverlayExport setActive={setActiveOverlay} avatarLoader={avatarLoader} />
      ) : null}
      {activeOverlay === MmlOverlay.Import && avatarLoader ? (
        <MmlOverlayImport setActive={setActiveOverlay} avatarLoader={avatarLoader} />
      ) : null}
    </>
  );
}
