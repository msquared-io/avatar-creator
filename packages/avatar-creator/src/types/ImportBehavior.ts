/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { RefObject } from "react";

export enum ImportBehaviorMode {
  None = "none",
  Copy = "copy",
  External = "external",
}

export type ImportBehavior =
  | {
      mode: ImportBehaviorMode.None;
    }
  | {
      mode: ImportBehaviorMode.Copy;
    }
  | {
      mode: ImportBehaviorMode.External;
      importMmlStringRef: RefObject<((mml: string) => void) | null>;
    };
