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
import { RefObject, useCallback, useEffect, useState } from "react";

import styles from "./AvatarCreatorApp.module.css";
import { CatalogueData } from "./CatalogueData";
import ButtonCustomize from "./components/ButtonCustomize";
import Configurator from "./components/Configurator";
import Logo from "./components/Logo";
import Mml from "./components/Mml";
import ProfileBadge from "./components/ProfileBadge";
import Renderer from "./components/Renderer";
import { AvatarLoader } from "./scripts/avatar-loader";
import { render as renderPortrait } from "./scripts/portrait";

interface AvatarCreatorAppProps {
  dataUrl?: string;
  getAvatarMmlRef?: RefObject<(() => string | null) | null>;
  showExportButton?: boolean;
}

export function AvatarCreatorApp({
  dataUrl = "/data.json",
  getAvatarMmlRef,
  showExportButton = true,
}: AvatarCreatorAppProps = {}) {
  const [app, setApp] = useState<AppBase | null>(null);
  const [data, setData] = useState<CatalogueData | null>(null);
  const [avatarLoader, setAvatarLoader] = useState<AvatarLoader | null>(null);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [appState, setAppState] = useState<"home" | "configurator">("home");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  // TODO - enable saving
  const enableSave = false;

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

  const onSave = enableSave
    ? () => {
        if (!app) return;
        renderPortrait(app, (image: string) => {
          setPortrait(image);
        });
      }
    : undefined;

  const getAvatarMml = useCallback(() => {
    if (!avatarLoader) {
      return null;
    }
    return avatarLoader.getAvatarMml();
  }, [avatarLoader]);

  useEffect(() => {
    if (getAvatarMmlRef) {
      getAvatarMmlRef.current = getAvatarMml;
    }
  }, [getAvatarMmlRef, getAvatarMml]);

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
      <Logo appState={appState} />

      {data && avatarLoader && (
        <ButtonCustomize label="Customize" onStateChange={setAppState} appState={appState} />
      )}

      <ProfileBadge portrait={portrait} />

      {data && avatarLoader && app && (
        <Configurator
          data={data}
          avatarLoader={avatarLoader}
          onStateChange={setAppState}
          appState={appState}
          app={app}
        />
      )}

      {data && avatarLoader && showExportButton && (
        <Mml onSave={onSave} isLoading={isLoading} avatarLoader={avatarLoader} />
      )}
    </div>
  );
}
