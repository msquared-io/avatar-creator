/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import hljs from "highlight.js";
import xml from "highlight.js/lib/languages/xml";
import * as React from "react";
import { MouseEvent, useEffect, useRef } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./MmlOverlayExport.module.css";

hljs.registerLanguage("xml", xml);

const keyReplace = {
  "top:secondary": "topSecondary",
  "bottom:secondary": "bottomSecondary",
};

export default function MmlOverlayExport({
  setActive,
  avatarLoader,
}: {
  setActive: (value: string) => void;
  avatarLoader: AvatarLoader;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    hljs.highlightElement(codeRef.current);

    const className = [
      avatarLoader.getBodyType(),
      `skin${avatarLoader.getSkin()?.name ?? ""}`,
    ].join(" ");

    let code = "";
    code += `<m-character class="${className}" src="${encodeURI(avatarLoader.urls.torso ?? "")}">\n`;

    for (const key in avatarLoader.urls) {
      if (key === "torso") continue;
      const url = avatarLoader.urls[key];
      if (!url) continue;
      const className = key in keyReplace ? keyReplace[key as keyof typeof keyReplace] : key;
      code += `    <m-model class="${className}" src="${encodeURI(url)}"></m-model>\n`;
    }

    code += `</m-character>`;

    code = hljs.highlight(code, { language: "xml" }).value;

    codeRef.current.innerHTML = code;
  }, []);

  const onCodeCopy = (evt: MouseEvent) => {
    evt.stopPropagation();
    if (!codeRef.current) return;
    const range = document.createRange();
    range.selectNodeContents(codeRef.current);
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
    navigator.clipboard.writeText(codeRef.current.textContent ?? "");
  };

  const onCopy = (evt: MouseEvent) => {
    evt.stopPropagation();
    if (!codeRef.current?.textContent) return;
    navigator.clipboard.writeText(codeRef.current.textContent);
  };

  const onClose = () => {
    setActive("");
  };

  return (
    <div className={styles.overlay} ref={ref} onClick={onClose}>
      <div className={styles.popup}>
        <pre ref={codeRef} onClick={onCodeCopy}></pre>
        <div className={styles.button} onClick={onClose}>
          <span className={styles.label}>Close</span>
          <svg
            width="200"
            height="52"
            viewBox="0 0 200 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className={styles.background}
              opacity="0.8"
              d="M195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="black"
            />
            <path
              className={styles.border}
              opacity="0.3"
              d="M195 1C197.21 1 199 2.79 199 5V33.69C199 35.56 198.27 37.32 196.95 38.64L186.64 48.95C185.32 50.27 183.56 51 181.69 51H5C2.79 51 1 49.21 1 47V18.31C1 16.44 1.73 14.68 3.05 13.36L13.36 3.05C14.68 1.73 16.44 1 18.31 1H195ZM195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="#CBA6FF"
            />
          </svg>
        </div>
        <div className={styles.button} onClick={onCopy}>
          <span className={styles.label}>Copy</span>
          <svg
            width="200"
            height="52"
            viewBox="0 0 200 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className={styles.background}
              opacity="0.8"
              d="M195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="black"
            />
            <path
              className={styles.icon}
              d="M180.58 18.5701L177.43 15.4201C177.16 15.1501 176.79 15.0001 176.4 15.0001H160.45C159.65 14.9901 159 15.6401 159 16.4401V35.5401C159 36.3401 159.65 36.9901 160.45 36.9901H179.55C180.35 36.9901 181 36.3401 181 35.5401V19.5901C181 19.2101 180.85 18.8401 180.58 18.5601V18.5701ZM173.55 16.4401V21.5401H164.45V16.4401H173.55ZM164.45 35.5401V29.4401H175.55V35.5401H164.45ZM179.55 35.5401H177V29.4401C177 28.6401 176.35 27.9901 175.55 27.9901H164.45C163.65 27.9901 163 28.6401 163 29.4401V35.5401H160.45V16.4401H163V21.5401C163 22.3401 163.65 22.9901 164.45 22.9901H173.55C174.35 22.9901 175 22.3401 175 21.5401V16.4401H176.4L179.55 19.5901V35.5401Z"
              fill="#CBA6FF"
            />
            <path
              className={styles.border}
              opacity="0.3"
              d="M195 1C197.21 1 199 2.79 199 5V33.69C199 35.56 198.27 37.32 196.95 38.64L186.64 48.95C185.32 50.27 183.56 51 181.69 51H5C2.79 51 1 49.21 1 47V18.31C1 16.44 1.73 14.68 3.05 13.36L13.36 3.05C14.68 1.73 16.44 1 18.31 1H195ZM195 0H18.31C16.19 0 14.15 0.84 12.65 2.34L2.34 12.66C0.84 14.16 0 16.2 0 18.32V47.01C0 49.77 2.24 52.01 5 52.01H181.69C183.81 52.01 185.85 51.17 187.35 49.67L197.66 39.36C199.16 37.86 200 35.82 200 33.7V5C200 2.24 197.76 0 195 0Z"
              fill="#CBA6FF"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
