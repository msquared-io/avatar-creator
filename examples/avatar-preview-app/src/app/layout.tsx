/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import "../index.css";

import type { Metadata, Viewport } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Avatars - MSquared",
  description:
    "MSquared Avatars are customizable, interoperable 3D avatars built on the MML standard for use in games and virtual worlds.",
};

export const viewport: Viewport = {
  themeColor: "#6c00f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <div id="root" className="state-home">
          {children}
        </div>
      </body>
    </html>
  );
}
