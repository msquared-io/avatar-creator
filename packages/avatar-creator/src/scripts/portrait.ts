import {
  AppBase,
  Camera as EngineCamera,
  Color,
  Entity,
  RESOLUTION_AUTO,
  RESOLUTION_FIXED,
  SHADOW_PCF5_16F,
} from "playcanvas";

import Camera from "./camera";

/*
    Modifies rendering for one frame to render a portrait image and return a file
*/

// image resolution
const RESOLUTION = 256;

// image format, can be: image/png or image/webp
const FORMAT = "image/png";

/**
 * @callback PortraitRendered
 * @param {string} dataUrl String containing base64 data of the image
 */

/**
 * @param {Application} app PlayCanvas Application
 * @param {PortraitRendered} callback Will be called when portrait image is generated
 */
const render = (app: AppBase, callback: (dataUrl: string) => void) => {
  const canvas = app.graphicsDevice.canvas;

  // set image resolution
  app.setCanvasResolution(RESOLUTION_FIXED, RESOLUTION, RESOLUTION);

  // configure camera
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cameraEntity = app.root.findByName("camera")!;
  const cameraScript = (cameraEntity as any).script.camera as InstanceType<typeof Camera.class>;
  cameraScript.forcePortrait = true;
  const pcCamera = (cameraEntity as any).camera as EngineCamera;
  const fovBefore = pcCamera.fov;

  // hide skybox
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const layerSkybox = app.scene.layers.getLayerByName("Skybox")!;
  layerSkybox.enabled = false;

  // set up lights

  //      light orange
  const lightAccentA = new Entity("light");
  lightAccentA.addComponent("light", {
    type: "directional",
    intensity: 4,
    color: new Color(1, 0.5, 0),
    castShadows: true,
    shadowType: SHADOW_PCF5_16F,
    shadowResolution: 2048,
    shadowDistance: 4,
    shadowBias: 0.01,
    normalOffsetBias: 0.01,
  });
  lightAccentA.setLocalEulerAngles(90, 230, 0);
  cameraEntity.addChild(lightAccentA);

  //      light blue
  const lightAccentB = new Entity("light");
  lightAccentB.addComponent("light", {
    type: "directional",
    intensity: 10,
    color: new Color(0, 0.5, 1),
    castShadows: true,
    shadowType: SHADOW_PCF5_16F,
    shadowResolution: 2048,
    shadowDistance: 4,
    shadowBias: 0.01,
    normalOffsetBias: 0.01,
  });
  lightAccentB.setLocalEulerAngles(60, 130, 0);
  cameraEntity.addChild(lightAccentB);

  // need to wait for the rendering to happen
  app.once("postrender", () => {
    // get WEBP
    const dataUrl = canvas.toDataURL(FORMAT);

    // reset camera back
    cameraScript.forcePortrait = false;
    pcCamera.fov = fovBefore;

    // show skybox back
    layerSkybox.enabled = true;

    // remove lights
    lightAccentA.destroy();
    lightAccentB.destroy();

    // reset renderer to auto resolution
    app.setCanvasResolution(RESOLUTION_AUTO);

    if (callback) callback(dataUrl);
  });
};

export { render };
