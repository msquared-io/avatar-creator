import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as process from "node:process";

import * as esbuild from "esbuild";

export const cssChunksFixPlugin = (options?: {
  includeIndex?: boolean;
  autoInsert?: boolean;
}): esbuild.Plugin => ({
  name: "css-chunks-fix",
  setup(build: esbuild.PluginBuild) {
    const computedOptions = {
      includeIndex: true,
      autoInsert: false,
      ...(options || {}),
    };
    build.onResolve({ filter: /builtCssStyles/ }, () => {
      return { path: "builtCssStyles", namespace: "css-chunks-plugin" };
    });
    build.onLoad({ filter: /.*/, namespace: "css-chunks-plugin" }, () => {
      return {
        contents: `export const styles = JSON.parse("TO_REPLACE_WITH_BUILT_CSS");`,
        loader: "ts",
      };
    });
    build.onEnd(async (result) => {
      const buildRoot = process.cwd();
      const filesToBuild: Array<[string, string]> = [];
      const allBuiltFiles: Array<string> = [];
      Object.entries(result.metafile?.outputs ?? {}).forEach(([outfile, meta]) => {
        allBuiltFiles.push(outfile);
        if (meta.cssBundle) {
          if (computedOptions.includeIndex || outfile !== "build/index.js") {
            filesToBuild.push([outfile, meta.cssBundle]);
          }
        }
      });
      const allCss: { [key: string]: string } = {};
      await Promise.all(
        filesToBuild.map(([jsFilePath, cssFilePath]) => {
          const fullJsPath = resolve(buildRoot, jsFilePath);
          const fullCssPath = resolve(buildRoot, cssFilePath);
          return Promise.all([
            readFile(fullCssPath, { encoding: "utf8" }),
            readFile(fullJsPath, { encoding: "utf8" }),
            cssFilePath,
          ])
            .then(([css, js, cssFileName]) => {
              allCss[cssFileName] = css;
              if (computedOptions.autoInsert) {
                return (
                  js + genCSSInjection(css, "css_" + cssFileName.replace(/[^a-zA-Z0-9]/g, "_"))
                );
              }
              return js;
            })
            .then((newJs: string) => writeFile(fullJsPath, newJs, { encoding: "utf8" }));
        }),
      );
      const builtJsFiles = [];
      for (const filePath of allBuiltFiles) {
        if (filePath.endsWith(".js")) {
          builtJsFiles.push(filePath);
        }
      }
      await Promise.all(
        builtJsFiles.map((jsFilePath) => {
          const fullJsPath = resolve(buildRoot, jsFilePath);
          return readFile(fullJsPath, { encoding: "utf8" })
            .then((js) => {
              return js.replace(
                '"TO_REPLACE_WITH_BUILT_CSS"',
                JSON.stringify(JSON.stringify(allCss)),
              );
            })
            .then((newJs: string) => writeFile(fullJsPath, newJs, { encoding: "utf8" }));
        }),
      );
    });
  },
});

function genCSSInjection(cssContent: string, digest: string) {
  return `
(() => {
  const content = ${JSON.stringify(cssContent)};
  const digest = ${JSON.stringify(digest)};
  setTimeout(() => {
    let root = globalThis.document.querySelector("head");
    const container = globalThis.document.createElement("style");
    container.id = "_" + digest;
    container.appendChild(globalThis.document.createTextNode(content));
    root.appendChild(container);
  }, 0);
})();`;
}
