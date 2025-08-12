/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { math, Script } from "playcanvas";

import { CataloguePartsKeys } from "../CatalogueData";

/*

    Implements camera controls: orbiting, zooming, panning
    And global event on Application: camera:slotFocus, which can be called like so:
    app.fire('camera:slotFocus', 'head');

*/

/**
 * Check if we are on Desktop (simply by aspect ratio)
 * @returns {boolean}
 */
const isDesktop = () => {
  return window.innerWidth / window.innerHeight > 1;
};

// camera heights and distances based on slot selected for desktop
const slotsDesktop = {
  full: { height: isDesktop() ? 1 : 0.8, distance: 8 },
  bodyType: { height: isDesktop() ? 1 : 0.8, distance: 8 },
  head: { height: 1.8, distance: 1.6 },
  hair: { height: 1.8, distance: 1.6 },
  top: { height: 1.5, distance: 2.0 },
  bottom: { height: 0.5, distance: 2.8 },
  shoes: { height: 0.5, distance: 1.6 },
  outfit: { height: isDesktop() ? 1 : 0.8, distance: 8 },
};

// camera heights and distances based on slot selected for mobile
const slotsMobile = {
  full: { height: isDesktop() ? 1 : 0.8, distance: 8 },
  bodyType: { height: isDesktop() ? 1 : 0.8, distance: 8 },
  head: { height: 1.6, distance: 1.6 },
  hair: { height: 1.6, distance: 1.6 },
  top: { height: 1.2, distance: 2.0 },
  bottom: { height: 0.3, distance: 2.8 },
  shoes: { height: 0.3, distance: 1.6 },
  outfit: { height: isDesktop() ? 1 : 0.8, distance: 8 },
};

class Camera extends Script {
  // settings
  private speed = 12;

  private rotateSpeed = 0.3;
  private panSpeed = 0.003;
  private zoomSpeed = 0.005;

  private tilt = -0.15;

  // ranges
  private mobileMinMaxHeight = [0.4, 1.8];
  private desktopMinMaxHeight = [0.6, 1.9];
  private mobileMinMaxDistance = [1.4, 4.5];
  private desktopMinMaxDistance = [1.4, 5.5];

  private mobileHeadLookAtHeight = 1.75;
  private desktopHeadLookAtHeight = 1.75;
  private feetLookAtStart = 0.7;
  // on desktop panel is on the right, so we can use entire screen height
  private mobileFeetLookAtHeight = -0.15;
  private desktopFeetLookAtHeight = 0.15;

  private angleTarget = 0;
  private distanceTarget = 5;
  private lookAtTarget: number = 0;
  private heightTarget: number = 0;

  private currentAngle: number = 0;
  private currentHeight: number = 0;
  private currentLookAt: number = 0;
  private currentDistance: number = 0;

  forcePortrait = false;

  initialize() {
    // input events
    this.app.on("input:drag", this.onDrag, this);
    this.app.on("input:zoom", this.onZoom, this);
    this.app.on("camera:setFocus", this.onFocus, this);
    this.app.on("camera:slotFocus", this.onSlotFocus, this);

    // initial values and values for lerping
    this.heightTarget = this.entity.getLocalPosition().y;
    this.lookAtTarget = this.getLookAt();

    this.currentAngle = this.angleTarget;
    this.currentHeight = this.heightTarget;
    this.currentLookAt = this.lookAtTarget;
    this.currentDistance = this.distanceTarget;

    // resize
    this.app.graphicsDevice.on("resizecanvas", this.onResize, this);
    this.onResize();

    // higher focal length, better portrait view
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.entity.camera!.fov = 25;
  }

  update(dt: number) {
    if (this.forcePortrait) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.entity.camera!.fov = 10;
      this.entity.setPosition(0, 1.67, 0.05);
      this.entity.setEulerAngles(5, 15, 0);
      this.entity.translateLocal(0, 0, 2);
      return;
    }

    // maximal value 1, to prevent overshooting
    const lerpValue = Math.min(1, this.speed * dt);

    this.currentAngle = math.lerp(this.currentAngle, this.angleTarget, lerpValue);
    this.currentHeight = math.lerp(this.currentHeight, this.heightTarget, lerpValue);
    this.currentLookAt = math.lerp(this.currentLookAt, this.lookAtTarget, lerpValue);
    this.currentDistance = math.lerp(this.currentDistance, this.distanceTarget, lerpValue);

    // orbit camera point around the center
    const x = Math.sin(this.currentAngle * math.DEG_TO_RAD) * this.currentDistance;
    const z = Math.cos(this.currentAngle * math.DEG_TO_RAD) * this.currentDistance;

    const distance = Math.max(0, Math.min(3, this.currentDistance - 1.5)) / 3;

    const height = math.lerp(this.currentHeight, this.defaultHeight, distance);
    const lookAt = math.lerp(this.currentLookAt, this.defaultLookAt, distance);

    this.entity.setLocalPosition(x, height, z);
    this.entity.lookAt(0, lookAt, 0);
  }

  onDrag(x: number, y: number) {
    this.orbitCamera(x);
    this.panCamera(y);
  }

  onZoom(delta: number) {
    this.distanceTarget = math.clamp(
      this.distanceTarget + delta * this.zoomSpeed,
      this.minMaxDistance[0],
      this.minMaxDistance[1],
    );
  }

  onSlotFocus(slot: CataloguePartsKeys) {
    if (!this.slots[slot]) return;
    this.onFocus(this.slots[slot].height, this.slots[slot].distance);
  }

  onFocus(height: number, distance: number) {
    this.heightTarget = math.clamp(height, this.minMaxHeight[0], this.minMaxHeight[1]);
    this.distanceTarget = math.clamp(distance, this.minMaxDistance[0], this.minMaxDistance[1]);
    this.lookAtTarget = this.getLookAt();
  }

  orbitCamera(x: number) {
    if (!x) return;

    this.angleTarget = this.angleTarget - x * this.rotateSpeed;
  }

  panCamera(y: number) {
    if (!y) return;

    const min = this.minMaxHeight[0];
    const max = this.minMaxHeight[1];

    this.heightTarget = math.clamp(this.heightTarget + y * this.panSpeed, min, max);

    this.lookAtTarget = this.getLookAt();
  }

  getLookAt(): number {
    // after reaching head level, start tilting camera
    // if (this.heightTarget + this.tilt > this.headLookAtStart) {
    //     return this.remap(
    //         this.heightTarget + this.tilt,
    //         this.headLookAtStart, this.minMaxHeight[1],
    //         this.headLookAtStart, this.headLookAtHeight
    //     );
    // }

    // after reaching aproximately knees level, start tilting camera towards feet
    if (this.heightTarget < this.feetLookAtStart) {
      const height = this.feetLookAtHeight;

      // based on current value between minHeight and feetLookAtStart change tilt
      return this.remap(
        this.heightTarget,
        this.minMaxHeight[0],
        this.feetLookAtStart,
        height,
        this.feetLookAtStart + this.tilt,
      );
    }

    return this.heightTarget + this.tilt;
  }

  onResize() {
    const height = this.app.graphicsDevice.height;
    const width = this.app.graphicsDevice.width;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.entity.camera!.horizontalFov = height / width > 1;
    // on resize from desktop to mobile, feet can be covered by UI, so we need to adjust look at target
    this.lookAtTarget = this.getLookAt();
  }

  // remap value from one range to another
  remap(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
    return toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin);
  }

  get defaultHeight() {
    return isDesktop() ? 1.6 : 1.3;
  }

  get defaultLookAt() {
    return isDesktop() ? 1.0 : 0.7;
  }

  get minMaxHeight() {
    return isDesktop() ? this.desktopMinMaxHeight : this.mobileMinMaxHeight;
  }

  get minMaxDistance() {
    return isDesktop() ? this.desktopMinMaxDistance : this.mobileMinMaxDistance;
  }

  get headLookAtHeight() {
    return isDesktop() ? this.desktopHeadLookAtHeight : this.mobileHeadLookAtHeight;
  }

  get feetLookAtHeight() {
    return isDesktop() ? this.desktopFeetLookAtHeight : this.mobileFeetLookAtHeight;
  }

  get slots() {
    return isDesktop() ? slotsDesktop : slotsMobile;
  }
}

const script = {
  class: Camera,
  name: "camera",
};

export default script;
