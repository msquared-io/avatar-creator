/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import hljs from "highlight.js";
import xml from "highlight.js/lib/languages/xml";
import { Import } from "lucide-react";
import * as React from "react";
import { MouseEvent, useEffect, useRef } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import Button from "./Button";
import { MmlOverlay } from "./MmlOverlay";
import styles from "./MmlOverlayImport.module.css";

hljs.registerLanguage("xml", xml);

export default function MmlOverlayImport({
  setActive,
  avatarLoader,
}: {
  setActive: (value: MmlOverlay) => void;
  avatarLoader: AvatarLoader;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  let overlayDown = false;
  let focusCode = false;

  const selectCode = () => {
    if (!codeRef.current) return false;
    const range = document.createRange();
    range.selectNodeContents(codeRef.current);
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  useEffect(() => {
    selectCode();

    const evtWindowMouseDown = (evt: globalThis.MouseEvent) => {
      overlayDown = evt.target === ref.current;
    };
    const evtWindowMouseUp = (evt: globalThis.MouseEvent) => {
      if (overlayDown && evt.target === ref.current) setActive(MmlOverlay.None);
      overlayDown = false;
    };

    window.addEventListener("mousedown", evtWindowMouseDown);
    window.addEventListener("mouseup", evtWindowMouseUp);

    return () => {
      window.removeEventListener("mousedown", evtWindowMouseDown);
      window.removeEventListener("mouseup", evtWindowMouseUp);
    };
  }, []);

  const onCodeMouseDown = () => {
    focusCode = false;
    if (!codeRef.current) return false;
    if (codeRef.current === document.activeElement) return;
    selectCode();
    focusCode = true;
  };

  const onCodeMouseUp = (evt: MouseEvent) => {
    if (focusCode) {
      focusCode = false;
      evt.preventDefault();
    }
  };

  const onImport = () => {
    const code = codeRef.current?.textContent ?? "";
    avatarLoader.loadAvatarMml(code);
  };

  const onClose = () => {
    setActive(MmlOverlay.None);
  };

  return (
    <div className={styles.overlay} ref={ref}>
      <div className={styles.popup}>
        <pre
          contentEditable="true"
          ref={codeRef}
          onMouseDown={onCodeMouseDown}
          onMouseUp={onCodeMouseUp}
        >
          // Paste your MML code here
        </pre>
        <Button variant="secondary" size="medium" onClick={onClose}>
          Close
        </Button>
        <Button variant="secondary" size="medium" onClick={onImport} icon={<Import />}>
          Import
        </Button>
      </div>
    </div>
  );
}
