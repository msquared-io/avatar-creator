/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import "./index.css";

import dracoWasmJs from "base64:./wasm/draco.wasm.js";
import dracoWasmWasm from "base64:./wasm/draco.wasm.wasm";
import { AppBase } from "playcanvas";
import * as playcanvas from "playcanvas";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { AnimationData } from "./AnimationData";
import styles from "./AvatarCreatorApp.module.css";
import { CatalogueData } from "./CatalogueData";
import ButtonCustomize from "./components/ButtonCustomize";
import Configurator from "./components/Configurator";
import { Emotes } from "./components/Emotes";
import { MmlButtons } from "./components/MmlButtons";
import Renderer from "./components/Renderer";
import { AvatarLoader } from "./scripts/avatar-loader";
import { render as renderPortrait } from "./scripts/portrait";
import { transpileCatalog } from "./scripts/transpileCatalog";
import { Catalog } from "./types/Catalog";
import { ExportBehavior, ExportBehaviorMode } from "./types/ExportBehavior";
import { GenerateAvatarImageBehavior } from "./types/GeneratePortraitBehavior";
import { ImportBehavior, ImportBehaviorMode } from "./types/ImportBehavior";

type AvatarCreatorAppProps = {
  dataUrl?: string;
  animations?: AnimationData;
  exportBehavior?: ExportBehavior;
  importBehavior?: ImportBehavior;
  generateAvatarImageBehavior?: GenerateAvatarImageBehavior;
  hideProfileBadge?: boolean;
};

playcanvas.WasmModule.setConfig("DracoDecoderModule", {
  glueUrl: "data:text/javascript;base64," + dracoWasmJs,
  wasmUrl: "data:application/wasm;base64," + dracoWasmWasm,
});

export function AvatarCreatorApp({
  dataUrl = "/data.json",
  animations = [],
  exportBehavior = { mode: ExportBehaviorMode.Default },
  importBehavior = { mode: ImportBehaviorMode.None },
  generateAvatarImageBehavior = undefined,
}: AvatarCreatorAppProps = {}) {
  const [app, setApp] = useState<AppBase | null>(null);
  const [data, setData] = useState<Catalog | null>(null);
  const [avatarLoader, setAvatarLoader] = useState<AvatarLoader | null>(null);
  const [appState, setAppState] = useState<"home" | "configurator">("home");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [stats, setStats] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);

      const dataRaw = await fetch(dataUrl).then((r) => r.json());

      // Any catalog without a version number we assume to be the original directory based catalog.
      // Any future catalog formats are versioned.
      if (dataRaw.version === undefined) {
        const transpiledCatalog = transpileCatalog(dataRaw as CatalogueData);
        setData(transpiledCatalog);
      } else {
        if (dataRaw.version !== "0.1.0") {
          throw new Error("Unsupported catalog version");
        }
        setData(dataRaw);
      }

      setIsDataLoading(false);
    };
    loadData();
  }, [dataUrl]);

  useEffect(() => {
    if (!app || !data || avatarLoader) return;
    // this should be created only once
    const loader = new AvatarLoader(app, data, animations);
    setAvatarLoader(loader);

    loader.on("stats", (stats) => {
      setStats(stats.replace(/"/g, ""));
    });

    // Set up global loading listeners
    if (loader) {
      // Listen for any loading events
      const checkLoading = () => {
        if (loader?.loading?.size > 0) {
          setIsAvatarLoading(true);
        } else {
          setIsAvatarLoading(false);
        }
      };

      // Set up interval to check loading state
      const interval = setInterval(checkLoading, 100);

      return () => clearInterval(interval);
    }
  }, [app, data]);

  const getAvatarMml = useCallback(() => {
    if (!avatarLoader) {
      return null;
    }
    return avatarLoader.getAvatarMml();
  }, [avatarLoader]);

  useEffect(() => {
    if (exportBehavior.mode === ExportBehaviorMode.External) {
      exportBehavior.getAvatarMmlRef.current = getAvatarMml;
    }

    return () => {
      if (exportBehavior.mode === ExportBehaviorMode.External) {
        exportBehavior.getAvatarMmlRef.current = null;
      }
    };
  }, [exportBehavior, getAvatarMml]);

  const loadAvatarMml = useCallback(
    (mml: string) => {
      if (!avatarLoader) return;
      avatarLoader.loadAvatarMml(mml);
    },
    [avatarLoader],
  );

  useEffect(() => {
    if (importBehavior.mode === ImportBehaviorMode.External) {
      importBehavior.importMmlStringRef.current = loadAvatarMml;
    }

    return () => {
      if (importBehavior.mode === ImportBehaviorMode.External) {
        importBehavior.importMmlStringRef.current = null;
      }
    };
  }, [importBehavior, loadAvatarMml]);

  const generateAvatarImage = useCallback(
    (resolution: number, callback: (dataUrl: string) => void) => {
      if (!app) {
        return;
      }
      renderPortrait(app, resolution, callback);
    },
    [app],
  );

  useEffect(() => {
    if (!generateAvatarImageBehavior) {
      return;
    }
    generateAvatarImageBehavior.generateAvatarImageRef.current = generateAvatarImage;

    return () => {
      if (generateAvatarImageBehavior.generateAvatarImageRef.current) {
        generateAvatarImageBehavior.generateAvatarImageRef.current = null;
      }
    };
  }, [generateAvatarImage]);

  const isLoading = isDataLoading || isAvatarLoading;

  const rootClasses = [
    styles.root,
    appState === "home" ? styles.stateHome : "",
    appState === "configurator" ? styles.stateConfigurator : "",
    isLoading ? styles.loading : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div id="root" className={rootClasses}>
      <Renderer onInitialize={setApp} />
      <div className={styles.spinner} />
      <div className={styles.separatorLine} />

      {data && avatarLoader && (
        <ButtonCustomize label="Customize" onStateChange={setAppState} appState={appState} />
      )}

      {data && avatarLoader && app && (
        <Configurator
          data={data}
          avatarLoader={avatarLoader}
          onStateChange={setAppState}
          appState={appState}
          app={app}
        />
      )}

      {data && avatarLoader ? (
        <MmlButtons
          avatarLoader={avatarLoader}
          exportBehavior={exportBehavior}
          importBehavior={importBehavior}
        />
      ) : null}

      {animations && avatarLoader && app && (
        <Emotes animations={animations} appState={appState} app={app} />
      )}

      {avatarLoader && avatarLoader.debugAssets && <pre className={styles.stats}>{stats}</pre>}
    </div>
  );
}

export { ExportBehaviorMode, ImportBehaviorMode };
