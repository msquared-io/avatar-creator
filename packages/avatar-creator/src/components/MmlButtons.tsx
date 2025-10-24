/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import { ExportBehavior, ExportBehaviorMode } from "../types/ExportBehavior";
import { ImportBehavior, ImportBehaviorMode } from "../types/ImportBehavior";
import Button from "./Button";
import mmlStyles from "./Mml.module.css";
import { MmlOverlay } from "./MmlOverlay";
import MmlOverlayExport from "./MmlOverlayExport";
import MmlOverlayImport from "./MmlOverlayImport";

type Props = {
  avatarLoader: AvatarLoader | null;
  exportBehavior: ExportBehavior;
  importBehavior: ImportBehavior;
  isPreviewMode: boolean;
};

export function MmlButtons({ avatarLoader, exportBehavior, importBehavior, isPreviewMode }: Props) {
  const [activeOverlay, setActiveOverlay] = useState<MmlOverlay>(MmlOverlay.None);

  if (isPreviewMode) {
    exportBehavior = { mode: ExportBehaviorMode.None };
  }

  return (
    <>
      <div className={mmlStyles.mml}>
        {avatarLoader &&
        (exportBehavior.mode === ExportBehaviorMode.Default ||
          exportBehavior.mode === ExportBehaviorMode.Callback) ? (
          <Button
            variant="secondary"
            size="medium"
            icon={<ArrowUpRight />}
            onClick={() =>
              exportBehavior.mode === ExportBehaviorMode.Default
                ? setActiveOverlay(MmlOverlay.Export)
                : exportBehavior.onExport(avatarLoader.getAvatarMml())
            }
          >
            Export
          </Button>
        ) : null}

        {avatarLoader && importBehavior.mode === ImportBehaviorMode.Copy ? (
          <Button
            variant="secondary"
            size="medium"
            icon={<ArrowDownLeft />}
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
