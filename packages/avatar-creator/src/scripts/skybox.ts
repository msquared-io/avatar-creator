/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AppBase, Asset, EnvLighting, Texture } from "playcanvas";

/*

    Loads an .hdr skybox

*/

/**
 * @param {Application} app PlayCanvas Application
 * @param {string} url Url to .hdr equirectangular skybox texture
 * @param {Function} callback Will be called when loaded
 */
const load = (
  app: AppBase,
  url: string,
  filename: string,
  callback: (asset: Asset, skybox: Texture, atlas: Texture) => void,
) => {
  const asset = new Asset("cubemap", "texture", { url, filename }, { mipmaps: false });

  asset.once("load", () => {
    const texture: Texture = asset.resource as Texture;
    const skybox = EnvLighting.generateSkyboxCubemap(texture);
    const lighting = EnvLighting.generateLightingSource(texture);
    const prefiltered = EnvLighting.generateAtlas(lighting);
    lighting.destroy();

    callback(asset, skybox, prefiltered);
  });

  app.assets.add(asset);
  app.assets.load(asset);
};

export default load;
