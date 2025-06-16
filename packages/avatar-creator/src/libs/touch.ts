import Taps from "./mr-tap";
import Tap from "./tap";

class TapTouch {
  private _taps: Taps;

  constructor(taps: Taps) {
    this._taps = taps;

    const element = this._taps._element;

    element.addEventListener(
      "touchstart",
      (evt: TouchEvent) => {
        this._onTouchStart(evt);
      },
      false,
    );
    element.addEventListener(
      "touchmove",
      (evt: TouchEvent) => {
        this._onTouchMove(evt);
      },
      false,
    );
    element.addEventListener(
      "touchend",
      (evt: TouchEvent) => {
        this._onTouchEnd(evt);
      },
      false,
    );
    element.addEventListener(
      "touchcancel",
      (evt: TouchEvent) => {
        this._onTouchEnd(evt);
      },
      false,
    );
  }

  _onTouchStart(evt: TouchEvent) {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches[i];
      const tap = new Tap(this._taps, touch.identifier);
      this._taps._index.set(tap.id, tap);
      tap.change(touch);
      tap._sx = tap._lx = tap._x;
      tap._sy = tap._ly = tap._y;
    }
  }

  _onTouchMove(evt: TouchEvent) {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches[i];
      const tap = this._taps._index.get(touch.identifier);
      if (!tap) continue;
      tap.change(touch);
    }
  }

  _onTouchEnd(evt: TouchEvent) {
    for (let i = 0; i < evt.changedTouches.length; i++) {
      const touch = evt.changedTouches[i];
      const tap = this._taps._index.get(touch.identifier);
      if (!tap) continue;
      tap.change(touch);
      tap._release = true;
    }
  }
}

export default TapTouch;
