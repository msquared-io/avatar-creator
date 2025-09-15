/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { RefObject } from "react";

export enum ExportBehaviorMode {
  Default = "default",
  External = "external",
  Callback = "callback",
}

export type ExportBehavior =
  | {
      mode: ExportBehaviorMode.Default;
    }
  | {
      mode: ExportBehaviorMode.External;
      getAvatarMmlRef: RefObject<(() => string | null) | null>;
    }
  | {
      mode: ExportBehaviorMode.Callback;
      onExport: (avatarMml: string) => void;
    };
