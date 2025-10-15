/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import Button from "./Button";
import styles from "./ButtonCustomize.module.css";

export default function ButtonCustomize({
  label,
  onStateChange,
  appState,
}: {
  label: string;
  onStateChange: (state: "home" | "configurator") => void;
  appState: "home" | "configurator";
}) {
  const onClick = () => {
    onStateChange("configurator");
  };

  const buttonClasses = [styles.button, appState === "home" ? styles.buttonVisible : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Button className={buttonClasses} variant="primary" size="large" onClick={onClick}>
      <span>{label}</span>
    </Button>
  );
}
