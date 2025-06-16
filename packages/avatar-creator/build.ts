import path from "node:path";

import autoprefixer from "autoprefixer";
import * as esbuild from "esbuild";
import postCssPlugin from "esbuild-style-plugin";
import * as httpServer from "http-server";
import yargs from "yargs";

import { cssChunksFixPlugin } from "../../build-utils/cssChunksFixPlugin";
import { dtsPlugin } from "../../build-utils/dtsPlugin";

const argv = yargs(process.argv)
  .strictOptions()
  .options({
    mode: { type: "string", demandOption: true },
    port: { type: "number", demandOption: false },
  })
  .usage("Usage: $0 --mode build|watch (--port {PORT})")
  .parseSync();

const mode = argv.mode;

const buildOptions: esbuild.BuildOptions = {
  entryPoints: {
    index: "src/index.tsx",
  },
  bundle: true,
  format: "esm",
  outdir: "build",
  outbase: "./src",
  platform: "node",
  packages: "external",
  sourcemap: true,
  target: "node14",
  write: true,
  metafile: true,
  publicPath: "/",
  assetNames: "/[name]-[hash]",
  splitting: true,
  preserveSymlinks: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
  loader: {
    ".svg": "dataurl",
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".glb": "dataurl",
    ".webp": "dataurl",
    ".hdr": "dataurl",
  },
  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [autoprefixer],
      },
      cssModulesOptions: {
        localsConvention: "camelCaseOnly",
        scopeBehaviour: "local",
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
    }),
    cssChunksFixPlugin({ autoInsert: true }),
    dtsPlugin(),
  ],
};

switch (mode) {
  case "build":
    esbuild.build(buildOptions).catch(() => process.exit(1));
    break;
  case "watch":
    esbuild
      .context({ ...buildOptions })
      .then((context) => context.watch())
      .catch(() => process.exit(1));
    break;
  default:
    console.error(`Mode must be provided as one of "build" or "watch"`);
}
