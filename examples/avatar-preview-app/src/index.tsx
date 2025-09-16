/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import "./index.css";

import { createRoot } from "react-dom/client";

import PreviewApp from "./PreviewApp";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element with id 'root' was not found.");
}

const root = createRoot(container);
root.render(<PreviewApp />);
