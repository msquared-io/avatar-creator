/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { RefObject } from "react";

export type ExportBehavior =
  | {
      mode: "default";
    }
  | {
      mode: "external";
      getAvatarMmlRef: RefObject<(() => string | null) | null>;
    }
  | {
      mode: "callback";
      onExport: (avatarMml: string) => void;
    };
