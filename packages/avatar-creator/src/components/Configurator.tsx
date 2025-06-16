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
import SectionButton from "./SectionButton";
import SectionGender from "./SectionGender";
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
  const [section, setSection] = useState<CataloguePartsKeys | "gender">("gender");

  const [gender, setGender] = useState<CatalogueBodyType>(Math.random() > 0.5 ? "female" : "male");
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

  const setters: Record<CataloguePartsKeys, (file: string) => void> = {
    head: setHead,
    hair: setHair,
    top: setTop,
    bottom: setBottom,
    shoes: setShoes,
  };

  const settersSecondary: Partial<Record<CataloguePartsKeys, (file: string | null) => void>> = {
    top: setTopSecondary,
    bottom: setBottomSecondary,
  };

  const randomAll = () => {
    (Object.keys(setters) as CataloguePartsKeys[]).forEach((key) => randomSlot(key));
  };

  const randomSlot = (slot: CataloguePartsKeys) => {
    const list = data.genders[gender][slot].list;
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

  useEffect(() => {
    app.fire("camera:slotFocus", section);
  }, [section]);

  useEffect(() => {
    setSkins(data.skin);
  }, []);

  useEffect(() => {
    randomAll();
  }, [gender]);

  useEffect(() => {
    if (head) {
      setHead(avatarLoader.getSkinBasedUrl(head, skin));
    } else {
      randomSlot("head");
    }
  }, [skin]);

  useEffect(() => {
    avatarLoader.setSkin(skin);
    avatarLoader.setGender(gender);
    if (head) avatarLoader.load("head", head + ".glb");
    if (hair) avatarLoader.load("hair", hair + ".glb");
    if (top) avatarLoader.load("top", top + ".glb");
    if (topSecondary) avatarLoader.load("top:secondary", topSecondary + ".glb");
    if (bottom) avatarLoader.load("bottom", bottom + ".glb");
    if (bottomSecondary) avatarLoader.load("bottom:secondary", bottomSecondary + ".glb");
    if (shoes) avatarLoader.load("shoes", shoes + ".glb");
  }, [avatarLoader]);

  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.setGender(gender);
  }, [gender]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.setSkin(skin);
  }, [skin]);

  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("head", head ? head + ".glb" : null);
  }, [head]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("hair", hair ? hair + ".glb" : null);
  }, [hair]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("top", top ? top + ".glb" : null);
  }, [top]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("top:secondary", topSecondary ? topSecondary + ".glb" : null);
  }, [topSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("bottom", bottom ? bottom + ".glb" : null);
  }, [bottom]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("bottom:secondary", bottomSecondary ? bottomSecondary + ".glb" : null);
  }, [bottomSecondary]);
  useEffect(() => {
    if (!avatarLoader) return;
    avatarLoader.load("shoes", shoes ? shoes + ".glb" : null);
  }, [shoes]);

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
          <SectionButton slot="gender" setSection={setSection} active={section === "gender"} />
          <SectionButton slot="head" setSection={setSection} active={section === "head"} />
          <SectionButton slot="hair" setSection={setSection} active={section === "hair"} />
          <SectionButton slot="top" setSection={setSection} active={section === "top"} />
          <SectionButton slot="bottom" setSection={setSection} active={section === "bottom"} />
          <SectionButton slot="shoes" setSection={setSection} active={section === "shoes"} />
        </ul>

        <div
          className={styles.items}
          onTouchMove={(evt) => {
            evt.stopPropagation();
          }}
        >
          {section === "gender" && (
            <SectionGender
              gender={gender}
              setGender={(value) => {
                setGender(value);
              }}
              avatarLoader={avatarLoader}
            />
          )}
          {section === "gender" && (
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
              gender={gender}
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
              gender={gender}
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
              gender={gender}
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
              gender={gender}
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
              gender={gender}
              selected={shoes}
              avatarLoader={avatarLoader}
              setSlot={setShoes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
