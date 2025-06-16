import Taps from "./mr-tap";
import Tap from "./tap";

class TapMouse {
  private _taps: Taps;

  constructor(taps: Taps) {
    this._taps = taps;

    const element = this._taps._element;

    element.addEventListener(
      "mousedown",
      (evt: MouseEvent) => {
        this._onMouseDown(evt);
      },
      false,
    );
    element.addEventListener(
      "mousemove",
      (evt: MouseEvent) => {
        this._onMouseMove(evt);
      },
      false,
    );
    element.addEventListener(
      "mouseup",
      (evt: MouseEvent) => {
        this._onMouseUp(evt);
      },
      false,
    );
  }

  _onMouseDown(evt: MouseEvent) {
    const id = -evt.button - 1;
    const tap = new Tap(this._taps, id);
    this._taps._index.set(tap.id, tap);
    tap.change(evt);
    tap._sx = tap._lx = tap._x;
    tap._sy = tap._ly = tap._y;
    tap._mouse = true;
    tap._button = evt.button;
  }

  _onMouseMove(evt: MouseEvent) {
    for (const tap of this._taps._index.values()) {
      if (!tap.mouse) continue;
      tap.change(evt);
    }
  }

  _onMouseUp(evt: MouseEvent) {
    const id = -evt.button - 1;
    const tap = this._taps._index.get(id);
    if (!tap) return;
    tap.change(evt);
    tap._release = true;
  }
}

export default TapMouse;
