/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { ClientOnly } from "./client";

export function generateStaticParams() {
  return [{ slug: [""] }];
}

export default function Page() {
  return <ClientOnly />;
}
