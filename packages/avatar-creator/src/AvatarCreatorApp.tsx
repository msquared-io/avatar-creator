/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import "./index.css";

import { AppBase } from "playcanvas";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import styles from "./AvatarCreatorApp.module.css";
import { CatalogueData } from "./CatalogueData";
import ButtonCustomize from "./components/ButtonCustomize";
import Configurator from "./components/Configurator";
<<<<<<< HEAD
import { Emotes } from "./components/Emotes";
import Mml from "./components/Mml";
import mmlStyles from "./components/Mml.module.css";
=======
>>>>>>> 18ae5d1 (feat: import option (WP-5338))
import { MmlButtons } from "./components/MmlButtons";
import Renderer from "./components/Renderer";
import { AvatarLoader } from "./scripts/avatar-loader";
import { ExportBehavior } from "./types/ExportBehavior";
import { ImportBehavior } from "./types/ImportBehavior";

type AvatarCreatorAppProps = {
  dataUrl?: string;
  exportBehavior?: ExportBehavior;
  importBehavior?: ImportBehavior;
  hideProfileBadge?: boolean;
};

export function AvatarCreatorApp({
  dataUrl = "/data.json",
  exportBehavior = { mode: "default" },
  importBehavior = { mode: "none" },
}: AvatarCreatorAppProps = {}) {
  const [app, setApp] = useState<AppBase | null>(null);
  const [data, setData] = useState<CatalogueData | null>(null);
  const [avatarLoader, setAvatarLoader] = useState<AvatarLoader | null>(null);
  const [appState, setAppState] = useState<"home" | "configurator">("home");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
<<<<<<< HEAD
  const [stats, setStats] = useState("");
  // TODO - enable saving
  const enableSave = false;
=======
>>>>>>> 18ae5d1 (feat: import option (WP-5338))

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      const res = await fetch(dataUrl);
      const raw = await res.json();
      setData(raw);
      setIsDataLoading(false);
    };
    loadData();
  }, [dataUrl]);

  useEffect(() => {
    if (!app || !data || avatarLoader) return;
    // this should be created only once
    const loader = new AvatarLoader(app, data);
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
    if (exportBehavior.mode === "external") {
      exportBehavior.getAvatarMmlRef.current = getAvatarMml;
    }

    return () => {
      if (exportBehavior.mode === "external") {
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
    if (importBehavior.mode === "external") {
      importBehavior.importMmlStringRef.current = loadAvatarMml;
    }

    return () => {
      if (importBehavior.mode === "external") {
        importBehavior.importMmlStringRef.current = null;
      }
    };
  }, [importBehavior, loadAvatarMml]);

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
          data={data}
          avatarLoader={avatarLoader}
          exportBehavior={exportBehavior}
          importBehavior={importBehavior}
        />
      ) : null}


      {data && avatarLoader && app && <Emotes data={data} appState={appState} app={app} />}

      {avatarLoader && avatarLoader.debugAssets && <pre className={styles.stats}>{stats}</pre>}
    </div>
  );
}
