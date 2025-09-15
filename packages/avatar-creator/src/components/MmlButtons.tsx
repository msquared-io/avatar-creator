/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";
import { useState } from "react";

import { CatalogueData } from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import { ExportBehavior } from "../types/ExportBehavior";
import { ImportBehavior } from "../types/ImportBehavior";
import mmlStyles from "./Mml.module.css";
import MmlExportButton from "./MmlExportButton";
import MmlImportButton from "./MmlImportButton";
import { MmlOverlay } from "./MmlOverlay";
import MmlOverlayExport from "./MmlOverlayExport";
import MmlOverlayImport from "./MmlOverlayImport";

export function MmlButtons({
  data,
  avatarLoader,
  exportBehavior,
  importBehavior,
}: {
  data: CatalogueData | null;
  avatarLoader: AvatarLoader | null;
  exportBehavior: ExportBehavior;
  importBehavior: ImportBehavior;
}) {
  const [activeOverlay, setActiveOverlay] = useState<MmlOverlay>(MmlOverlay.None);

  return (
    <>
      <div className={mmlStyles.mml}>
        {data &&
        avatarLoader &&
        (exportBehavior.mode === "default" || exportBehavior.mode === "callback") ? (
          <MmlExportButton
            onClick={() =>
              exportBehavior.mode === "default"
                ? setActiveOverlay(MmlOverlay.Export)
                : exportBehavior.onExport(avatarLoader.getAvatarMml())
            }
          />
        ) : null}

        {data && avatarLoader && importBehavior.mode === "copy" ? (
          <MmlImportButton onClick={() => setActiveOverlay(MmlOverlay.Import)} />
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
