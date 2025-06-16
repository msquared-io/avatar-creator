import * as React from "react";
import { useState } from "react";

import parentStyles from "./Mml.module.css";
import styles from "./MmlButtons.module.css";

export default function MmlButtons({
  setOverlayActive,
  onSave,
  isLoading,
}: {
  setOverlayActive: (value: boolean) => void;
  onSave?: () => void;
  isLoading?: boolean;
}) {
  const [active, setActive] = useState(false);

  const onExportClick = () => {
    setOverlayActive(true);
  };

  const toggleActive = () => {
    setActive(!active);
  };

  const saveButtonClasses = [parentStyles.button, styles.save, isLoading ? styles.saveHidden : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={`${parentStyles.button} ${styles.export}`} onClick={onExportClick}>
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

      <div
        className={`${parentStyles.hamburger} ${active ? parentStyles.active : ""}`}
        onClick={toggleActive}
      >
        <svg
          className="normal"
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="background"
            opacity="0.25"
            d="M18.3174 0.5H57.001C59.4842 0.500093 61.5 2.51612 61.5 5V43.6904C61.4999 45.5542 60.808 47.352 59.5635 48.7275L59.3066 48.9961L48.998 59.3066C47.5927 60.7121 45.6809 61.4999 43.6934 61.5H4.99902C2.51576 61.4999 0.5 59.4839 0.5 57V18.3096C0.500106 16.4458 1.19199 14.648 2.43652 13.2725L2.69336 13.0039L13.0117 2.69336C14.3293 1.37563 16.0923 0.600486 17.9453 0.508789L18.3174 0.5Z"
            stroke="#CBA6FF"
          />
          <path className="icon" d="M48 21H14V25H48V21Z" fill="#CBA6FF" />
          <path className="icon" d="M48 29H14V33H48V29Z" fill="#CBA6FF" />
          <path className="icon" d="M48 37H14V41H48V37Z" fill="#CBA6FF" />
        </svg>
        <svg
          className="active"
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="background"
            opacity="0"
            d="M18.3174 0.5H57.001C59.4842 0.500093 61.5 2.51612 61.5 5V43.6904C61.4999 45.5542 60.808 47.352 59.5635 48.7275L59.3066 48.9961L48.998 59.3066C47.5927 60.7121 45.6809 61.4999 43.6934 61.5H4.99902C2.51576 61.4999 0.5 59.4839 0.5 57V18.3096C0.500106 16.4458 1.19199 14.648 2.43652 13.2725L2.69336 13.0039L13.0117 2.69336C14.3293 1.37563 16.0923 0.600486 17.9453 0.508789L18.3174 0.5Z"
            stroke="#CBA6FF"
          />
          <path
            className="icon"
            d="M47.29 20L31 36.29L14.71 20L12 22.71L31 41.71L50 22.71L47.29 20Z"
            fill="#CBA6FF"
          />
        </svg>
      </div>

      <div className={`${parentStyles.mobileMenu} ${active ? parentStyles.active : ""}`}>
        <div className={`${parentStyles.button} ${styles.mobileExport}`} onClick={onExportClick}>
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
              opacity="0.8"
              d="M195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="black"
            />
            <path
              className="icon"
              d="M179.64 18V31.99L177.66 31.97V21.64L177.55 21.53L164.46 34.64L163 33.2L176.11 20.09L176 19.98H165.68V18H179.64Z"
              fill="#CBA6FF"
            />
            <path
              className="border"
              opacity="0.3"
              d="M195 1C197.21 1 199 2.79 199 5V33.69C199 35.56 198.27 37.32 196.95 38.64L186.64 48.95C185.32 50.27 183.56 51 181.69 51H5C2.79 51 1 49.21 1 47V18.31C1 16.44 1.73 14.68 3.05 13.36L13.36 3.05C14.68 1.73 16.44 1 18.31 1H195ZM195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="#CBA6FF"
            />
          </svg>
        </div>
        {onSave && (
          <div className={saveButtonClasses} onClick={onSave}>
            <span>Save</span>
            <svg
              width="200"
              height="52"
              viewBox="0 0 200 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="border"
                opacity="0.8"
                d="M195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
                fill="black"
              />
              <path
                className="background"
                d="M181.69 52H5C2.24 52 0 49.76 0 47V18.31C0 16.19 0.84 14.15 2.34 12.65L12.66 2.34C14.16 0.84 16.2 0 18.32 0H195.01C197.77 0 200.01 2.24 200.01 5V33.69C200.01 35.81 199.17 37.85 197.67 39.35L187.36 49.66C185.86 51.16 183.82 52 181.7 52H181.69Z"
                fill="white"
              />
              <path
                className="icon"
                d="M180.58 18.5701L177.43 15.4201C177.16 15.1501 176.79 15.0001 176.4 15.0001H160.45C159.65 14.9901 159 15.6401 159 16.4401V35.5401C159 36.3401 159.65 36.9901 160.45 36.9901H179.55C180.35 36.9901 181 36.3401 181 35.5401V19.5901C181 19.2101 180.85 18.8401 180.58 18.5601V18.5701ZM173.55 16.4401V21.5401H164.45V16.4401H173.55ZM164.45 35.5401V29.4401H175.55V35.5401H164.45ZM179.55 35.5401H177V29.4401C177 28.6401 176.35 27.9901 175.55 27.9901H164.45C163.65 27.9901 163 28.6401 163 29.4401V35.5401H160.45V16.4401H163V21.5401C163 22.3401 163.65 22.9901 164.45 22.9901H173.55C174.35 22.9901 175 22.3401 175 21.5401V16.4401H176.4L179.55 19.5901V35.5401Z"
                fill="#6201EB"
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
