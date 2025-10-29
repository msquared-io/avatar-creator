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
import { Catalog, CatalogBasicPart, CatalogBodyTypeKey, CatalogSkin } from "../types/Catalog";
import { humanFileSize } from "./utils";

/*
 * Implements loading, animating and rendering
 * based on provided GLB files for various slots
 */

/**
 * Fired when new GLB has started loading for a slot
 * The event name will contain a specific slot and url
 * @event AvatarLoader#loading:slot:url
 */

/**
 * Fired when GLB has loaded for a slot
 * The event name will contain a specific slot and url
 * @event AvatarLoader#loaded:slot:url
 * @example
 * avatarLoader.once(`loaded:head:${url}`, () => {
 *     // specific head url has loaded
 * })
 */

// supported slots
export const ALL_SLOTS = [
  "head",
  "hair",
  "top",
  "top:secondary",
  "bottom",
  "bottom:secondary",
  "shoes",
  "legs",
  "torso",
  "outfit",
];

export const ALL_SLOTS_WITHOUT_OUTFIT = [...ALL_SLOTS.filter((slot) => slot !== "outfit")];

const slotToClass = {
  "top:secondary": "topSecondary",
  "bottom:secondary": "bottomSecondary",
};

const ALL_SLOTS_CLASS_NAMES = [
  ...ALL_SLOTS.map((slot) => slotToClass[slot as keyof typeof slotToClass]),
];

const classToSlot = {
  topSecondary: "top:secondary",
  bottomSecondary: "bottom:secondary",
};

// Assets are removed from the cache after 1 seconds
const ASSET_EXPIRES = 1000;

// As we only care about Torso and Leg rendering only the top and bottom slots are indexed.
const INDEXED_SLOTS = ["top", "bottom"];

// Asset Cache Key is combination of slot and url as its possible for different slots to use the same asset.
// In this case we duplicate the caching of the same asset for simplicity.
function getAssetCacheKey(slot: string, url: string) {
  return `${slot}-${url}`;
}

export class AvatarLoader extends EventHandler {
  private assetsBySlot: { [key: string]: Asset } = {};

  private assetsCacheByCacheKey = new Map<string, Asset>();

  // Maps from an asset to which slot uses it.
  private slotByCacheKey = new Map<string, string>();

  // Maps from an asset to which url it is from.
  private urlByCacheKey = new Map<string, string>();

  // Maps from an asset to the time it was added to the cache/last used.
  private assetTimersByCacheKey = new Map<string, number>();

  public currentUrlBySlot: { [key: string]: string | null } = {};

  // Mapping of what is currently being loaded for a specific slot.
  public loadingUrlBySlot = new Map<string, string>();
  public debugAssets: boolean = false;

  // Mapping of what is the next item to load for a specific slot.
  // This is needed if something is currently loading for a slot but we want to load another item for that slot.
  // Whilst we wait for the current item to load we place the next item in the queue.
  // Once any slot finishes loading we check the queue and load the next item if there is one - if so automatically load the next item.
  private nextUrlBySlot = new Map<string, string>();

  // This is needed when reloading parts so that it is easy to check Torso and Leg rendering.
  // As we only care about Torso and Leg rendering only the top and bottom slots are indexed.
  private slotModelUrlToPart = new Map<string, CatalogBasicPart>();

  preventRandom: boolean = false;
  torso = true;
  legs = true;

  private bodyType: CatalogBodyTypeKey = "bodyB";
  private skin: CatalogSkin | null = null;

  private entity: Entity | null = null;
  private slotEntities: { [key: string]: Entity } = {};
  private animTrack: AnimTrack | null = null;

  private animGraphData: AnimGraphData = generateDefaultAnimGraph();

  /**
   * @param {AppBase} app PlayCanvas AppBase
   * @param {Object} data Data that contains all urls for slots, with their related flags (e.g. if slot should also show a torso or legs)
   */
  constructor(
    public app: AppBase,
    public data: Catalog,
    public animations: AnimationData,
  ) {
    super();

    this.app.on("update", this.checkAssetsCache, this);

    this.createIndexedSlotModelUrlToPartMap();
  }

  /**
   * @param {Asset} asset
   * @private
   */
  createRootEntity(asset: Asset) {
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

    for (let i = 0; i < ALL_SLOTS.length; i++) {
      const entity = new Entity(ALL_SLOTS[i]);
      this.slotEntities[ALL_SLOTS[i]] = entity;
      entity.addComponent("render", {
        type: "asset",
        rootBone: this.entity,
      });
      this.entity.addChild(entity);
    }

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

  has(slot: string) {
    return !!this.currentUrlBySlot[slot];
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
   * @param {('bodyB'|'bodyA')} bodyType BodyType for the avatar
   * @param {boolean} [event] If true, then event will be fired for syncing UI state
   */
  setBodyType(bodyType: CatalogBodyTypeKey, event: boolean = false) {
    this.bodyType = bodyType;
    this.loadTorso();
    if (this.legs) this.loadLegs();
    if (event) this.fire(`slot:bodyType`, this.bodyType);
  }

  /**
   * @returns {('bodyB'|'bodyA')}
   */
  getBodyType(): "bodyB" | "bodyA" {
    return this.bodyType;
  }

  /**
   * @param {CatalogueSkin} skin A skin from the catalogue
   * @param {boolean} [event] If true, then event will be fired for syncing UI state
   */
  setSkin(skin: CatalogSkin, event: boolean = false) {
    this.skin = skin;
    this.loadTorso();
    if (this.legs) this.loadLegs();
    if (event) this.fire(`slot:skin`, this.skin);
  }

  /**
   * @returns {CatalogueSkin|null}
   */
  getSkin(): CatalogSkin | null {
    return this.skin;
  }

  /**
   * @private
   * Loads either the TorsoArms or Arms body part dependent on if the Arms flag is true.
   * This body part is skin dependent therefore calling this without the skin set throws and error.
   */
  loadTorso() {
    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const item = this.torso ? "torsoArms" : "arms";
    const bodyTypeData = this.data.bodyTypes.find((bodyType) => this.bodyType === bodyType.name);
    if (!bodyTypeData) {
      throw new Error("Could not find body type");
    }
    const url = bodyTypeData.body[item][this.skin.name].model;
    this.load("torso", url);
  }

  /**
   * @private
   * Loads the Legs body part.
   * This body part is skin dependent therefore calling this without the skin set throws and error.
   */
  loadLegs() {
    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const bodyTypeData = this.data.bodyTypes.find((bodyType) => this.bodyType === bodyType.name);
    if (!bodyTypeData) {
      throw new Error("Could not find body type");
    }
    const legs = bodyTypeData.body.legs[this.skin.name].model;
    this.load("legs", legs);
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
   * Applies GLB container renders and materials to a slot, including additional render entities and emissive patching.
   */
  private applyContainerToSlot(slot: string, container: GlbContainerResource): void {
    // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.asset = container.renders[0];

    if (container.renders.length > 1) {
      for (let i = 1; i < container.renders.length; i++) {
        const entity = new Entity(`${slot}-${i}`);
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

        this.slotEntities[slot].addChild(entity);
      }
    }

    // The Asset from GlbContainerResource import misaligns with the "playcanvas" import.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.materialAssets = container.materials as unknown as Asset[];

    const meshInstances = this.slotEntities[slot].render?.meshInstances;
    if (meshInstances) {
      this.patchEmissiveColor(meshInstances);
    }
  }

  /**
   * @private
   * Iterates through the INDEXED_SLOTS to create a mapping from model to the part
   * This is important for reloading models so from the top/bottom parts GLB we can easily look up the requirements for rendering Torso and Legs
   * This only needs to be ran when the catalog changes - i.e. on initialization
   */
  createIndexedSlotModelUrlToPartMap() {
    for (const bodyType of this.data.bodyTypes) {
      for (const slot of INDEXED_SLOTS) {
        const section = bodyType.parts[slot];

        if (section.skin) {
          throw new Error("Did not expect to index skinned parts");
        }

        for (const part of section.parts) {
          this.slotModelUrlToPart.set(`${slot}-${part.model}`, part);
        }
      }
    }
  }

  /**
   * Determines whether to show default body parts (torso/legs) when equipping clothing items.
   *
   * For "top" slot: Shows torso if no item is equipped or torso flag is true.
   * Hides torso if an item is equipped and and torso flag is not true.
   *
   * For "bottom" slot: Shows legs if no item is equipped or if the item requires legs to be visible.
   * Hides legs if the item completely covers them i.e. an item is equipped and the legs flag is false.
   *
   * @param {string} slot - The clothing slot
   * @param {string | null} url - The URL of the clothing item being equipped, or null if no item
   * @private
   */
  checkBodySlot(slot: string, url: string | null) {
    if (slot === "top") {
      if (!this.currentUrlBySlot[slot]) {
        this.torso = true;
        this.loadTorso();
      } else if (!url || this.slotModelUrlToPart.get(`${slot}-${url}`)?.torso) {
        this.torso = true;
        this.loadTorso();
      } else {
        this.torso = false;
        this.loadTorso();
      }
    } else if (slot === "bottom") {
      if (!this.currentUrlBySlot[slot]) {
        this.legs = true;
        this.loadLegs();
      } else if (!url || this.slotModelUrlToPart.get(`${slot}-${url}`)?.legs) {
        this.legs = true;
        this.loadLegs();
      } else {
        this.legs = false;
        this.unload("legs");
      }
    }
  }

  /**
   * Determines whether to hide default body parts when removing clothing items.
   *
   * Called when unloading a clothing item to check if the underlying body part should
   * now be hidden. This happens when the removed item didn't cover the body part,
   * but there's still another item in the slot that might not need the body part visible.
   *
   * For "top" slot: If the removed item didn't cover the torso and there's still a top item,
   * hides the torso and shows only arms.
   *
   * For "bottom" slot: If the removed item didn't require legs to be hidden and there's
   * still a bottom item, hides the legs.
   *
   * @param {string} slot - The clothing slot ("top" or "bottom")
   * @param {string} url - The URL of the clothing item being removed
   * @private
   */
  uncheckBodySlot(slot: string, url: string) {
    if (slot === "top") {
      const partInfo = this.slotModelUrlToPart.get(`${slot}-${url}`);
      const hasCurrentUrl = !!this.currentUrlBySlot[slot];

      if (!partInfo?.torso && hasCurrentUrl) {
        this.torso = false;
        this.loadTorso();
      }
    } else if (slot === "bottom") {
      const partInfo = this.slotModelUrlToPart.get(`${slot}-${url}`);
      const hasCurrentUrl = !!this.currentUrlBySlot[slot];

      if (!partInfo?.legs && hasCurrentUrl) {
        this.legs = false;
        this.unload("legs");
      }
    }
  }

  /**
   * Loads an GLB file for provided slot.
   * If it is a first slot to be loaded, then it will use that model's skeleton for the base hierarchy
   * It will automatically hide/show different body parts, based on slot params
   *
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso'|'outfit')} slot Slot to load
   * @param {string} url Full url to GLB file to load for the slot
   */
  load(slot: string, url: string) {
    // Check if something is still being loaded for this slot.
    // If so we cannot load another item for this slot until the current item has loaded.
    // Therefore we set the next, overriding the existing value if there is one as we no longer need to load that one.
    if (this.loadingUrlBySlot.has(slot)) {
      const urlNext = this.nextUrlBySlot.get(slot);
      // If something is already in the next queue we fire an event before clearing it so that it no longer has the loading state.
      if (urlNext) {
        this.fire(`loaded:${slot}:${urlNext}`);
      }

      this.nextUrlBySlot.set(slot, url);
      this.currentUrlBySlot[slot] = url;
      this.fire(`loading:${slot}:${url}`);

      // Return here - once the current asset is loaded the newly set one above will be handled.
      return;
    }

    this.fire(`loading:${slot}:${url}`);

    const name = url.split("/").pop();
    if (!name) {
      throw new Error("Could not get name from URL");
    }

    const cacheKey = getAssetCacheKey(slot, url);
    let asset = this.assetsCacheByCacheKey.get(cacheKey);
    if (!asset) {
      asset = new Asset(cacheKey, "container", {
        url,
        filename: name,
        // Have to specify our own hash here because if there is one part used in multiple slots when the cached assets are cleaned up then it causes the internal textures of the model to be cleaned up.
        // e.g. given top model.glb and top:secondary model.glb both may load the same asset.
        // This asset internally may load some textures etc.
        // The play canvas registry I think shares these textures if the hashes match.
        // Therefore if we don't specify our own hash then the internal textures will be cleaned up when the first asset is unloaded.
        hash: cacheKey,
      }); // maybe issue with unloading is due to asset name - possibly could combine with slot?
      this.app.assets.add(asset);
      this.assetsCacheByCacheKey.set(cacheKey, asset);
      this.assetTimersByCacheKey.set(cacheKey, performance.now());
      this.slotByCacheKey.set(cacheKey, slot);
      this.urlByCacheKey.set(cacheKey, url);
    }

    this.loadingUrlBySlot.set(slot, url);

    this.currentUrlBySlot[slot] = url;

    this.checkBodySlot(slot, url);

    asset.ready(() => {
      this.loadingUrlBySlot.delete(slot);
      // Fire events so that both the slot item and the configurator can be updated.
      this.fire(`loaded:${slot}:${url}`);
      this.fire(`loaded:${slot}`, url);

      this.createRootEntity(asset);

      this.assetsBySlot[slot] = asset;

      const container = asset.resource as GlbContainerResource;
      this.applyContainerToSlot(slot, container);

      this.uncheckBodySlot(slot, url);

      // load next in queue
      const urlNext = this.nextUrlBySlot.get(slot);
      if (urlNext) {
        this.nextUrlBySlot.delete(slot);
        this.load(slot, urlNext);
      }
      this.updateStats();
    });

    asset.once("error", () => {
      this.loadingUrlBySlot.delete(slot);
      this.fire(`loaded:${slot}:${url}`);

      // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = null;
      // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = [];

      this.uncheckBodySlot(slot, url);

      // load next in queue
      const urlNext = this.nextUrlBySlot.get(slot);
      if (urlNext) {
        this.nextUrlBySlot.delete(slot);
        this.load(slot, urlNext);
      }
    });

    this.app.assets.load(asset, { force: true });
  }

  /**
   * Loads an GLB file from ObjectURL for provided slot.
   *
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso'|'outfit')} slot Slot to load
   * @param {string} url filename of GLB file to load for the slot
   * @param {string} objectUrl base64 string containing GLB file providede by URL.createObjectURL from local file
   */
  loadCustom(slot: string, url: string, objectUrl: string) {
    if (this.loadingUrlBySlot.has(slot)) {
      return;
    }

    this.fire(`loading:${slot}:${url}`);
    this.loadingUrlBySlot.set(slot, url);

    if (slot === "top") {
      this.torso = true;
      this.loadTorso();
    } else if (slot === "bottom") {
      this.legs = true;
      this.loadLegs();
    }

    // load file using ObjectURL
    this.app.assets.loadFromUrl(objectUrl, "container", (err, asset) => {
      if (err) {
        console.log(err);
        return;
      }

      if (!asset) return;

      this.currentUrlBySlot[slot] = url;

      this.loadingUrlBySlot.delete(slot);
      this.fire(`loaded:${slot}:${url}`);

      this.assetsBySlot[slot] = asset;

      const container = asset.resource as GlbContainerResource;
      this.applyContainerToSlot(slot, container);
    });
  }

  /**
   * Get the avatar MML code for the current avatar
   * @param {boolean} formatted Whether to format the MML code
   * @returns {string} the MML code for the current avatar
   */
  getAvatarMml(formatted: boolean = false) {
    let code = "";

    const outfit = this.currentUrlBySlot.outfit ?? "";
    const className = outfit
      ? "outfit"
      : [this.getBodyType(), `skin${this.getSkin()?.name ?? ""}`].join(" ");

    code += `<m-character class="${className}" src="${encodeURI(outfit || (this.currentUrlBySlot.torso ?? ""))}">${formatted ? "\n" : ""}`;

    for (const key in this.currentUrlBySlot) {
      if (key === "torso" || key === "outfit") continue;
      const url = this.currentUrlBySlot[key];
      if (!url) continue;
      const className = key in slotToClass ? slotToClass[key as keyof typeof slotToClass] : key;
      code += `${formatted ? "\t" : ""}<m-model class="${className}" src="${encodeURI(url)}"></m-model>${formatted ? "\n" : ""}`;
    }

    code += `</m-character>`;

    return code;
  }

  /**
   * Loads an avatar from an MML code
   * @param {string} code The MML code to load
   */
  loadAvatarMml(code: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");
    const rootNode = doc.body;

    const character = rootNode.querySelector("m-character");
    if (!character) {
      console.log("character not found");
      return;
    }

    const classItems = Array.from(character.classList);
    const outfit = classItems.includes("outfit");

    if (outfit) {
      const ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT = ALL_SLOTS_CLASS_NAMES.filter(
        (slot) => slot !== "outfit",
      );

      this.torso = false;
      this.legs = false;

      // Unload all slots except outfit
      for (let i = 0; i < ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT.length; i++) {
        const slot = ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT[i];
        const slotName = slot in classToSlot ? classToSlot[slot as keyof typeof classToSlot] : slot;
        this.unload(slotName);
      }

      // Load the outfit
      const src = character.getAttribute("src");
      if (src) {
        this.load("outfit", src);
      }
    } else {
      // body type
      const bodyTypes = new Set(["bodyA", "bodyB"]);
      const bodyType =
        classItems.filter((item) => {
          return bodyTypes.has(item);
        })?.[0] ?? "bodyA";
      this.setBodyType(bodyType as CatalogBodyTypeKey, true);

      // skin
      classItems.forEach((item) => {
        if (!item.startsWith("skin")) return;

        const skinIndex = parseInt(item.slice(4), 10);
        if (isNaN(skinIndex)) return;

        const skinName = (skinIndex + "").padStart(2, "0");

        this.setSkin({ name: skinName }, true);
      });

      // Load torso
      const torsoSrc = character.getAttribute("src");
      if (torsoSrc) {
        this.load("torso", torsoSrc);
      }

      const ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT_AND_TORSO = ALL_SLOTS_CLASS_NAMES.filter(
        (slot) => slot !== "outfit" && slot !== "torso",
      );

      for (let i = 0; i < ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT_AND_TORSO.length; i++) {
        const slot = ALL_SLOTS_CLASS_NAMES_WITHOUT_OUTFIT_AND_TORSO[i];
        const slotName = slot in classToSlot ? classToSlot[slot as keyof typeof classToSlot] : slot;
        const node = character.querySelector(`m-model.${slot}`);
        const src = node?.getAttribute("src");

        if (!src) {
          this.unload(slotName);
          continue;
        }

        if (slot === "legs") {
          this.legs = true;
        }

        this.load(slotName, src);
      }
    }
  }

  /**
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to unload
   */
  unload(slot: string) {
    // Check if the slot is currently loading something
    const isLoading = this.loadingUrlBySlot.has(slot);

    // If the slot is currently loading, we need to clear the loading state
    if (isLoading) {
      const nextUrl = this.nextUrlBySlot.get(slot);

      // Fire the loaded event to clear the loading state
      if (nextUrl) {
        this.fire(`loaded:${slot}:${nextUrl}`);
        this.nextUrlBySlot.delete(slot);
      }

      return;
    }

    // If we have a slot entity, clear its assets
    if (this.slotEntities[slot]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = 0;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = [];
    }

    // Remove the URL from currentUrlBySlot
    delete this.currentUrlBySlot[slot];
  }

  /**
   * Updates the stats for stored assets
   * This is only used for debugging and displayed when the debugAssets flag is true
   */
  updateStats() {
    if (!this.debugAssets) return;

    this.fire(
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
   */
  clearAssetResources(asset: Asset, slot: string, url: string) {
    const cacheKey = getAssetCacheKey(slot, url);
    this.app.assets.remove(asset);
    asset.unload();

    this.assetsCacheByCacheKey.delete(cacheKey);
    this.assetTimersByCacheKey.delete(cacheKey);
    this.urlByCacheKey.delete(cacheKey);
    this.slotByCacheKey.delete(cacheKey);
  }

  /**
   * Called on update from playcanvas
   * Clears any assets that have not been used within the expire time
   * Resets the expiry time for assets currently still active
   */
  checkAssetsCache() {
    const now: number = performance.now();

    for (const [cacheKey, asset] of this.assetsCacheByCacheKey.entries()) {
      // Set a limit of 1 so that we only split on the first occurrence of the hyphen between slot and url.
      // This avoids accidentally splitting when the url contains a hyphen.
      const [slot, url] = cacheKey.split("-", 1);

      if (this.currentUrlBySlot[slot] === url || this.nextUrlBySlot.get(slot) === url) {
        // still active
        this.assetTimersByCacheKey.set(cacheKey, now);
      } else {
        // check if enough time has passed
        const time: number = this.assetTimersByCacheKey.get(cacheKey) ?? 0;

        if (now - time > ASSET_EXPIRES) {
          this.clearAssetResources(asset, slot, url);
        }
      }
    }

    this.updateStats();
  }
}
