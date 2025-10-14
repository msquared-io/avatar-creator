/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import parentStyles from "./Mml.module.css";
import styles from "./MmlButtons.module.css";

export default function MmlExportButton({ onClick }: { onClick: () => void }) {
  return (
    <div className={`${parentStyles.button} ${styles.export}`} onClick={onClick}>
      <span>Export</span>
      <svg
        width="200"
        height="52"
        viewBox="0 0 200 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="background"
          d="M181.69 52H5C2.24 52 0 49.76 0 47V18.31C0 16.19 0.84 14.15 2.34 12.65L12.66 2.34C14.16 0.84 16.2 0 18.32 0H195.01C197.77 0 200.01 2.24 200.01 5V33.69C200.01 35.81 199.17 37.85 197.67 39.35L187.36 49.66C185.86 51.16 183.82 52 181.7 52H181.69Z"
          fill="black"
        />
        <path
          className="border"
          opacity="0.3"
          d="M195 1C197.21 1 199 2.79 199 5V33.69C199 35.56 198.27 37.32 196.95 38.64L186.64 48.95C185.32 50.27 183.56 51 181.69 51H5C2.79 51 1 49.21 1 47V18.31C1 16.44 1.73 14.68 3.05 13.36L13.36 3.05C14.68 1.73 16.44 1 18.31 1H195ZM195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
          fill="#CBA6FF"
        />
        <path
          className="icon"
          d="M179.64 18V31.99L177.66 31.97V21.64L177.55 21.53L164.46 34.64L163 33.2L176.11 20.09L176 19.98H165.68V18H179.64Z"
          fill="#CBA6FF"
        />
      </svg>
    </div>
  );
}
