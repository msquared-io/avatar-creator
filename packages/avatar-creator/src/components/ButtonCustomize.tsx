import * as React from "react";

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

    onStateChange("configurator");


  const buttonClasses = [styles.button, appState === "home" ? styles.buttonVisible : ""]
    .filter(Boolean)
    .join(" ");


    <div className={buttonClasses} onClick={onClick}>
















