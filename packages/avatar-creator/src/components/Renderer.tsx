/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import {
  AppBase,
  AppOptions,
  createGraphicsDevice,
  DEVICETYPE_WEBGL2,
  FILLMODE_FILL_WINDOW,
  registerScript,
  RESOLUTION_AUTO,
  ScriptType,
} from "playcanvas";
import {
  AnimComponentSystem,
  CameraComponentSystem,
  LightComponentSystem,
  RenderComponentSystem,
  ScriptComponentSystem,
} from "playcanvas";
import { ContainerHandler, TextureHandler } from "playcanvas";
import { useEffect, useRef } from "react";
import * as React from "react";

import { initialize as appInitialize } from "../scripts/application";
import Camera from "../scripts/camera";
import Input from "../scripts/input";
import styles from "./Renderer.module.css";

export default function Renderer({
  onInitialize,
  skyboxUrls,
  maximumFrameRate: maximumFrameRate,
}: {
  onInitialize: (app: AppBase) => void;
  skyboxUrls?: string[];
  maximumFrameRate?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    initialize();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  async function initialize() {
    if (!canvasRef.current) return;

    const device = await createGraphicsDevice(canvasRef.current, {
      deviceTypes: [DEVICETYPE_WEBGL2],
      antialias: false,
      xrCompatible: false,
    });
    device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

    // options
    const options = new AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [
      AnimComponentSystem,
      RenderComponentSystem,
      CameraComponentSystem,
      LightComponentSystem,
      ScriptComponentSystem,
    ];
    options.resourceHandlers = [ContainerHandler, TextureHandler];

    // app
    const app = new AppBase(canvasRef.current);
    app.init(options);
    app.scene.clusteredLightingEnabled = false;

    // resizing
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
    window.addEventListener("resize", () => app.resizeCanvas());

    // scripts
    // TODO - playcanvas scripts require extending a deprecated class - there doesn't seem to be a way to make this type safe
    registerScript(Camera.class as unknown as typeof ScriptType, Camera.name, app);
    registerScript(Input.class as unknown as typeof ScriptType, Input.name, app);

    // initialize application with custom skybox URLs if provided
    appInitialize(app, skyboxUrls);

    // start
    app.start();

    onInitialize(app);

    if (maximumFrameRate !== undefined) {
      // Disable auto-rendering to manually control frame rate
      app.autoRender = false;

      let lastFrameTime = performance.now();
      const targetFrameTime = 1000 / maximumFrameRate;

      function renderLoop() {
        const now = performance.now();
        const elapsed = now - lastFrameTime;

        if (elapsed >= targetFrameTime) {
          app.renderNextFrame = true;
          lastFrameTime = now - (elapsed % targetFrameTime);
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
      }
      renderLoop();
    }
  }

  return <canvas id="canvas" className={styles.canvas} ref={canvasRef} />;
}
