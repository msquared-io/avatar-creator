/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AvatarCreatorApp } from "@private/avatar-creator";

export default function PreviewApp() {
  const dataUrl = process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json";
  return <AvatarCreatorApp dataUrl={dataUrl} />;
}
