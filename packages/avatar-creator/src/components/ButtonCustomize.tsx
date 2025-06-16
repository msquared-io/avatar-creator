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
  const onClick = () => {
    onStateChange("configurator");
  };

  const buttonClasses = [styles.button, appState === "home" ? styles.buttonVisible : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={buttonClasses} onClick={onClick}>
      <span>{label}</span>
      <svg
        width="420"
        height="90"
        viewBox="0 0 420 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M370.03 90H8C3.58 90 0 86.42 0 82V27.47C0 24.29 1.26 21.24 3.51 18.98L18.99 3.51C21.24 1.26 24.29 0 27.48 0H412.01C416.43 0 420.01 3.58 420.01 8V40.03C420.01 43.21 418.75 46.26 416.5 48.52L378.53 86.49C376.28 88.74 373.23 90 370.04 90H370.03Z"
          fill="#F2F2F2"
        />
      </svg>
    </div>
  );
}
