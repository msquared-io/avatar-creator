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
import Button from "./Button";
import { MmlOverlay } from "./MmlOverlay";
import styles from "./MmlOverlayExport.module.css";

hljs.registerLanguage("xml", xml);

export default function MmlOverlayExport({
  setActive,
  avatarLoader,
}: {
  setActive: (value: MmlOverlay) => void;
  avatarLoader: AvatarLoader;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    hljs.highlightElement(codeRef.current);

    let code = avatarLoader.getAvatarMml(true);

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
    setActive(MmlOverlay.None);
  };

  const CopyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.58 8.57L17.43 5.42C17.16 5.15 16.79 5 16.4 5H10.45C9.65 4.99 9 5.64 9 6.44V15.54C9 16.34 9.65 16.99 10.45 16.99H19.55C20.35 16.99 21 16.34 21 15.54V9.59C21 9.21 20.85 8.84 20.58 8.56V8.57ZM13.55 6.44V9.54H10.45V6.44H13.55ZM10.45 15.54V12.44H17.55V15.54H10.45ZM19.55 15.54H18V12.44C18 11.64 17.35 10.99 16.55 10.99H10.45C9.65 10.99 9 11.64 9 12.44V15.54H7.45V6.44H9V9.54C9 10.34 9.65 10.99 10.45 10.99H13.55C14.35 10.99 15 10.34 15 9.54V6.44H16.4L19.55 9.59V15.54Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className={styles.overlay} ref={ref} onClick={onClose}>
      <div className={styles.popup}>
        <pre ref={codeRef} onClick={onCodeCopy}></pre>
        <Button variant="secondary" size="medium" onClick={onClose}>
          Close
        </Button>
        <Button variant="secondary" size="medium" onClick={onCopy} icon={<CopyIcon />}>
          Copy
        </Button>
      </div>
    </div>
  );
}
