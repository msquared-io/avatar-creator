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
} from "playcanvas";
import type { GlbContainerResource } from "playcanvas/build/playcanvas/src/framework/parsers/glb-container-resource";

import animGraphData from "../assets/anim-graph.json";
import { CatalogueBodyType, CatalogueData, CatalogueSkin } from "../CatalogueData";

/*

    Implements loading, animating and rendering
    based on provided GLB files for various slots

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
const slots = [
  "head",
  "hair",
  "top",
  "top:secondary",
  "bottom",
  "bottom:secondary",
  "shoes",
  "legs",
  "torso",
];

export class AvatarLoader extends EventHandler {
  private rootAsset: Asset | null = null;
  private assets: { [key: string]: Asset } = {};
  private entities = {};

  public urls: { [key: string]: string | null } = {};
  public loading = new Map<string, string>();

  private next = new Map<string, string | null>();
  private index = new Map<
    string,
    {
      file: string;
      secondary?: string;
      torso?: boolean;
      legs?: boolean;
    }
  >();

  legs = true;
  preventRandom: boolean = false;
  private torso = true;

  private bodyType: CatalogueBodyType = "bodyB";
  private skin: CatalogueSkin | null = null;

  private entity: Entity | null = null;
  private slotEntities: { [key: string]: Entity } = {};
  private animTrack: AnimTrack | null = null;

  /**
   * @param {AppBase} app PlayCanvas AppBase
   * @param {Object} data Data that contains all urls for slots, with their related flags (e.g. if slot should also show a torso or legs)
   */
  constructor(
    public app: AppBase,
    public data: CatalogueData,
  ) {
    super();

    this.indexData();
  }

  /**
   * @param {Asset} asset
   * @private
   */
  createRootEntity(asset: Asset) {
    if (this.entity) return;

    this.rootAsset = asset;

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

    for (let i = 0; i < slots.length; i++) {
      const entity = new Entity(slots[i]);
      this.slotEntities[slots[i]] = entity;
      entity.addComponent("render", {
        type: "asset",
        rootBone: this.entity,
      });
      this.entity.addChild(entity);
    }

    // list of animations
    const animations = [
      ["appear", "spawn_and_wave.glb"],
      ["clap", "clap.glb"],
      ["wave", "pick_me.glb"],
      ["thumbsDown", "thumbs_down.glb"],
      ["thumbsUp", "thumbs_up.glb"],
    ];

    // add animation data to anim-graph
    for (const item of animations) {
      const layer = animGraphData.layers[0];
      const name = item[0];

      // state
      layer.states.push({
        name,
        speed: 1,
        loop: false,
        defaultState: false,
      });

      // transition in
      layer.transitions.push({
        from: "ANY",
        to: name,
        exitTime: 0,
        time: 0.1,
        interruptionSource: "NONE",
        edgeType: 1,
        conditions: [
          {
            parameterName: name,
            predicate: "EQUAL_TO",
            value: true,
          },
        ],
      });

      // transition out
      layer.transitions.push({
        from: name,
        to: "Idle",
        exitTime: 0.9,
        interruptionSource: "NONE",
        edgeType: 1,
        conditions: {},
        time: 0.1,
      });

      // trigger
      animGraphData.parameters[name] = {
        name,
        type: "TRIGGER",
        value: false,
      };
    }

    // load anim-graph
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    entity.anim!.loadStateGraph(animGraphData);

    // load default idle animation
    this.loadAnimation("Idle", "idle.glb");

    // load additional animations
    for (const item of animations) this.loadAnimation(item[0], item[1]);

    // trigger "appear" animation by default
    entity.anim?.setTrigger("appear");

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
  loadAnimation(name: string, fileName: string) {
    const asset: Asset = new Asset(
      fileName,
      "container",
      { url: `/anim/${fileName}`, filename: fileName },
      undefined,
      {
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
      } as any,
    );

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
  setBodyType(bodyType: CatalogueBodyType, event: boolean = false) {
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
  setSkin(skin: CatalogueSkin, event: boolean = false) {
    this.skin = skin;
    this.loadTorso();
    if (this.legs) this.loadLegs();
    if (event) this.fire(`slot:skin`, this.skin);
  }

  /**
   * @returns {CatalogueSkin|null}
   */
  getSkin(): CatalogueSkin | null {
    return this.skin;
  }

  /**
   * Modify URL with specific skin index
   * @param {string} url Url
   * @param {CatalogueSkin} skin A skin from the catalogue
   * @returns {string}
   */
  getSkinBasedUrl(url: string, skin: CatalogueSkin) {
    let urlNew = url;
    if (/_[0-9]{2}$/.test(urlNew)) {
      urlNew = urlNew.replace(/_[0-9]{2}$/, "");
    }
    urlNew += "_" + skin.name;
    return urlNew;
  }

  /**
   * @private
   */
  loadTorso() {
    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const item = this.torso ? "torsoArms" : "arms";
    const url = `${this.data.bodyTypes[this.bodyType].body[item]}_${this.skin.name}.glb`;
    this.load("torso", url);
  }

  /**
   * @private
   */
  loadLegs() {
    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const legs = `${this.data.bodyTypes[this.bodyType].body.legs}_${this.skin.name}.glb`;
    this.load("legs", legs);
  }

  /**
   * @private
   */
  indexData() {
    const slots = ["top", "bottom"] as const;

    for (const bodyType in this.data.bodyTypes) {
      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s];
        const section = this.data.bodyTypes[bodyType as CatalogueBodyType][slot];

        for (let i = 0; i < section.list.length; i++) {
          const item = section.list[i];
          const url = `${item.file}.glb`;
          this.index.set(url, item);
        }
      }
    }
  }

  /**
   * @param {string} slot
   * @param {string} url
   * @private
   */
  checkBodySlot(slot: string, url: string) {
    if (slot === "top") {
      if (!this.urls[slot]) {
        this.torso = true;
        this.loadTorso();
      } else if (this.index.get(url)?.torso) {
        this.torso = true;
        this.loadTorso();
      } else {
        this.torso = false;
      }
    } else if (slot === "bottom") {
      if (!this.urls[slot]) {
        this.legs = true;
        this.loadLegs();
      } else if (this.index.get(url)?.legs) {
        this.legs = true;
        this.loadLegs();
      } else {
        this.legs = false;
      }
    }
  }

  /**
   * @param {string} slot
   * @param {string} url
   * @private
   */
  uncheckBodySlot(slot: string, url: string) {
    if (slot === "top") {
      if (!this.index.get(url)?.torso && this.urls[slot]) {
        this.torso = false;
        this.loadTorso();
      }
    } else if (slot === "bottom") {
      if (!this.index.get(url)?.legs && this.urls[slot]) {
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
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to load
   * @param {string} url Full url to GLB file to load for the slot
   * @param {boolean} [event] If true, then event will be fired for syncing UI state
   */
  load(slot: string, url: string | null, event: boolean = false) {
    // still loading something for the slot
    if (this.loading.has(slot)) {
      const urlNext = this.next.get(slot);
      if (urlNext) this.fire(`loaded:${slot}:${urlNext}`);

      if (url !== null && this.loading.get(url) === url) {
        this.next.delete(slot);
      } else {
        if (url) this.next.set(slot, url);
        this.urls[slot] = url;
        this.fire(`loading:${slot}:${url}`);
      }
      return;
    }

    if (url === null) {
      if (this.slotEntities[slot]) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.asset = 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.materialAssets = [];
      }

      delete this.urls[slot];
      return;
    }

    this.fire(`loading:${slot}:${url}`);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const name = url.split("/").pop()!;
    const asset = new Asset(name, "container", { url, filename: name });
    this.loading.set(slot, url);
    this.app.assets.add(asset);

    this.urls[slot] = url;

    this.checkBodySlot(slot, url);

    asset.ready(() => {
      this.loading.delete(slot);
      this.fire(`loaded:${slot}:${url}`);

      if (event) {
        this.fire(`slot:${slot}`, url);
        if (slot.includes(":secondary")) {
          this.fire(`slot:secondary`, slot, url);
        } else {
          this.fire(`slot:basic`, slot, url);
        }
      }

      this.createRootEntity(asset);

      // if (this.assets[slot] && this.rootAsset !== this.assets[slot]) {
      //     this.assets[slot].unload();
      //     this.app.assets.remove(this.assets[slot]);
      // }

      this.assets[slot] = asset;

      const container = this.assets[slot].resource as GlbContainerResource;

      // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = container.renders[0];
      // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = container.materials as unknown as Asset[];

      this.uncheckBodySlot(slot, url);

      // load next in queue
      if (this.next.has(slot)) {
        const urlNext = this.next.get(slot);
        this.next.delete(slot);
        if (urlNext) {
          this.load(slot, urlNext);
        } else {
          this.unload(slot);
        }
      }
    });

    asset.once("error", () => {
      this.loading.delete(slot);
      this.fire(`loaded:${slot}:${url}`);

      this.assets[slot] = asset;

      // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = null;
      // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = [];

      this.uncheckBodySlot(slot, url);

      // load next in queue
      if (this.next.has(slot)) {
        const urlNext = this.next.get(slot);
        this.next.delete(slot);
        if (urlNext) {
          this.load(slot, urlNext);
        } else {
          this.unload(slot);
        }
      }
    });

    this.app.assets.load(asset);
  }

  /**
   * Loads an GLB file from ObjectURL for provided slot.
   *
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to load
   * @param {string} url filename of GLB file to load for the slot
   * @param {string} objectUrl base64 string containing GLB file providede by URL.createObjectURL from local file
   */
  loadCustom(slot: string, url: string, objectUrl: string) {
    if (this.loading.has(slot)) {
      return;
    }

    this.fire(`loading:${slot}:${url}`);
    this.loading.set(slot, url);

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

      this.urls[slot] = url;

      this.loading.delete(slot);
      this.fire(`loaded:${slot}:${url}`);

      this.assets[slot] = asset;

      const container = this.assets[slot].resource as GlbContainerResource;

      // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = container.renders[0];
      // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = container.materials as unknown as Asset[];
    });
  }

  /**
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to unload
   */
  unload(slot: string) {
    if (this.loading.has(slot)) {
      this.next.set(slot, null);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.asset = 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.materialAssets = [];

    delete this.urls[slot];
  }
}
