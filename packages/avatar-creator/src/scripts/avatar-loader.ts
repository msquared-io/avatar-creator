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


   * @param {AppBase} app PlayCanvas AppBase


  constructor(
    public app: AppBase,
    public data: CatalogueData,
  ) {









  createRootEntity(asset: Asset) {




    const entity = (asset.resource as ContainerResource).instantiateRenderEntity();
    this.entity = entity;





    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    entity.anim!.rootBone = entity;


    entity.setLocalPosition(0, 0.08, 0);

    this.app.root.addChild(entity);

    entity.forEach((ent: GraphNode) => {
      if (ent instanceof Entity) {
        ent.removeComponent("render");
      }





















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

      } as any,
    );


      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const animResource = this.assetAnimIdle!.resource as {
        animations: Array<Asset>;
      };
      this.animTrack = animResource.animations[0].resource as AnimTrack;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.entity!.anim!.assignAnimation("idle", this.animTrack);









  setGender(gender: CatalogueBodyType) {






   * @param {CatalogueSkin} skin A skin from the catalogue

  setSkin(skin: CatalogueSkin) {








   * @param {CatalogueSkin} skin A skin from the catalogue


  getSkinBasedUrl(url: string, skin: CatalogueSkin) {

    if (/_[0-9]{2}$/.test(urlNew)) {
      urlNew = urlNew.replace(/_[0-9]{2}$/, "");
    }
    urlNew += "_" + skin.name;







    if (!this.skin) {
      throw new Error("Skin is not set");
    }

    const url = `${this.data.genders[this.gender].body[item]}_${this.skin.name}.glb`;







    if (!this.skin) {
      throw new Error("Skin is not set");
    }
    const legs = `${this.data.genders[this.gender].body.legs}_${this.skin.name}.glb`;







    const slots = ["top", "bottom"] as const;

    for (const gender in this.data.genders) {


        const section = this.data.genders[gender as CatalogueBodyType][slot];















  checkBodySlot(slot: string, url: string) {






















  uncheckBodySlot(slot: string, url: string) {





















  load(slot: string, url: string | null) {





      if (url !== null && this.loading.get(url) === url) {











        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.asset = 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.slotEntities[slot].render!.materialAssets = [];









    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const name = url.split("/").pop()!;





















      const container = this.assets[slot].resource as GlbContainerResource;

      // @ts-expect-error - PlayCanvas types specify only a number is accepted, but the comment and implementation allow Asset
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.asset = container.renders[0];
      // The Asset from GlbContainerResource import misaligns with the "playcanvas" import
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.slotEntities[slot].render!.materialAssets = container.materials as unknown as Asset[];





















  unload(slot: string) {





    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.asset = 0;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.slotEntities[slot].render!.materialAssets = [];




