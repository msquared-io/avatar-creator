import * as React from "react";

import styles from "./ConfiguratorBack.module.css";

export default function ConfiguratorBack({
  onStateChange,
}: {
  onStateChange: (state: "home" | "configurator") => void;
}) {

    onStateChange("home");



    <div className={styles.back} onClick={onClick}>






















