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

import { AvatarState, AvatarStateManager } from "../scripts/avatar-state-manager";
import { getAvatarMml } from "../scripts/mml-utils";
import { Catalog } from "../types/Catalog";
import { ExportBehavior, ExportBehaviorMode } from "../types/ExportBehavior";
import { ImportBehavior, ImportBehaviorMode } from "../types/ImportBehavior";
import Button from "./Button";
import mmlStyles from "./Mml.module.css";
import { MmlOverlay } from "./MmlOverlay";
import MmlOverlayExport from "./MmlOverlayExport";
import MmlOverlayImport from "./MmlOverlayImport";

type Props = {
  stateManager: AvatarStateManager | null;
  catalog: Catalog;
  exportBehavior: ExportBehavior;
  importBehavior: ImportBehavior;
  isPreviewMode: boolean;
  importMmlCallbackRef: React.RefObject<((state: Partial<AvatarState>) => void) | null>;
};

export function MmlButtons({
  stateManager,
  catalog,
  exportBehavior,
  importBehavior,
  isPreviewMode,
  importMmlCallbackRef,
}: Props) {
  const [activeOverlay, setActiveOverlay] = useState<MmlOverlay>(MmlOverlay.None);

  if (isPreviewMode) {
    exportBehavior = { mode: ExportBehaviorMode.None };
  }

  return (
    <>
      <div className={mmlStyles.mml}>
        {stateManager &&
        (exportBehavior.mode === ExportBehaviorMode.Default ||
          exportBehavior.mode === ExportBehaviorMode.Callback) ? (
          <Button
            variant="secondary"
            size="medium"
            icon={<ArrowUpRight />}
            onClick={() =>
              exportBehavior.mode === ExportBehaviorMode.Default
                ? setActiveOverlay(MmlOverlay.Export)
                : exportBehavior.onExport(getAvatarMml(stateManager))
            }
          >
            Export
          </Button>
        ) : null}

        {stateManager && importBehavior.mode === ImportBehaviorMode.Copy ? (
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

      {activeOverlay === MmlOverlay.Export && stateManager ? (
        <MmlOverlayExport setActive={setActiveOverlay} stateManager={stateManager} />
      ) : null}
      {activeOverlay === MmlOverlay.Import ? (
        <MmlOverlayImport
          setActive={setActiveOverlay}
          catalog={catalog}
          importMmlCallback={importMmlCallbackRef.current}
        />
      ) : null}
    </>
  );
}
