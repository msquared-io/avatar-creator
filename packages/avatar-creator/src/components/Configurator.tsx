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

import {
  CatalogueBodyType,
  CatalogueData,
  CataloguePartsKeys,
  CatalogueSkin,
  DeepReadonly,
} from "../CatalogueData";
import { AvatarLoader } from "../scripts/avatar-loader";
import styles from "./Configurator.module.css";
import ConfiguratorBack from "./ConfiguratorBack";
import SectionBasic from "./SectionBasic";
import SectionBodyType from "./SectionBodyType";
import SectionButton from "./SectionButton";
import SectionSkin from "./SectionSkin";

export default function Configurator({
  data,
  avatarLoader,
  onStateChange,
  appState,
  app,
}: {
  data: CatalogueData;
  avatarLoader: AvatarLoader;
  onStateChange: (state: "home" | "configurator") => void;
  appState: "home" | "configurator";
  app: AppBase;
}) {
  const [skins, setSkins] = useState<DeepReadonly<Array<CatalogueSkin>>>([]);
  const [section, setSection] = useState<CataloguePartsKeys | "bodyType">("bodyType");
  const [sectionDropOver, setSectionDropOver] = useState<CataloguePartsKeys | "window" | null>(
    null,
  );

  const [bodyType, setBodyType] = useState<CatalogueBodyType>(
    Math.random() > 0.5 ? "bodyB" : "bodyA",
  );
  const [skin, setSkin] = useState<CatalogueSkin>(
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

  const setters: Record<CataloguePartsKeys, (file: string) => void> = {
    head: setHead,
    hair: setHair,
    top: setTop,
    bottom: setBottom,
    shoes: setShoes,
    outfit: setOutfit,
  };

  const settersSecondary: Partial<Record<CataloguePartsKeys, (file: string | null) => void>> = {
    top: setTopSecondary,
    bottom: setBottomSecondary,
  };

  const randomAll = (exception = "") => {
    (Object.keys(setters) as CataloguePartsKeys[]).forEach((key) => {
      if (key === "outfit") return;
      if (key === exception) return;
      randomSlot(key);
    });
  };

  const randomSlot = (slot: CataloguePartsKeys) => {
    const list = data.bodyTypes[bodyType][slot].list;
    if (!list.length) {
      setters[slot]('');
      return;
    }

    const item = list[Math.floor(Math.random() * list.length)];
    let url = item.file;
    if (slot === "head") {
      url = avatarLoader.getSkinBasedUrl(url, skin);
    }
    setters[slot](url);

    if (settersSecondary[slot]) {
      settersSecondary[slot](item.secondary ?? null);
    }
  };

  const slotHasItems = (slot: string) => {
    for (const bodyType in data.bodyTypes) {
      if (
        data.bodyTypes[bodyType as keyof typeof data.bodyTypes]?.[slot as CataloguePartsKeys]?.list
          ?.length > 1
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    app.fire("camera:slotFocus", section);
  }, [section]);

  useEffect(() => {
    setSkins(data.skin);

    const findDragTarget = (target: HTMLElement | null) => {
      if (target === null) return null;

      let slot: CataloguePartsKeys | "window" | null = "window";

      while (target) {
        const drop = target.getAttribute("data-drop") as CataloguePartsKeys | null;
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

      const slot: CataloguePartsKeys | "bodyType" | "window" | null = findDragTarget(
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
      setHead(avatarLoader.getSkinBasedUrl(head, skin));
    } else {
      randomSlot("head");
    }
  }, [skin]);

  useEffect(() => {
    avatarLoader.setSkin(skin);
    avatarLoader.setBodyType(bodyType);
    if (head) avatarLoader.load("head", head + ".glb");
    if (hair) avatarLoader.load("hair", hair + ".glb");
    if (top) avatarLoader.load("top", top + ".glb");
    if (topSecondary) avatarLoader.load("top:secondary", topSecondary + ".glb");
    if (bottom) avatarLoader.load("bottom", bottom + ".glb");
    if (bottomSecondary) avatarLoader.load("bottom:secondary", bottomSecondary + ".glb");
    if (shoes) avatarLoader.load("shoes", shoes + ".glb");
    if (outfit) avatarLoader.load("outfit", outfit + ".glb");

    const evtBodyType = avatarLoader.on("slot:bodyType", (value) => {
      avatarLoader.preventRandom = true;
      setBodyType(value);
      setTimeout(() => {
        avatarLoader.preventRandom = false;
      }, 500);
    });
    const evtSkin = avatarLoader.on("slot:skin", (value) => {
      setSkin(value);
    });
    const evtHead = avatarLoader.on("slot:head", (value) => {
      setHead(value.replace(/\.glb$/i, ""));
    });
    const evtHair = avatarLoader.on("slot:hair", (value) => {
      setHair(value.replace(/\.glb$/i, ""));
    });
    const evtTop = avatarLoader.on("slot:top", (value) => {
      setTop(value.replace(/\.glb$/i, ""));
    });
    const evtTopSecondary = avatarLoader.on("slot:top:secondary", (value) => {
      setTopSecondary(value.replace(/\.glb$/i, ""));
    });
    const evtBottom = avatarLoader.on("slot:bottom", (value) => {
      setBottom(value.replace(/\.glb$/i, ""));
    });
    const evtBottomSecondary = avatarLoader.on("slot:bottom:secondary", (value) => {
      setBottomSecondary(value.replace(/\.glb$/i, ""));
    });
    const evtShoes = avatarLoader.on("slot:shoes", (value) => {
      setShoes(value.replace(/\.glb$/i, ""));
    });
    const evtOutfit = avatarLoader.on("slot:outfit", (value) => {
      setOutfit(value.replace(/\.glb$/i, ""));
    });

    return () => {
      evtBodyType.off();
      evtSkin.off();
      evtHead.off();
      evtHair.off();
      evtTop.off();
      evtTopSecondary.off();
      evtBottom.off();
      evtBottomSecondary.off();
      evtShoes.off();
      evtOutfit.off();
    };
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
    avatarLoader.load("head", head ? head + ".glb" : null);
  }, [head]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (hair && (outfit || avatarLoader.has("outfit"))) unloadOutfit("hair");
    avatarLoader.load("hair", hair ? hair + ".glb" : null);
  }, [hair]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (top && (outfit || avatarLoader.has("outfit"))) unloadOutfit("top");
    avatarLoader.load("top", top ? top + ".glb" : null);
  }, [top]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (topSecondary && (outfit || avatarLoader.has("outfit"))) unloadOutfit("top:secondary");
    avatarLoader.load("top:secondary", topSecondary ? topSecondary + ".glb" : null);
  }, [topSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (bottom && (outfit || avatarLoader.has("outfit"))) unloadOutfit("bottom");
    avatarLoader.load("bottom", bottom ? bottom + ".glb" : null);
  }, [bottom]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (bottomSecondary && (outfit || avatarLoader.has("outfit"))) unloadOutfit("bottom:secondary");
    avatarLoader.load("bottom:secondary", bottomSecondary ? bottomSecondary + ".glb" : null);
  }, [bottomSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    if (shoes && (outfit || avatarLoader.has("outfit"))) unloadOutfit("shoes");
    avatarLoader.load("shoes", shoes ? shoes + ".glb" : null);
  }, [shoes]);
  useEffect(() => {
    if (!avatarLoader) return;

    if (outfit) {
      (Object.keys(setters) as CataloguePartsKeys[]).forEach((key) => {
        if (key === "outfit") return;
        setters[key]('');
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

    avatarLoader.load("outfit", outfit ? outfit + ".glb" : null);
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
          {slotHasItems("head") && (
            <SectionButton
              slot="head"
              setSection={setSection}
              droppable={false}
              active={section === "head"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems("hair") && (
            <SectionButton
              slot="hair"
              setSection={setSection}
              droppable={false}
              active={section === "hair"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems("top") && (
            <SectionButton
              slot="top"
              setSection={setSection}
              droppable={true}
              active={section === "top"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems("bottom") && (
            <SectionButton
              slot="bottom"
              setSection={setSection}
              droppable={true}
              active={section === "bottom"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems("shoes") && (
            <SectionButton
              slot="shoes"
              setSection={setSection}
              droppable={true}
              active={section === "shoes"}
              dropOver={sectionDropOver}
            />
          )}
          {slotHasItems("outfit") && (
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
