/**
 * @license
 * Copyright Improbable MV Limited.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/msquared-io/avatar-creator/blob/main/LICENSE
 */

import { platform, Script } from "playcanvas";

import Taps from "../libs/mr-tap";
import Tap from "../libs/tap";

class Input extends Script {
  private xScale: number = 1;
  private yScale: number = 1;
  private taps: Taps = new Taps();
  private activeTaps: Set<Tap> = new Set();
  private lastDistance: number | null = null;

  initialize() {
    this.xScale = platform.mobile ? 3 : 1;
    this.yScale = 1.4;

    window.addEventListener("wheel", (event) => {
      if (event.target !== this.app.graphicsDevice.canvas) return;

      this.app.fire("input:zoom", event.deltaY);
    });
  }

  update() {
    this.taps.update();

    for (const tap of this.taps.start) {
      this.activeTaps.add(tap);
    }

    for (const tap of this.taps.up) {
      this.activeTaps.delete(tap);
      this.lastDistance = null;
    }

    if (this.activeTaps.size === 1) {
      for (const tap of this.taps.drag) {
        this.app.fire("input:drag", tap.dx * this.xScale, tap.dy * this.yScale);
      }

      return;
    }

    const taps = Array.from(this.taps);
    if (taps.length !== 2) return;

    const distance = Math.hypot(taps[0].x - taps[1].x, taps[0].y - taps[1].y);

    if (this.lastDistance) {
      const delta = this.lastDistance - distance;

      if (Math.abs(delta) > 1) {
        this.app.fire("input:zoom", delta * 3.5);
      }
    }

    this.lastDistance = distance;
  }
}

const script = {
  class: Input,
  name: "input",
};

export default script;
