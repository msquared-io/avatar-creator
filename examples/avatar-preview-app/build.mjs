import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEsbuildOptions } from "./config/esbuild-config.mjs";

const buildMode = "--build";
const watchMode = "--watch";

const helpString = `Mode must be provided as one of ${buildMode} or ${watchMode}`;

const args = process.argv.splice(2);

if (args.length !== 1) {
  console.error(helpString);
  process.exit(1);
}

const mode = args[0];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);

const baseOptions = createEsbuildOptions({
    entryFile: path.join(projectRoot, "src/index.tsx"),
    outdir: path.join(projectRoot, "build"),
    publicDir: path.join(projectRoot, "public"),
    outbase: path.join(projectRoot, "src"),
    sourceRoot: path.join(projectRoot, "src"),
});

const baseAlias = { ...(baseOptions.alias || {}) };
delete baseAlias.playcanvas;

const buildOptions = {
  ...baseOptions,
  alias: {
    ...baseAlias,
    "@msquared/avatar-creator": path.join(
      projectRoot,
      "..",
      "..",
      "packages",
      "avatar-creator",
      "src",
      "index.tsx",
    ),
  },
  define: {
    "process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL": JSON.stringify(
      process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json",
    ),
  },
};

async function main() {
  switch (mode) {
    case buildMode: {
      await esbuild.build(buildOptions);
      break;
    }
    case watchMode: {
      const context = await esbuild.context(buildOptions);
      await context.watch();
      break;
    }
    default:
      console.error(helpString);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


