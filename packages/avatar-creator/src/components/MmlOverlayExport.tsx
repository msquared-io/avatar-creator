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
import IconCopy from "./icons/IconCopy";
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

  return (
    <div className={styles.overlay} ref={ref} onClick={onClose}>
      <div className={styles.popup}>
        <pre ref={codeRef} onClick={onCodeCopy}></pre>
        <Button variant="secondary" size="medium" onClick={onClose}>
          Close
        </Button>
        <Button variant="secondary" size="medium" onClick={onCopy} icon={<IconCopy />}>
          Copy
        </Button>
      </div>
    </div>
  );
}
