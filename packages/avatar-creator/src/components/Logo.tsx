/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import styles from "./Logo.module.css";

export default function Logo({ appState }: { appState: "home" | "configurator" }) {
  const logoClasses = [styles.logo, appState === "home" ? styles.logoVisible : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={logoClasses}>
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_219_739)">
          <path
            d="M26.18 55.64H19.59C17.81 55.64 16.36 54.19 16.36 52.41V45.82C16.36 42.21 13.43 39.27 9.81 39.27H1.41C1.09 39.27 0.8 39.45 0.66 39.73C-0.22 41.5 -0.22 43.58 0.66 45.35C0.8 45.63 1.09 45.81 1.41 45.81H9.82V52.45C9.82 57.82 14.17 62.17 19.54 62.17H26.18V70.58C26.18 70.9 26.36 71.19 26.64 71.33C28.41 72.21 30.49 72.21 32.26 71.33C32.54 71.19 32.72 70.9 32.72 70.58V62.17C32.72 58.56 29.79 55.62 26.17 55.62L26.18 55.64ZM55.64 45.82V52.41C55.64 54.19 54.19 55.64 52.41 55.64H45.82C42.2 55.64 39.27 58.57 39.27 62.19H52.46C57.83 62.19 62.18 57.84 62.18 52.47V39.28C58.56 39.28 55.63 42.21 55.63 45.83L55.64 45.82ZM71.34 26.65C71.2 26.37 70.91 26.19 70.59 26.19H62.18V19.55C62.18 14.18 57.83 9.83 52.46 9.83H45.82V1.41C45.82 1.09 45.64 0.8 45.36 0.66C43.59 -0.22 41.51 -0.22 39.74 0.66C39.46 0.8 39.28 1.09 39.28 1.41V9.82C39.28 13.43 42.21 16.37 45.83 16.37H52.42C54.2 16.37 55.65 17.82 55.65 19.6V26.19C55.65 29.8 58.58 32.74 62.2 32.74H70.61C70.93 32.74 71.22 32.56 71.36 32.28C72.24 30.51 72.24 28.43 71.36 26.66L71.34 26.65ZM9.82 19.54V32.73C13.43 32.73 16.37 29.8 16.37 26.18V19.59C16.37 17.81 17.82 16.36 19.6 16.36H26.19C29.8 16.36 32.74 13.43 32.74 9.81H19.55C14.18 9.81 9.83 14.16 9.83 19.53L9.82 19.54Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_219_739">
            <rect width="72" height="72" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
