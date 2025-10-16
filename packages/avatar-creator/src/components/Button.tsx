/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import * as React from "react";

import styles from "./Button.module.css";

export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant - primary or secondary */
  variant?: "primary" | "secondary";
  /** Button size - medium or large */
  size?: "medium" | "large";
  /** Icon to display (positioned on right by default) */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class name */
  className?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** ARIA label for accessibility */
  "aria-label"?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  icon,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {size === "large" ? (
        <svg
          className={styles.buttonSvg}
          width="420"
          height="90"
          viewBox="0 0 420 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.background}
            d="M370.03 90H8C3.58 90 0 86.42 0 82V27.47C0 24.29 1.26 21.24 3.51 18.98L18.99 3.51C21.24 1.26 24.29 0 27.48 0H412.01C416.43 0 420.01 3.58 420.01 8V40.03C420.01 43.21 418.75 46.26 416.5 48.52L378.53 86.49C376.28 88.74 373.23 90 370.04 90H370.03Z"
          />
          <path
            className={styles.border}
            d="M412.01 1C415.88 1 419.01 4.13 419.01 8V40.03C419.01 42.94 417.89 45.72 415.89 47.72L377.92 85.69C375.92 87.69 373.14 88.81 370.23 88.81H8C4.13 88.81 1 85.68 1 81.81V27.47C1 24.56 2.12 21.78 4.12 19.78L19.6 4.3C21.6 2.3 24.38 1.18 27.29 1.18H412.01ZM412.01 0H27.48C24.29 0 21.24 1.26 18.99 3.51L3.51 18.99C1.26 21.24 0 24.29 0 27.48V82.01C0 86.43 3.58 90.01 8 90.01H370.03C373.22 90.01 376.27 88.75 378.52 86.5L416.49 48.53C418.74 46.28 420 43.23 420 40.04V8C420 3.58 416.42 0 412.01 0Z"
          />
        </svg>
      ) : (
        <svg
          className={styles.buttonSvg}
          viewBox="0 0 200 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.background}
            d="M181.69 52H5C2.24 52 0 49.76 0 47V18.31C0 16.19 0.84 14.15 2.34 12.65L12.66 2.34C14.16 0.84 16.2 0 18.32 0H195.01C197.77 0 200.01 2.24 200.01 5V33.69C200.01 35.81 199.17 37.85 197.67 39.35L187.36 49.66C185.86 51.16 183.82 52 181.7 52H181.69Z"
          />
          <path
            className={styles.border}
            d="M195 1C197.21 1 199 2.79 199 5V33.69C199 35.56 198.27 37.32 196.95 38.64L186.64 48.95C185.32 50.27 183.56 51 181.69 51H5C2.79 51 1 49.21 1 47V18.31C1 16.44 1.73 14.68 3.05 13.36L13.36 3.05C14.68 1.73 16.44 1 18.31 1H195ZM195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
          />
        </svg>
      )}
      <span className={`${styles.content} ${loading ? styles.contentLoading : ""}`}>
        {children}
        {icon ? <span className={styles.icon}>{icon}</span> : null}
      </span>
    </button>
  );
}
