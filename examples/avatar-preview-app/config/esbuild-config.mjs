/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import path from "node:path";
import { copy } from "esbuild-plugin-copy";

/**
 * @param {Object} params
 * @param {string} params.entryFile
 * @param {string} params.outdir
 * @param {string} params.publicDir
 * @param {string} params.outbase
 * @param {string} params.sourceRoot
 * @param {string=} params.publicPath
 * @param {import('esbuild').BuildOptions['sourcemap']=} params.sourcemap
 * @param {boolean=} params.preserveSymlinks
 * @param {string=} params.assetNames
 * @param {string=} params.liveReloadPath
 * @returns {import('esbuild').BuildOptions}
 */
export function createEsbuildOptions(params) {
  const {
    entryFile,
    outdir,
    publicDir,
    outbase,
    sourceRoot,
    publicPath = "/",
    sourcemap = "linked",
    preserveSymlinks = true,
    assetNames = "[dir]/[name]-[hash]",
    liveReloadPath,
  } = params;

  const bannerJs = liveReloadPath
    ? `(() => {
  const path = '${liveReloadPath}';
  const endpoint = () => (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + path;
  let ws = null;
  let retries = 0;
  let timer = 0;
  let hasEverConnected = false;
  function connect() {
    try {
      ws = new WebSocket(endpoint());
    } catch (e) {
      scheduleReconnect();
      return;
    }
    ws.addEventListener('open', () => {
      retries = 0;
      if (hasEverConnected) {
        location.reload();
        return;
      }
      hasEverConnected = true;
      console.debug('[reload] websocket connected');
    });
    ws.addEventListener('message', () => {
      console.debug('[reload] message received -> reload');
      location.reload();
    });
    ws.addEventListener('close', () => {
      scheduleReconnect();
    });
    ws.addEventListener('error', () => {
      try { ws && ws.close(); } catch {}
    });
  }
  function scheduleReconnect() {
    const delay = Math.min(30000, 500 * Math.pow(2, retries++));
    clearTimeout(timer);
    timer = window.setTimeout(connect, delay);
    console.debug('[reload] websocket reconnecting in', delay, 'ms');
  }
  if (!window.__esbuildLiveReload) {
    window.__esbuildLiveReload = true;
    connect();
  }
})();`
    : undefined;

  return {
    entryPoints: { index: entryFile },
    bundle: true,
    format: "esm",
    target: ["es2022"],
    write: true,
    metafile: true,
    sourcemap,
    outdir,
    assetNames,
    preserveSymlinks,
    jsx: "automatic",
    loader: {
      ".wgsl": "text",
      ".html": "text",
      ".svg": "file",
      ".png": "file",
      ".jpg": "file",
      ".glb": "file",
      ".hdr": "file",
      ".webp": "file",
      ".css": "css",
    },
    outbase,
    sourceRoot,
    publicPath,
    external: ["node:worker_threads"],
    plugins: [
      copy({
        resolveFrom: "cwd",
        assets: { from: [path.join(publicDir, "**/*")], to: [outdir] },
      }),
    ],
    banner: bannerJs ? { js: bannerJs } : undefined,
  };
}


