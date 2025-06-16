import * as React from "react";

import styles from "./ConfiguratorBack.module.css";

export default function ConfiguratorBack({
  onStateChange,
}: {
  onStateChange: (state: "home" | "configurator") => void;
}) {
  const onClick = () => {
    onStateChange("home");
  };

  return (
    <div className={styles.back} onClick={onClick}>
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="circle"
          transform="scale(1.07, 1.07) translate(-4, -4)"
          stroke="#CBA6FF"
          d="M28.438,5.000 C41.382,5.000 51.875,15.493 51.875,28.438 C51.875,41.382 41.382,51.875 28.438,51.875 C15.493,51.875 5.000,41.382 5.000,28.438 C5.000,15.493 15.493,5.000 28.438,5.000 Z"
        />
        <path
          className="arrow"
          d="M24.87 35.8801L15 26.0001L24.88 16.1201L26.28 17.5401L18.97 24.8501V24.9901H36.97V27.0401L18.97 27.0201V27.1601L26.26 34.4701L24.86 35.8701L24.87 35.8801Z"
          fill="#CBA6FF"
        />
      </svg>
    </div>
  );

