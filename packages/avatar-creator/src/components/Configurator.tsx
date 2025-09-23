/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AppBase } from "playcanvas";
import * as React from "react";
import { useEffect, useState } from "react";

import { AvatarLoader } from "../scripts/avatar-loader";
import {
  Catalog,
  CatalogBasicPart,
  CatalogBodyTypeKey,
  CatalogPartKey,
  CatalogSkin,
} from "../types/Catalog";
import { DeepReadonly } from "../types/DeepReadonly";
import styles from "./Configurator.module.css";
import ConfiguratorBack from "./ConfiguratorBack";
import SectionBasic from "./SectionBasic";
import SectionBodyType from "./SectionBodyType";
import SectionButton from "./SectionButton";
import SectionSkin from "./SectionSkin";

/**
 * Given a skin based slot and model url, it will try to find the part of the desired skin.
 * If it fails to find the part it will return undefined.
 * Whilst the search could be performed without slot and bodyType they are required to reduce the complexity of the operation.
 *
 * @param slot The slot the model belongs to.
 * @param bodyType The currently selected body type.
 * @param modelUrl The modelUrl to which the skin sibling is needed.
 * @param skinName The name of the desired skin.
 * @param catalog The parts catalog to search.
 * @returns The skin sibling part or undefined if it does not exist.
 */
function findSkinSibling(
  slot: string,
  bodyType: CatalogBodyTypeKey,
  modelUrl: string,
  skinName: string,
  catalog: Catalog,
): CatalogBasicPart | undefined {
  const bodyTypeData = catalog.bodyTypes.find(({ name }) => name === bodyType);
  const slotParts = bodyTypeData?.parts[slot];
  if (!slotParts) {
    return undefined;
  }
  if (!slotParts.skin) {
    return undefined;
  }

  for (const part of slotParts.parts) {
    const modelUrls = Object.values(part).map((basicPart) => basicPart.model);
    if (modelUrls.includes(modelUrl)) {
      return part[skinName];
    }
  }
}

export default function Configurator({
  data,
  avatarLoader,
  onStateChange,
  appState,
  app,
}: {
  data: Catalog;
  avatarLoader: AvatarLoader;
  onStateChange: (state: "home" | "configurator") => void;
  appState: "home" | "configurator";
  app: AppBase;
}) {
  const [skins, setSkins] = useState<DeepReadonly<Array<CatalogSkin>>>([]);
  const [section, setSection] = useState<CatalogPartKey | "bodyType">("bodyType");
  const [sectionDropOver, setSectionDropOver] = useState<CatalogPartKey | "window" | null>(null);

  const [bodyType, setBodyType] = useState<CatalogBodyTypeKey>(
    Math.random() > 0.5 ? "bodyB" : "bodyA",
  );
  const [skin, setSkin] = useState<CatalogSkin>(
    data.skin[Math.floor(Math.random() * data.skin.length)],
  );

  // States store the model urls from the parts.
  const [head, setHead] = useState<string | null>(null);
  const [hair, setHair] = useState<string | null>(null);
  const [top, setTop] = useState<string | null>(null);
  const [topSecondary, setTopSecondary] = useState<string | null>(null);
  const [bottom, setBottom] = useState<string | null>(null);
  const [bottomSecondary, setBottomSecondary] = useState<string | null>(null);
  const [shoes, setShoes] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string | null>(null);

  const setters: Record<CatalogPartKey, (file: string | null) => void> = {
    head: setHead,
    hair: setHair,
    top: setTop,
    bottom: setBottom,
    shoes: setShoes,
    outfit: setOutfit,
  };

  const settersSecondary: Partial<Record<CatalogPartKey, (file: string | null) => void>> = {
    top: setTopSecondary,
    bottom: setBottomSecondary,
  };

  const randomAll = (exception = "") => {
    (Object.keys(setters) as CatalogPartKey[]).forEach((key) => {
      if (key === "outfit") return;
      if (key === exception) return;
      randomSlot(key);
    });
  };

  const randomSlot = (slot: CatalogPartKey) => {
    const bodyTypeData = data.bodyTypes.find(({ name }) => name === bodyType);
    const bodyPartsSection = bodyTypeData?.parts[slot];
    if (!bodyPartsSection || bodyPartsSection?.parts.length === 0) {
      setters[slot](null);
      return;
    }

    const partIndex = Math.floor(Math.random() * bodyPartsSection.parts.length);

    const part = bodyPartsSection.skin
      ? bodyPartsSection.parts[partIndex][skin.name]
      : bodyPartsSection.parts[partIndex];

    if (!part) {
      // This should only happen if there is a missing skin variant for a part.
      setters[slot](null);
    }

    setters[slot](part.model);

    if (settersSecondary[slot]) {
      settersSecondary[slot](part.secondaryModel ?? null);
    }
  };

  const slotHasItems = (bodyType: CatalogBodyTypeKey, slot: CatalogPartKey) => {
    const bodyTypeData = data.bodyTypes.find(({ name }) => name === bodyType);
    if (!bodyTypeData) {
      return false;
    }
    const slotData = bodyTypeData.parts[slot];
    return !!slotData?.parts && slotData.parts.length > 1;
  };

  useEffect(() => {
    app.fire("camera:slotFocus", section);
  }, [section]);

  useEffect(() => {
    setSkins(data.skin);

    const findDragTarget = (target: HTMLElement | null) => {
      if (target === null) return null;

      let slot: CatalogPartKey | "window" | null = "window";

      while (target) {
        const drop = target.getAttribute("data-drop") as CatalogPartKey | null;
        if (drop) {
          slot = drop;
          break;
        }
        target = target.parentElement;
      }

      return slot;
    };

    let evtDragLeaveTimeout: ReturnType<typeof setTimeout> | null;

    const evtDragLeave = (evt: DragEvent) => {
      if (
        evt.clientX <= 0 ||
        evt.clientX >= document.body.clientWidth ||
        evt.clientY <= 0 ||
        evt.clientY >= document.body.clientHeight
      ) {
        setSectionDropOver(null);
      }

      if (evtDragLeaveTimeout) {
        clearTimeout(evtDragLeaveTimeout);
        evtDragLeaveTimeout = null;
      }
      evtDragLeaveTimeout = setTimeout(() => {
        setSectionDropOver(null);
      }, 200);
    };
    const evtDragEnter = (evt: DragEvent) => {
      setSectionDropOver(findDragTarget(evt.target as HTMLElement | null));
      if (evtDragLeaveTimeout) {
        clearTimeout(evtDragLeaveTimeout);
        evtDragLeaveTimeout = null;
      }
    };
    const evtDragEnd = () => {
      setSectionDropOver(null);
    };
    const evtDragOver = (evt: DragEvent) => {
      if (evtDragLeaveTimeout) {
        clearTimeout(evtDragLeaveTimeout);
        evtDragLeaveTimeout = null;
      }
      evt.preventDefault();
    };
    const evtDrop = (evt: DragEvent) => {
      evt.preventDefault();

      const slot: CatalogPartKey | "bodyType" | "window" | null = findDragTarget(
        evt.target as HTMLElement | null,
      );

      if (evtDragLeaveTimeout) {
        clearTimeout(evtDragLeaveTimeout);
        evtDragLeaveTimeout = null;
      }
      setSectionDropOver(null);

      if (slot && slot !== "window" && evt.dataTransfer) {
        const file = evt.dataTransfer.files[0];

        if (file) {
          if (!(file.name || "").toLowerCase().endsWith(".glb")) {
            console.log("invalid file extension, should be .glb");
            return;
          }

          const obj = URL.createObjectURL(file);

          if (slot === "outfit") {
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
            for (const slot of slots) {
              avatarLoader.unload(slot);
            }

            avatarLoader.loadCustom("outfit", file.name, obj);
          } else {
            setters[slot]("");
            if (settersSecondary[slot]) settersSecondary[slot]("");
            avatarLoader.loadCustom(slot, file.name, obj);
          }
        }
      }
    };

    window.addEventListener("dragleave", evtDragLeave);
    window.addEventListener("dragenter", evtDragEnter);
    window.addEventListener("dragend", evtDragEnd);
    window.addEventListener("dragover", evtDragOver);
    window.addEventListener("drop", evtDrop);

    return () => {
      if (evtDragLeaveTimeout) {
        clearTimeout(evtDragLeaveTimeout);
        evtDragLeaveTimeout = null;
      }
      window.removeEventListener("dragleave", evtDragLeave);
      window.removeEventListener("dragenter", evtDragEnter);
      window.removeEventListener("dragend", evtDragEnd);
      window.removeEventListener("dragover", evtDragOver);
      window.removeEventListener("drop", evtDrop);
    };
  }, []);

  useEffect(() => {
    if (avatarLoader.preventRandom) {
      avatarLoader.preventRandom = false;
      return;
    }
    randomAll();
  }, [bodyType]);

  useEffect(() => {
    if (head) {
      const skinSibling = findSkinSibling("head", bodyType, head, skin.name, data);
      if (skinSibling) {
        setHead(skinSibling.model);
        return;
      }
      // If fail to find the skin sibling of the current head then select a random one.
    }
    randomSlot("head");
  }, [skin]);

  // Ensure the avatar load has the configurator initial state applied on load.
  useEffect(() => {
    avatarLoader.setSkin(skin);
    avatarLoader.setBodyType(bodyType);
    if (head) avatarLoader.load("head", head);
    if (hair) avatarLoader.load("hair", hair);
    if (top) avatarLoader.load("top", top);
    if (topSecondary) avatarLoader.load("top:secondary", topSecondary);
    if (bottom) avatarLoader.load("bottom", bottom);
    if (bottomSecondary) avatarLoader.load("bottom:secondary", bottomSecondary);
    if (shoes) avatarLoader.load("shoes", shoes);
    if (outfit) avatarLoader.load("outfit", outfit);
  }, [avatarLoader]);

  const unloadOutfit = (exception: string) => {
    if (avatarLoader.has("outfit")) {
      setOutfit(null);
      avatarLoader.unload("outfit");
      avatarLoader.legs = true;
      avatarLoader.torso = true;
      randomAll(exception);
    }
  };

  useEffect(() => {
    if (!avatarLoader) return;
    if (bodyType && (outfit || avatarLoader.has("outfit"))) unloadOutfit("bodyType");
    avatarLoader.setBodyType(bodyType);
  }, [bodyType]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (skin !== null && (outfit || avatarLoader.has("outfit"))) unloadOutfit("skin");
    avatarLoader.setSkin(skin);
  }, [skin]);

  useEffect(() => {
    if (!avatarLoader) return;
    if (head && (outfit || avatarLoader.has("outfit"))) unloadOutfit("head");
    avatarLoader.load("head", head);
  }, [head]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (hair && (outfit || avatarLoader.has("outfit"))) unloadOutfit("hair");
    avatarLoader.load("hair", hair);
  }, [hair]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (top && (outfit || avatarLoader.has("outfit"))) unloadOutfit("top");
    avatarLoader.load("top", top);
  }, [top]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (topSecondary && (outfit || avatarLoader.has("outfit"))) unloadOutfit("top:secondary");
    avatarLoader.load("top:secondary", topSecondary);
  }, [topSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (bottom && (outfit || avatarLoader.has("outfit"))) unloadOutfit("bottom");
    avatarLoader.load("bottom", bottom);
  }, [bottom]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (bottomSecondary && (outfit || avatarLoader.has("outfit"))) unloadOutfit("bottom:secondary");
    avatarLoader.load("bottom:secondary", bottomSecondary);
  }, [bottomSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (shoes && (outfit || avatarLoader.has("outfit"))) unloadOutfit("shoes");
    avatarLoader.load("shoes", shoes);
  }, [shoes]);
  useEffect(() => {
    if (!avatarLoader) return;

    if (outfit) {
      (Object.keys(setters) as CatalogPartKey[]).forEach((key) => {
        if (key === "outfit") return;
        setters[key]("");
      });

      avatarLoader.legs = false;
      avatarLoader.torso = false;

      const slots = [
        "torso",
        "legs",
        "head",
        "hair",
        "top",
        "top:secondary",
        "bottom",
        "bottom:secondary",
        "shoes",
      ];
      for (const slot of slots) avatarLoader.unload(slot);
    }

    avatarLoader.load("outfit", outfit);
  }, [outfit]);

  const configuratorClasses = [
    styles.configurator,
    appState === "configurator" ? styles.configuratorVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={configuratorClasses}>
      <ConfiguratorBack onStateChange={onStateChange} />

      <h2 className={styles.title}>Customise</h2>

      <div className={styles.main}>
        <ul
          className={styles.sections}
          onTouchMove={(evt) => {
            evt.stopPropagation();
          }}
        >
          <SectionButton
            slot="bodyType"
            setSection={setSection}
            droppable={false}
            active={section === "bodyType"}
            dropOver={sectionDropOver}
          />
          {slotHasItems(bodyType, "head") && (
            <SectionButton
              slot="head"
              setSection={setSection}
              droppable={false}
              active={section === "head"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems(bodyType, "hair") && (
            <SectionButton
              slot="hair"
              setSection={setSection}
              droppable={false}
              active={section === "hair"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems(bodyType, "top") && (
            <SectionButton
              slot="top"
              setSection={setSection}
              droppable={true}
              active={section === "top"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems(bodyType, "bottom") && (
            <SectionButton
              slot="bottom"
              setSection={setSection}
              droppable={true}
              active={section === "bottom"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems(bodyType, "shoes") && (
            <SectionButton
              slot="shoes"
              setSection={setSection}
              droppable={true}
              active={section === "shoes"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems(bodyType, "outfit") && (
            <SectionButton
              slot="outfit"
              setSection={setSection}
              droppable={true}
              active={section === "outfit"}
              dropOver={sectionDropOver}
            />
          )}
        </ul>

        <div
          className={styles.items}
          onTouchMove={(evt) => {
            evt.stopPropagation();
          }}
        >
          {section === "bodyType" && (
            <SectionBodyType
              bodyType={bodyType}
              setBodyType={(value) => {
                setBodyType(value);
              }}
              avatarLoader={avatarLoader}
            />
          )}
          {section === "bodyType" && (
            <SectionSkin
              skin={skin}
              skins={skins}
              avatarLoader={avatarLoader}
              setSkin={(value) => {
                setSkin(value);
              }}
            />
          )}
          {section === "head" && (
            <SectionBasic
              slot="head"
              title="Head"
              data={data}
              bodyType={bodyType}
              selected={head}
              skin={skin}
              avatarLoader={avatarLoader}
              setSlot={setHead}
            />
          )}
          {section === "hair" && (
            <SectionBasic
              slot="hair"
              title="Hair"
              data={data}
              bodyType={bodyType}
              selected={hair}
              avatarLoader={avatarLoader}
              setSlot={setHair}
            />
          )}
          {section === "top" && (
            <SectionBasic
              slot="top"
              title="Top"
              data={data}
              bodyType={bodyType}
              selected={top}
              avatarLoader={avatarLoader}
              setSlot={setTop}
              setSecondary={setTopSecondary}
            />
          )}
          {section === "bottom" && (
            <SectionBasic
              slot="bottom"
              title="Bottom"
              data={data}
              bodyType={bodyType}
              selected={bottom}
              avatarLoader={avatarLoader}
              setSlot={setBottom}
              setSecondary={setBottomSecondary}
            />
          )}
          {section === "shoes" && (
            <SectionBasic
              slot="shoes"
              title="Shoes"
              data={data}
              bodyType={bodyType}
              selected={shoes}
              avatarLoader={avatarLoader}
              setSlot={setShoes}
            />
          )}
          {section === "outfit" && (
            <SectionBasic
              slot="outfit"
              title="Outfit"
              data={data}
              bodyType={bodyType}
              selected={outfit}
              avatarLoader={avatarLoader}
              setSlot={setOutfit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
