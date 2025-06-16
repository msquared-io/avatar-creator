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

import { CatalogueBodyType, CatalogueData, CatalogueSkin } from "../CatalogueData";

























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

import idleAnimationGLB from "../assets/anim/idle.glb";

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

  private legs = false;
  private torso = false;

  private gender: CatalogueBodyType = "female";
  private skin: CatalogueSkin | null = null;

  private entity: Entity | null = null;
  private slotEntities: { [key: string]: Entity } = {};
  private animTrack: AnimTrack | null = null;
  private assetAnimIdle: Asset | null = null;

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


    this.loadAnimation();
  }

  /**
   * @private
   */
  loadAnimation() {
    const fileName = "idle.glb";

    this.assetAnimIdle = new Asset(
      fileName,
      "container",
      { url: idleAnimationGLB, filename: fileName },
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

    this.assetAnimIdle.ready(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const animResource = this.assetAnimIdle!.resource as {
        animations: Array<Asset>;
      };
      this.animTrack = animResource.animations[0].resource as AnimTrack;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.entity!.anim!.assignAnimation("idle", this.animTrack);
    });

    this.app.assets.add(this.assetAnimIdle);
    this.app.assets.load(this.assetAnimIdle);
  }

  /**
   * @param {('female'|'male')} gender Gender for the avatar
   */
  setGender(gender: CatalogueBodyType) {
    this.gender = gender;
    this.loadTorso();
    if (this.legs) this.loadLegs();
  }

  /**
   * @param {CatalogueSkin} skin A skin from the catalogue
   */
  setSkin(skin: CatalogueSkin) {
    this.skin = skin;
    this.loadTorso();
    if (this.legs) this.loadLegs();
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
    const url = `${this.data.genders[this.gender].body[item]}_${this.skin.name}.glb`;
    this.load("torso", url);
  }

  /**
   * @private
   */
  loadLegs() {
    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const legs = `${this.data.genders[this.gender].body.legs}_${this.skin.name}.glb`;
    this.load("legs", legs);
  }

  /**
   * @private
   */
  indexData() {
    const slots = ["top", "bottom"] as const;

    for (const gender in this.data.genders) {
      for (let s = 0; s < slots.length; s++) {
        const slot = slots[s];
        const section = this.data.genders[gender as CatalogueBodyType][slot];

        for (let i = 0; i < section.list.length; i++) {
          const item = section.list[i];
          const url = `${item.file}.glb`;
          this.index.set(url, item);

      }

  }

  /**
   * @param {string} slot
   * @param {string} url
   * @private
   */
  checkBodySlot(slot: string, url: string) {
    if (slot === "top") {
      if (this.index.get(url)?.torso) {
        this.torso = true;

      } else {
        this.torso = false;
      }
    } else if (slot === "bottom") {
      if (this.index.get(url)?.legs) {
        this.legs = true;
        this.loadLegs();
      } else {
        this.legs = false;
      }

  }

  /**
   * @param {string} slot
   * @param {string} url
   * @private
   */
  uncheckBodySlot(slot: string, url: string) {
    if (slot === "top") {
      if (!this.index.get(url)?.torso) {
        this.torso = false;

      }
    } else if (slot === "bottom") {
      if (!this.index.get(url)?.legs) {
        this.legs = false;
        this.unload("legs");
      }

  }

  /**
   * Loads an GLB file for provided slot.
   * If it is a first slot to be loaded, then it will use that model's skeleton for the base hierarchy
   * It will automatically hide/show different body parts, based on slot params
   *
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to load
   * @param {string} url Full url to GLB file to load for the slot
   */
  load(slot: string, url: string | null) {
    // still loading something for the slot
    if (this.loading.has(slot)) {
      const urlNext = this.next.get(slot);
      if (urlNext) this.fire(`loaded:${slot}:${urlNext}`);

      if (url !== null && this.loading.get(url) === url) {
        this.next.delete(slot);
      } else {
        this.next.set(slot, url);
        this.urls[slot] = url;
        this.fire(`loading:${slot}:${url}`);
      }
      return;


    if (url === null) {
      if (this.slotEntities[slot]) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.asset = 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.materialAssets = [];
      }

      delete this.urls[slot];

      return;


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

    this.app.assets.load(asset);
  }

  /**
   * @param {('head'|'hair'|'top'|'top:secondary'|'bottom'|"bottom:secondary"|'shoes'|'legs'|'torso')} slot Slot to unload
   */
  unload(slot: string) {
    if (this.loading.has(slot)) {
      this.next.set(slot, null);
      return;


    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.asset = 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.materialAssets = [];

    delete this.urls[slot];
  }

