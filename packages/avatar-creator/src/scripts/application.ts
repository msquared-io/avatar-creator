import {
  AppBase,
  Asset,
  BLEND_NORMAL,
  Color,
  Entity,
  Quat,
  SHADOW_PCF5_16F,
  SKYTYPE_BOX,
  SPECOCC_AO,
  StandardMaterial,
  Texture,
  TONEMAP_ACES,
} from "playcanvas";

/*

    Configure 3D scene and its components:
        camera
        post effects
        lights
        floor
        skybox

*/
import floorPngUrl from "../assets/img/floor.png";
import skyboxHighUrl from "../assets/img/skybox-high.hdr";
import skyboxLowUrl from "../assets/img/skybox-low.hdr";
import skyboxMidUrl from "../assets/img/skybox-mid.hdr";
import { CameraFrame } from "./camera-frame";
import loadSkybox from "./skybox";

const cameraFrameScriptName = "cameraFrame";

const initialize = (app: AppBase) => {
  app.root.addComponent("script");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  app.root.script!.create("input");

  // TODO - playcanvas scripts need names, but the field is private static
  (CameraFrame as any).__name = cameraFrameScriptName;
  // TODO - playcanvas scripts require extending a deprecated class - there doesn't seem to be a way to make this type safe
  app.scripts.add(CameraFrame as any);

  // camera
  const camera = new Entity("camera");
  camera.addComponent("camera", {
    clearColor: new Color(0, 0, 0, 0),
    toneMapping: TONEMAP_ACES,
  });
  camera.setPosition(0, 1.1, 2.6);
  camera.setLocalEulerAngles(-15, 0, 0);
  camera.addComponent("script");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  camera.script!.create("camera");

  // post effects
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cameraFrameScript = camera.script!.create(cameraFrameScriptName) as unknown as CameraFrame;
  //      general
  cameraFrameScript.rendering.samples = 4; // anti-aliasing
  cameraFrameScript.rendering.toneMapping = TONEMAP_ACES; // tonemapping
  //      ssao
  cameraFrameScript.ssao.type = "lighting";
  cameraFrameScript.ssao.intensity = 1;
  cameraFrameScript.ssao.power = 1;
  cameraFrameScript.ssao.minAngle = 15;
  cameraFrameScript.ssao.radius = 0.5;
  //      bloom
  cameraFrameScript.bloom.enabled = true;
  //      vignette
  cameraFrameScript.vignette.enabled = true;

  app.root.addChild(camera);

  // light with shadows
  const light = new Entity("light");
  light.addComponent("light", {
    type: "directional",
    castShadows: true,
    shadowType: SHADOW_PCF5_16F,
    shadowResolution: 2048,
    shadowDistance: 8,
    shadowBias: 0.01,
    normalOffsetBias: 0.01,
  });
  light.setLocalEulerAngles(60, 30, 0);
  // attached to camera
  camera.addChild(light);

  // floor material
  const floorMaterial = new StandardMaterial();
  floorMaterial.diffuse.set(0.1, 0.1, 0.1);
  floorMaterial.metalness = 0;
  floorMaterial.useMetalness = true;
  floorMaterial.glossInvert = false;
  floorMaterial.blendType = BLEND_NORMAL;
  floorMaterial.occludeSpecular = SPECOCC_AO;
  floorMaterial.aoMapChannel = "g";
  floorMaterial.glossMapChannel = "b";
  floorMaterial.opacityMapChannel = "r";
  floorMaterial.glossMapTiling.set(2, 2);
  floorMaterial.opacity = 0.7;
  floorMaterial.depthWrite = false;
  floorMaterial.useFog = false;

  // floor entity
  const floor = new Entity("floor");
  floor.addComponent("render", {
    type: "plane",
    material: floorMaterial,
  });
  floor.setLocalScale(4, 4, 4);
  app.root.addChild(floor);

  // floor texture
  const textureFloorAsset = new Asset("texture-floor", "texture", { url: floorPngUrl });

  textureFloorAsset.once("load", () => {
    const texture: Texture = textureFloorAsset.resource as Texture;
    floorMaterial.aoMap = texture;
    floorMaterial.glossMap = texture;
    floorMaterial.opacityMap = texture;
    floorMaterial.update();
  });

  app.assets.add(textureFloorAsset);
  app.assets.load(textureFloorAsset);

  // Progressively load skybox from lowest quality to highest
  // to avoid long loading with black background
  // TODO - this doesn't make a whole lot of sense now that the assets are baked into the JS - the loading is not progressive
  // low
  loadSkybox(app, skyboxLowUrl, "skybox-low.hdr", (assetLow, skybox, prefiltered) => {
    app.scene.skybox = skybox;
    app.scene.envAtlas = prefiltered;

    // mid
    loadSkybox(app, skyboxMidUrl, "skybox-mid.hdr", (assetMid, skybox, prefiltered) => {
      app.scene.skybox = skybox;
      app.scene.envAtlas = prefiltered;
      assetLow.unload();

      // high
      loadSkybox(app, skyboxHighUrl, "skybox-high.hdr", (asset, skybox, prefiltered) => {
        app.scene.skybox = skybox;
        app.scene.envAtlas = prefiltered;
        assetMid.unload();
      });
    });
  });

  // make skybox less intense
  app.scene.skyboxIntensity = 0.5;

  // rotate skybox by -90 yaw
  app.scene.skyboxRotation = new Quat().setFromEulerAngles(0, -90, 0);

  // skybox to be rendered as a cube
  app.scene.sky.type = SKYTYPE_BOX;
  app.scene.sky.center.set(0, 0.6, 0);
  app.scene.sky.node.setLocalScale(4.7, 4, 7);

  app.scene.exposure = 1.0;
};

export { initialize };
