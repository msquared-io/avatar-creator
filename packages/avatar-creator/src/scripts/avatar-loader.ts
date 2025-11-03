/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import {
  AnimTrack,
  AppBase,
  Asset,
  ContainerResource,
  Entity,
  EventHandler,
  GraphNode,
  MeshInstance,
  StandardMaterial,
} from "playcanvas";
import type { GlbContainerResource } from "playcanvas/build/playcanvas/src/framework/parsers/glb-container-resource";

import { AnimationData, AnimationType } from "../AnimationData";
import { addAnimationData, AnimGraphData, generateDefaultAnimGraph } from "../AnimGraphData";
import { humanFileSize } from "./utils";

/**
 * Handles loading and rendering of GLB avatar parts.
 * Manages asset caching, entity creation, and mesh rendering for avatar components.
 * Uses a key-based system where each key can reference a different GLB file.
 */

/**
 * Fired when new GLB has started loading for a key
 * @event AvatarLoader#loading:key:url
 */

/**
 * Fired when GLB has loaded for a key
 * @event AvatarLoader#loaded:key:url
 */

// Assets are removed from the cache after 1 second
const ASSET_EXPIRES = 1000;

export class AvatarLoader extends EventHandler {
  private assetsByKey: { [key: string]: Asset } = {};

  private assetsCacheByUrl = new Map<string, Asset>();

  // Maps from URL to the time it was added to the cache/last used.
  private assetTimersByUrl = new Map<string, number>();

  // Tracks which URL is currently displayed for each key
  private displayedUrlByKey = new Map<string, string>();

  // Tracks which URL is the target (being loaded or should be loaded) for each key
  private currentUrlByKey = new Map<string, string>();

  // Mapping of what is currently being loaded for a specific key.
  public loadingByKey = new Map<string, string>();
  public debugAssets: boolean = false;
  private entity: Entity | null = null;
  private keyEntities: { [key: string]: Entity } = {};
  private animTrack: AnimTrack | null = null;

  private animGraphData: AnimGraphData = generateDefaultAnimGraph();

  // Flag to indicate if root entity needs recreation
  private needsRootEntityRecreation = false;

  /**
   * @param {AppBase} app PlayCanvas AppBase
   * @param {AnimationData} animations Animation data for the avatar
   */
  constructor(
    public app: AppBase,
    public animations: AnimationData,
  ) {
    super();

    this.app.on("update", this.checkAssetsCache, this);
  }

  /**
   * Marks the loader to recreate the root entity on next asset load
   */
  markForRootEntityRecreation() {
    this.needsRootEntityRecreation = true;
  }

  /**
   * @param {Asset} asset
   * @private
   */
  createRootEntity(asset: Asset) {
    this.createOrRecreateRootEntity(asset, false);
  }

  private createOrRecreateRootEntity(asset: Asset, forceRecreate: boolean = false) {
    if (this.entity && !forceRecreate && !this.needsRootEntityRecreation) return;

    // If recreating due to flag, clear the flag
    if (this.needsRootEntityRecreation) {
      this.needsRootEntityRecreation = false;
      forceRecreate = true;
    }

    // If recreating, clean up the old entity
    if (this.entity && forceRecreate) {
      this.app.root.removeChild(this.entity);
      this.entity.destroy();
      this.entity = null;

      // Reset animation graph
      this.animGraphData = generateDefaultAnimGraph();

      // Clear all key entities since they reference the old root bone
      for (const key in this.keyEntities) {
        this.keyEntities[key].destroy();
      }
      this.keyEntities = {};
    }

    if (this.entity) return;

    const entity = (asset.resource as ContainerResource).instantiateRenderEntity();
    this.entity = entity;

    this.entity.addComponent("anim", {
      activate: true,
      speed: 1,
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    entity.anim!.rootBone = entity;

    // compensate for weird animation
    entity.setLocalPosition(0, 0.08, 0);

    this.app.root.addChild(entity);

    entity.forEach((ent: GraphNode) => {
      if (ent instanceof Entity) {
        ent.removeComponent("render");
      }
    });

    if (this.animations?.length) {
      let appearAnimName: string = "";

      // add animation data to anim-graph
      for (const item of this.animations) {
        const name = item.name;

        if (item.type === AnimationType.Idle) {
          continue;
        }

        if (item.type === AnimationType.Appear) {
          appearAnimName = name;
        }

        addAnimationData(this.animGraphData, name);
      }

      // load anim-graph
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entity.anim!.loadStateGraph(this.animGraphData);

      // load animations
      for (const item of this.animations) {
        this.loadAnimation(item.name, item.file);
      }

      // trigger "appear" animation by default
      if (appearAnimName) {
        entity.anim?.setTrigger(appearAnimName);
      }
    }

    // listen to global event on app for animation triggers
    this.app.on("anim", (name) => {
      // eslint-disable-next-line
      if (!entity.anim?.parameters.hasOwnProperty(name)) return;
      entity.anim?.setTrigger(name, true);
    });
  }

  /**
   * @private
   */
  loadAnimation(name: string, url: string) {
    const fileName = url.split("/").slice(-1)[0];

    const asset: Asset = new Asset(fileName, "container", { url, filename: fileName }, undefined, {
      // filter out translation from animation,
      // apart from the root
      // TODO - this option is untyped in playcanvas
      animation: {
        preprocess: (data: {
          name: string;
          samplers: Array<{ input: number; output: number }>;
          channels: Array<{ sampler: number; target: { node: number; path: string } }>;
        }) => {
          data.channels = data.channels.filter((item) => {
            return item.target.node <= 2 || item.target.path === "rotation";
          });
        },
      },
    } as any);

    asset.ready(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const animResource = asset!.resource as {
        animations: Array<Asset>;
      };
      this.animTrack = animResource.animations[0].resource as AnimTrack;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.entity!.anim!.assignAnimation(name, this.animTrack);
    });

    this.app.assets.add(asset);
    this.app.assets.load(asset);
  }

  /**
   * Patches emissive color for materials that have emissive maps.
   * Sets emissive color to white and intensity to 5 for materials with emissive maps
   * that have low emissive values.
   * @private
   */
  patchEmissiveColor(meshInstances: MeshInstance[]) {
    for (let i = 0; i < meshInstances.length; i++) {
      const material = meshInstances[i].material as StandardMaterial;
      if (
        material.emissiveMap &&
        material.emissive.r <= 1 &&
        material.emissive.g <= 1 &&
        material.emissive.b <= 1
      ) {
        material.emissive.set(1, 1, 1, 1);
        material.emissiveIntensity = 5;
      }
    }
  }

  /**
   * Applies GLB container renders and materials to a key entity.
   */
  private applyContainerToKey(key: string, container: GlbContainerResource): void {
    // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.keyEntities[key].render!.asset = container.renders[0];

    if (container.renders.length > 1) {
      for (let i = 1; i < container.renders.length; i++) {
        const entity = new Entity(`${key}-${i}`);
        entity.addComponent("render", {
          type: "asset",
          rootBone: this.entity,
        });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        entity.render!.asset = container.renders[i] as unknown as number;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        entity.render!.materialAssets = [container.materials[i]] as unknown as Asset[];

        const meshInstancesChild = entity.render?.meshInstances;
        if (meshInstancesChild) {
          this.patchEmissiveColor(meshInstancesChild);
        }

        this.keyEntities[key].addChild(entity);
      }
    }

    // The Asset from GlbContainerResource import misaligns with the "playcanvas" import.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.keyEntities[key].render!.materialAssets = container.materials as unknown as Asset[];

    const meshInstances = this.keyEntities[key].render?.meshInstances;
    if (meshInstances) {
      this.patchEmissiveColor(meshInstances);
    }
  }

  /**
   * Creates an entity for a key if it doesn't exist
   */
  private ensureKeyEntity(key: string): void {
    if (this.keyEntities[key]) return;

    const entity = new Entity(key);
    this.keyEntities[key] = entity;
    entity.addComponent("render", {
      type: "asset",
      rootBone: this.entity,
    });
    this.entity?.addChild(entity);
  }

  /**
   * Loads a GLB file for the provided key.
   * If it is a first key to be loaded, then it will use that model's skeleton for the base hierarchy
   *
   * @param {string} key Unique key to identify this part
   * @param {string} url Full url to GLB file to load
   */
  load(key: string, url: string) {
    const name = url.split("/").pop();
    if (!name) {
      throw new Error("Could not get name from URL");
    }

    let asset = this.assetsCacheByUrl.get(url);
    if (!asset) {
      asset = new Asset(url, "container", {
        url,
        filename: name,
        hash: url,
      });
      this.app.assets.add(asset);
      this.assetsCacheByUrl.set(url, asset);
      this.assetTimersByUrl.set(url, performance.now());
    }

    this.loadingByKey.set(key, url);
    this.currentUrlByKey.set(key, url);

    asset.ready(() => {
      this.loadingByKey.delete(key);

      // Check if this URL is still the current one for this key (might have been replaced by a newer load)
      if (this.currentUrlByKey.get(key) !== url) {
        return;
      }

      this.createRootEntity(asset);

      this.ensureKeyEntity(key);

      this.assetsByKey[key] = asset;

      const container = asset.resource as GlbContainerResource;
      this.applyContainerToKey(key, container);

      // Mark this URL as now displayed (so old one can be cleaned up)
      this.displayedUrlByKey.set(key, url);

      this.updateStats();
    });

    asset.once("error", () => {
      this.loadingByKey.delete(key);

      // Only clear the render if this URL is still the current one for this key
      if (this.currentUrlByKey.get(key) === url && this.keyEntities[key]) {
        // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEntities[key].render!.asset = null;
        // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEntities[key].render!.materialAssets = [];
      }
    });

    this.app.assets.load(asset, { force: true });
  }

  /**
   * Loads a GLB file from ObjectURL for provided key.
   *
   * @param {string} key Unique key to identify this part
   * @param {string} filename filename of GLB file
   * @param {string} objectUrl ObjectURL created from local file
   */
  loadCustom(key: string, filename: string, objectUrl: string) {
    if (this.loadingByKey.has(key)) {
      return;
    }

    this.loadingByKey.set(key, filename);
    this.currentUrlByKey.set(key, filename);

    // load file using ObjectURL
    this.app.assets.loadFromUrl(objectUrl, "container", (err, asset) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!asset) return;

      // Check if this is still the current one for this key
      if (this.currentUrlByKey.get(key) !== filename) {
        return;
      }

      this.loadingByKey.delete(key);

      this.createRootEntity(asset);

      this.ensureKeyEntity(key);

      this.assetsByKey[key] = asset;

      const container = asset.resource as GlbContainerResource;
      this.applyContainerToKey(key, container);

      // Mark this as now displayed
      this.displayedUrlByKey.set(key, filename);
    });
  }

  /**
   * Unloads the asset for a given key
   * @param {string} key Key to unload
   */
  unload(key: string) {
    // IMPORTANT: Always remove from currentUrlByKey so the asset won't be applied when it finishes loading
    this.currentUrlByKey.delete(key);
    this.displayedUrlByKey.delete(key);

    if (this.keyEntities[key]) {
      // Clear the main entity's render
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.keyEntities[key].render!.asset = 0;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.keyEntities[key].render!.materialAssets = [];

      // Destroy all child entities (for multi-render models)
      const children = this.keyEntities[key].children.slice();
      for (const child of children) {
        child.destroy();
      }
    }
  }

  /**
   * Updates the stats for stored assets
   * This is only used for debugging and displayed when the debugAssets flag is true
   */
  updateStats() {
    if (!this.debugAssets) return;

    console.log(
      "stats",
      JSON.stringify(
        {
          assets: this.app.assets.list().length,
          textures: humanFileSize(this.app.stats.vram.tex),
          vertexBuffers: humanFileSize(this.app.stats.vram.vb),
          indexBuffers: humanFileSize(this.app.stats.vram.ib),
          storedAssets: this.app.assets.list().map((asset) => asset.name),
        },
        null,
        4,
      ),
    );
  }

  /**
   * Clears an asset from the cache
   * @param {Asset} asset The asset to clear from the cache
   * @param {string} url The URL of the asset
   */
  clearAssetResources(asset: Asset, url: string) {
    this.app.assets.remove(asset);
    asset.unload();

    this.assetsCacheByUrl.delete(url);
    this.assetTimersByUrl.delete(url);
  }

  /**
   * Called on update from playcanvas
   * Clears any assets that have not been used within the expire time
   * Resets the expiry time for assets currently still active
   */
  checkAssetsCache() {
    const now: number = performance.now();

    // Build a set of currently active URLs (both displayed and target URLs)
    const activeUrls = new Set<string>();
    for (const url of this.currentUrlByKey.values()) {
      activeUrls.add(url);
    }
    for (const url of this.displayedUrlByKey.values()) {
      activeUrls.add(url);
    }

    for (const [url, asset] of this.assetsCacheByUrl.entries()) {
      if (activeUrls.has(url)) {
        // still active
        this.assetTimersByUrl.set(url, now);
      } else {
        // check if enough time has passed
        const time: number = this.assetTimersByUrl.get(url) ?? 0;

        if (now - time > ASSET_EXPIRES) {
          this.clearAssetResources(asset, url);
        }
      }
    }

    this.updateStats();
  }
}
