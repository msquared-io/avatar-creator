/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AvatarCreatorApp, ImportBehaviorMode } from "@msquared/avatar-creator";
import { CatalogueAnimation } from "@msquared/avatar-creator/build/CatalogueData";

import animations from "../public/animations.json";

const ANIMATIONS = animations.animations as CatalogueAnimation[];

export default function PreviewApp() {
  const dataUrl = process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json";
  return (
    <AvatarCreatorApp
      dataUrl={dataUrl}
      animations={ANIMATIONS}
      importBehavior={{ mode: ImportBehaviorMode.None }}
    />
  );
}
