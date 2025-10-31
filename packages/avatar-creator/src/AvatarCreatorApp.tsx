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
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimationData } from "./AnimationData";
import styles from "./AvatarCreatorApp.module.css";
import { CatalogueData } from "./CatalogueData";
import ButtonCustomize from "./components/ButtonCustomize";
import Configurator from "./components/Configurator";
import { Emotes } from "./components/Emotes";
import { MmlButtons } from "./components/MmlButtons";
import Renderer from "./components/Renderer";
import { AvatarLoader } from "./scripts/avatar-loader";
import { AvatarState, AvatarStateManager } from "./scripts/avatar-state-manager";
import { getAvatarMml, parseMmlToState } from "./scripts/mml-utils";
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
  isPreviewMode?: boolean;
  skyboxUrls?: string[];
  maximumFrameRate?: number;
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
  isPreviewMode = false,
  skyboxUrls,
  maximumFrameRate,
}: AvatarCreatorAppProps = {}) {
  const [app, setApp] = useState<AppBase | null>(null);
  const [data, setData] = useState<Catalog | null>(null);
  const [avatarLoader, setAvatarLoader] = useState<AvatarLoader | null>(null);
  const [stateManager, setStateManager] = useState<AvatarStateManager | null>(null);
  const [appState, setAppState] = useState<"home" | "configurator">("home");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [stats, setStats] = useState("");

  // Store the import callback from Configurator to pass to MmlButtons
  const importMmlCallbackRef = useRef<((state: Partial<AvatarState>) => void) | null>(null);

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

  /**
   * Checks for the current loading state of the avatar loader and updates the state accordingly.
   * It uses requestAnimationFrame() (which is more efficient than setInterval) to check the loading state periodically.
   * The loading state determines whether we show a loading spinner on top of the avatar.
   */
  useEffect(() => {
    if (!app || !data || avatarLoader) return;
    // this should be created only once
    const loader = new AvatarLoader(app, animations);
    setAvatarLoader(loader);

    const manager = new AvatarStateManager(loader, data, app, animations);
    setStateManager(manager);

    const statsHandle = loader.on("stats", (stats) => {
      setStats(stats.replace(/"/g, ""));
    });

    // Set up global loading listeners
    let rafId: number | null = null;
    let isMounted = true;

    const checkLoadingState = () => {
      if (!isMounted) return;

      const currentLoadingSize = loader.loadingByKey.size;

      if (currentLoadingSize > 0) {
        setIsAvatarLoading(true);
        rafId = requestAnimationFrame(checkLoadingState);
      } else {
        setIsAvatarLoading(false);
        rafId = null;
      }
    };

    const startPollingIfNeeded = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(checkLoadingState);
      }
    };

    // Kick once in case loading already started
    if (loader.loadingByKey.size > 0) {
      setIsAvatarLoading(true);
      startPollingIfNeeded();
    }

    // Start polling whenever a new load is initiated
    const originalLoad = loader.load.bind(loader);
    loader.load = (key: string, url: string) => {
      startPollingIfNeeded();
      return originalLoad(key, url);
    };

    const originalLoadCustom = loader.loadCustom.bind(loader);
    loader.loadCustom = (key: string, filename: string, objectUrl: string) => {
      startPollingIfNeeded();
      return originalLoadCustom(key, filename, objectUrl);
    };

    return () => {
      isMounted = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (statsHandle) statsHandle.off();
      // restore original methods
      loader.load = originalLoad;
      loader.loadCustom = originalLoadCustom;
    };
  }, [app, data, animations]);

  const getAvatarMmlCallback = useCallback(() => {
    if (!stateManager) {
      return null;
    }
    return getAvatarMml(stateManager);
  }, [stateManager]);

  useEffect(() => {
    if (exportBehavior.mode === ExportBehaviorMode.External) {
      exportBehavior.getAvatarMmlRef.current = getAvatarMmlCallback;
    }

    return () => {
      if (exportBehavior.mode === ExportBehaviorMode.External) {
        exportBehavior.getAvatarMmlRef.current = null;
      }
    };
  }, [exportBehavior, getAvatarMmlCallback]);

  const loadAvatarMmlCallback = useCallback(
    (mml: string) => {
      if (!stateManager || !data) return;
      // Try to use React state flow if callback is available
      if (importMmlCallbackRef.current) {
        const parsedState = parseMmlToState(mml, data);
        if (parsedState) {
          importMmlCallbackRef.current(parsedState);
          return;
        }
      }
    },
    [stateManager, data],
  );

  useEffect(() => {
    if (importBehavior.mode === ImportBehaviorMode.External && stateManager) {
      importBehavior.importMmlStringRef.current = loadAvatarMmlCallback;
      importBehavior.onImportReady();
    }

    return () => {
      if (importBehavior.mode === ImportBehaviorMode.External) {
        importBehavior.importMmlStringRef.current = null;
      }
    };
  }, [importBehavior, loadAvatarMmlCallback, stateManager]);

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
      <Renderer onInitialize={setApp} skyboxUrls={skyboxUrls} maximumFrameRate={maximumFrameRate} />
      <div className={styles.spinner} />
      <div className={styles.separatorLine} />

      {data && avatarLoader && !isPreviewMode && (
        <ButtonCustomize label="Customize" onStateChange={setAppState} appState={appState} />
      )}

      {data && stateManager && app && (
        <Configurator
          data={data}
          stateManager={stateManager}
          onStateChange={setAppState}
          onImportMmlCallback={(callback) => {
            importMmlCallbackRef.current = callback;
          }}
          appState={appState}
          app={app}
          importBehavior={importBehavior}
        />
      )}

      {data && stateManager ? (
        <MmlButtons
          stateManager={stateManager}
          catalog={data}
          exportBehavior={exportBehavior}
          importBehavior={importBehavior}
          isPreviewMode={isPreviewMode}
          importMmlCallbackRef={importMmlCallbackRef}
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
