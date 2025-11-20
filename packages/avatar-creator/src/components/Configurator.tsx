/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { AppBase } from "playcanvas";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AvatarState, AvatarStateManager } from "../scripts/avatar-state-manager";
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
  stateManager,
  onStateChange,
  onImportMmlCallback,
  appState,
  app,
}: {
  data: Catalog;
  stateManager: AvatarStateManager;
  onStateChange: (state: "home" | "configurator") => void;
  onImportMmlCallback?: (callback: (state: Partial<AvatarState>) => void) => void;
  appState: "home" | "configurator";
  app: AppBase;
}) {
  const [skins, setSkins] = useState<DeepReadonly<Array<CatalogSkin>>>([]);
  const [section, setSection] = useState<CatalogPartKey | "bodyType">("bodyType");
  const [sectionDropOver, setSectionDropOver] = useState<
    CatalogPartKey | "bodyType" | "window" | null
  >(null);

  const [bodyType, setBodyType] = useState<CatalogBodyTypeKey>(
    Math.random() > 0.5 ? "bodyB" : "bodyA",
  );
  const [skin, setSkin] = useState<CatalogSkin>(
    data.skin[Math.floor(Math.random() * data.skin.length)],
  );

  const [head, setHead] = useState<string | null>(null);
  const [hair, setHair] = useState<string | null>(null);
  const [top, setTop] = useState<string | null>(null);
  const [topSecondary, setTopSecondary] = useState<string | null>(null);
  const [bottom, setBottom] = useState<string | null>(null);
  const [bottomSecondary, setBottomSecondary] = useState<string | null>(null);
  const [shoes, setShoes] = useState<string | null>(null);
  const [outfit, setOutfit] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const isImportingRef = useRef(false);

  const setters: Record<CatalogPartKey, (file: string | null) => void> = {
    head: setHead,
    hair: setHair,
    top: setTop,
    bottom: setBottom,
    shoes: setShoes,
    outfit: setOutfit,
  };

  // Create a handler that updates React state when MML is imported
  const handleImportMml = useCallback((state: Partial<AvatarState>) => {
    // Set flag to prevent useEffects from randomizing during import
    isImportingRef.current = true;

    // Update all the React state based on imported MML
    if (state.bodyType !== undefined) setBodyType(state.bodyType);
    if (state.skin !== undefined) setSkin(state.skin);
    if (state.head !== undefined) setHead(state.head);
    if (state.hair !== undefined) setHair(state.hair);
    if (state.top !== undefined) setTop(state.top);
    if (state.topSecondary !== undefined) setTopSecondary(state.topSecondary);
    if (state.bottom !== undefined) setBottom(state.bottom);
    if (state.bottomSecondary !== undefined) setBottomSecondary(state.bottomSecondary);
    if (state.shoes !== undefined) setShoes(state.shoes);
    if (state.outfit !== undefined) setOutfit(state.outfit);

    // Clear flag after a delay to ensure all state updates have propagated
    setTimeout(() => {
      isImportingRef.current = false;
    }, 100);
  }, []);

  // Expose import callback to parent components
  useEffect(() => {
    if (onImportMmlCallback) {
      onImportMmlCallback(handleImportMml);
    }
  }, [onImportMmlCallback, handleImportMml]);

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
      setters[slot](null);
      return;
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
    if (slot === "outfit") {
      // For outfits we show if there are any parts, not more than one, because we do not assume it will be selected automatically.
      return !!bodyTypeData.parts[slot] && bodyTypeData.parts[slot].parts.length > 0;
    }
    const slotData = bodyTypeData.parts[slot];
    return !!slotData?.parts && slotData.parts.length > 1;
  };

  useEffect(() => {
    app.fire("camera:slotFocus", section);
  }, [section]);

  useEffect(() => {
    setSkins(data.skin);

    const findDragTarget = (
      target: HTMLElement | null,
    ): CatalogPartKey | "bodyType" | "window" | null => {
      if (target === null) return null;

      let slot: CatalogPartKey | "bodyType" | "window" | null = "window";

      while (target) {
        const drop = target.getAttribute("data-drop") as CatalogPartKey | "bodyType" | null;
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

      if (!slot || slot === "window" || slot === "bodyType") {
        return;
      }

      if (evt.dataTransfer) {
        const file = evt.dataTransfer.files[0];

        if (file) {
          if (!(file.name || "").toLowerCase().endsWith(".glb")) {
            console.log("invalid file extension, should be .glb");
            return;
          }

          const obj = URL.createObjectURL(file);

          if (slot === "outfit") {
            setOutfit(obj);
            setHead(null);
            setHair(null);
            setTop(null);
            setTopSecondary(null);
            setBottom(null);
            setBottomSecondary(null);
            setShoes(null);
          } else {
            setters[slot](obj);
            if (settersSecondary[slot]) settersSecondary[slot](null);
          }

          stateManager.loadCustom(slot, file.name, obj);
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
    if (initializedRef.current && !isImportingRef.current) {
      randomAll();
    }
  }, [bodyType]);

  useEffect(() => {
    if (outfit) {
      return;
    }
    if (isImportingRef.current) {
      return;
    }
    if (head) {
      const skinSibling = findSkinSibling("head", bodyType, head, skin.name, data);
      if (skinSibling) {
        setHead(skinSibling.model);
        return;
      }
    }
    if (initializedRef.current) {
      randomSlot("head");
    }
  }, [skin, outfit]);

  // Initialize with random parts on mount
  useEffect(() => {
    randomAll();
    initializedRef.current = true;
  }, []);

  // Sync all state changes to the state manager (complete state every time)
  useEffect(() => {
    if (!initializedRef.current) return;

    stateManager.updateState({
      bodyType,
      skin,
      head,
      hair,
      top,
      topSecondary,
      bottom,
      bottomSecondary,
      shoes,
      outfit,
    });
  }, [bodyType, skin, head, hair, top, topSecondary, bottom, bottomSecondary, shoes, outfit]);

  // Handle outfit mode transitions
  useEffect(() => {
    if (!initializedRef.current) return;
    if (isImportingRef.current) return;

    if (outfit) {
      // Clear other slots when entering outfit mode
      (Object.keys(setters) as CatalogPartKey[]).forEach((key) => {
        if (key === "outfit") return;
        setters[key](null);
      });
    }
  }, [outfit]);

  // When an individual part is selected while in outfit mode, exit outfit and randomize
  const prevPartsRef = useRef({ bodyType, skin, head, hair, top, bottom, shoes });

  useEffect(() => {
    if (!outfit || !initializedRef.current || isImportingRef.current) {
      prevPartsRef.current = { bodyType, skin, head, hair, top, bottom, shoes };
      return;
    }

    const prev = prevPartsRef.current;
    let changedPart: CatalogPartKey | null = null;

    // Check if bodyType or skin changed - exit outfit mode and randomize all parts
    if (bodyType !== prev.bodyType || skin.name !== prev.skin.name) {
      setOutfit(null);
      (Object.keys(setters) as CatalogPartKey[]).forEach((key) => {
        if (key === "outfit") return;
        randomSlot(key);
      });
      prevPartsRef.current = { bodyType, skin, head, hair, top, bottom, shoes };
      return;
    }

    // Check if individual parts changed
    if (head !== prev.head && head) changedPart = "head";
    else if (hair !== prev.hair && hair) changedPart = "hair";
    else if (top !== prev.top && top) changedPart = "top";
    else if (bottom !== prev.bottom && bottom) changedPart = "bottom";
    else if (shoes !== prev.shoes && shoes) changedPart = "shoes";

    if (changedPart) {
      // Exit outfit mode
      setOutfit(null);

      // Randomize all other parts
      (Object.keys(setters) as CatalogPartKey[]).forEach((key) => {
        if (key === "outfit" || key === changedPart) return;
        randomSlot(key);
      });
    }

    prevPartsRef.current = { bodyType, skin, head, hair, top, bottom, shoes };
  }, [bodyType, skin, head, hair, top, bottom, shoes, outfit]);

  const configuratorClasses = [
    styles.configurator,
    appState === "configurator" ? styles.configuratorVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={configuratorClasses}>
      <ConfiguratorBack onStateChange={onStateChange} />

      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Customize</h2>
      </div>

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
            <SectionBodyType bodyType={bodyType} setBodyType={setBodyType} />
          )}
          {section === "bodyType" && (
            <SectionSkin
              skin={skin}
              skins={skins}
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
              setSlot={setOutfit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
