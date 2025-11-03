/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import {
  Catalog,
  CatalogBasicPart,
  CatalogBodyTypeKey,
  CatalogPartKey,
  CatalogSkin,
} from "../types/Catalog";
import { AvatarLoader } from "./avatar-loader";

export interface AvatarState {
  bodyType: CatalogBodyTypeKey;
  skin: CatalogSkin;
  head: string | null;
  hair: string | null;
  top: string | null;
  topSecondary: string | null;
  bottom: string | null;
  bottomSecondary: string | null;
  shoes: string | null;
  outfit: string | null;
}

/**
 * Manages the avatar state and synchronizes it with the AvatarLoader.
 * Handles all complex loading logic including outfit management and body slot visibility.
 * React components should update the state here, and this manager handles the rendering.
 */
export class AvatarStateManager {
  private currentState: AvatarState | null = null;
  private currentUrls = new Map<string, string>();

  // Maps URL to part metadata (for determining torso/legs visibility)
  private partMetadataByUrl = new Map<string, CatalogBasicPart>();

  // Track current rendering mode to detect when we need to recreate root entity
  private currentMode: "outfit" | "individual" | null = null;

  constructor(
    private avatarLoader: AvatarLoader,
    private catalog: Catalog,
  ) {
    this.buildPartMetadata();
  }

  /**
   * Builds a map of part URLs to their metadata for quick lookups
   */
  private buildPartMetadata(): void {
    for (const bodyType of this.catalog.bodyTypes) {
      for (const slotKey in bodyType.parts) {
        const section = bodyType.parts[slotKey];

        if (section.skin) {
          // Skinned parts
          for (const skinnedPart of section.parts) {
            for (const skinName in skinnedPart) {
              const part = skinnedPart[skinName];
              this.partMetadataByUrl.set(part.model, part);
              if (part.secondaryModel) {
                this.partMetadataByUrl.set(part.secondaryModel, part);
              }
            }
          }
        } else {
          // Unskinned parts
          for (const part of section.parts) {
            this.partMetadataByUrl.set(part.model, part);
            if (part.secondaryModel) {
              this.partMetadataByUrl.set(part.secondaryModel, part);
            }
          }
        }
      }
    }
  }

  /**
   * Updates the avatar state and triggers appropriate loading operations.
   * This is the main entry point - React components call this with new state.
   */
  updateState(newState: Partial<AvatarState>): void {
    // Initialize or merge state
    if (!this.currentState) {
      this.currentState = {
        bodyType: newState.bodyType ?? "bodyB",
        skin: newState.skin ?? this.catalog.skin[0],
        head: newState.head ?? null,
        hair: newState.hair ?? null,
        top: newState.top ?? null,
        topSecondary: newState.topSecondary ?? null,
        bottom: newState.bottom ?? null,
        bottomSecondary: newState.bottomSecondary ?? null,
        shoes: newState.shoes ?? null,
        outfit: newState.outfit ?? null,
      };
    } else {
      this.currentState = {
        ...this.currentState,
        ...newState,
      };
    }

    // Determine new mode based on whether we have outfit or individual parts
    const newMode = this.currentState.outfit ? "outfit" : "individual";

    // If mode changed, mark for root entity recreation to handle incompatible root structures
    if (this.currentMode && this.currentMode !== newMode || this.currentState.outfit) {
      this.avatarLoader.markForRootEntityRecreation();
    }

    this.currentMode = newMode;

    // Apply state changes to avatar loader
    this.syncToLoader();
  }

  /**
   * Gets the current avatar state
   */
  getState(): AvatarState | null {
    return this.currentState;
  }

  /**
   * Resolves the current state to a map of keys to URLs that should be loaded
   */
  private resolveUrls(state: AvatarState): Map<string, string> {
    const urls = new Map<string, string>();

    // If outfit mode, only load the outfit
    if (state.outfit) {
      urls.set("outfit", state.outfit);
      return urls;
    }

    // Determine if we need to show torso or just arms based on top clothing
    let showTorso = true;
    if (state.top) {
      const topPart = this.partMetadataByUrl.get(state.top);
      // If part metadata found and has torso flag set to true, show torso
      // If part metadata found but torso is false/undefined, show arms only
      // If part metadata NOT found (custom part), default to showing torso for safety
      showTorso = topPart ? (topPart.torso ?? false) : true;
    }

    // Determine if we need to show legs based on bottom clothing
    let showLegs = true;
    if (state.bottom) {
      const bottomPart = this.partMetadataByUrl.get(state.bottom);
      // If part metadata found and has legs flag set to true, show legs
      // If part metadata found but legs is false/undefined, hide legs
      // If part metadata NOT found (custom part), default to showing legs for safety
      showLegs = bottomPart ? (bottomPart.legs ?? false) : true;
    }

    // Get the body type data
    const bodyTypeData = this.catalog.bodyTypes.find((bt) => bt.name === state.bodyType);
    if (!bodyTypeData) {
      throw new Error(`Could not find body type: ${state.bodyType}`);
    }

    // Load torso/arms based on whether we need torso visible
    const torsoKey = showTorso ? "torsoArms" : "arms";
    const torsoUrl = bodyTypeData.body[torsoKey][state.skin.name].model;
    urls.set("torso", torsoUrl);

    // Load legs if needed
    if (showLegs) {
      const legsUrl = bodyTypeData.body.legs[state.skin.name].model;
      urls.set("legs", legsUrl);
    }

    // Load all other parts
    if (state.head) {
      urls.set("head", state.head);
    }
    if (state.hair) {
      urls.set("hair", state.hair);
    }
    if (state.top) {
      urls.set("top", state.top);
    }
    if (state.topSecondary) {
      urls.set("topSecondary", state.topSecondary);
    }
    if (state.bottom) {
      urls.set("bottom", state.bottom);
    }
    if (state.bottomSecondary) {
      urls.set("bottomSecondary", state.bottomSecondary);
    }
    if (state.shoes) {
      urls.set("shoes", state.shoes);
    }

    return urls;
  }

  /**
   * Synchronizes current state to the avatar loader
   */
  private syncToLoader(): void {
    if (!this.currentState) return;

    const newUrls = this.resolveUrls(this.currentState);

    // Find keys to unload (in old but not in new)
    for (const [key] of this.currentUrls.entries()) {
      if (!newUrls.has(key)) {
        this.avatarLoader.unload(key);
      }
    }

    // Find keys to load/update (in new, or changed from old)
    for (const [key, url] of newUrls.entries()) {
      const oldUrl = this.currentUrls.get(key);
      if (oldUrl !== url) {
        this.avatarLoader.load(key, url);
      }
    }

    // Update our tracking
    this.currentUrls = newUrls;
  }

  /**
   * Gets the current URLs being rendered
   */
  getCurrentUrls(): Map<string, string> {
    return new Map(this.currentUrls);
  }

  /**
   * Loads a custom GLB file for a slot (drag and drop support)
   */
  loadCustom(slot: CatalogPartKey | "outfit", filename: string, objectUrl: string): void {
    if (!this.currentState) return;

    if (slot === "outfit") {
      // When loading a custom outfit, enter outfit mode
      this.avatarLoader.loadCustom("outfit", filename, objectUrl);

      // Update state to reflect outfit mode
      this.currentState = {
        ...this.currentState,
        outfit: objectUrl,
      };

      // Clear all other parts from the URL map
      this.currentUrls.clear();
      this.currentUrls.set("outfit", objectUrl);
    } else {
      // Loading custom part for individual slot
      // For custom parts, we assume they need torso/legs visible
      this.avatarLoader.loadCustom(slot, filename, objectUrl);

      // Update state to reflect custom part
      const updates: Partial<AvatarState> = {
        [slot]: objectUrl,
      };

      if (slot === "top") {
        updates.topSecondary = null;
      } else if (slot === "bottom") {
        updates.bottomSecondary = null;
      }

      this.currentState = {
        ...this.currentState,
        ...updates,
      };

      // Update the URL map
      this.currentUrls.set(slot, objectUrl);
      if (slot === "top" && this.currentUrls.has("topSecondary")) {
        this.currentUrls.delete("topSecondary");
      }
      if (slot === "bottom" && this.currentUrls.has("bottomSecondary")) {
        this.currentUrls.delete("bottomSecondary");
      }
    }
  }
}
