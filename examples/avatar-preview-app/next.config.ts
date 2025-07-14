/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Outputs a Single-Page Application (SPA)
  distDir: "build", // Changes the build output directory to `build`
  reactStrictMode: false, // Disable React Strict Mode to avoid double rendering
};

export default nextConfig;
