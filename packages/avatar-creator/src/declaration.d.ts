/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

declare module "*.hdr" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.glb" {
  const value: string;
  export default value;
}

declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare global {
  interface Window {
    app: any;
  }
}
