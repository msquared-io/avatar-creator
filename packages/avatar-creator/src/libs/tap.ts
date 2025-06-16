import Taps from "./mr-tap";




























































  private _timestamp: number;
  _sx = 0;
  _sy = 0;
  _x = 0;
  _y = 0;
  _lx = 0;
  _ly = 0;
  private _dx = 0;
  private _dy = 0;
  _mouse = false;
  _button: number | null = null;
  private _start = true;
  private _started = false;
  private _up = false;
  private _down = false;
  private _click = false;
  private _drag = false;
  private _dragstart = false;
  private _dragend = false;
  _release = false;

  constructor(
    private _taps: Taps,
    private _id: number,
  ) {
    this._timestamp = Date.now();
  }

  change(evt: MouseEvent | Touch) {
    this._x = evt.clientX;
    this._y = evt.clientY;
  }

  update() {
    if (this._start && !this._started) {
      this._started = true;
    } else if (this._started && this._start) {
      this._start = false;
    }

    // check if needs removing
    if (this._up) {
      this._taps._index.delete(this._id);
      return;
    }

    if (this._dragstart) {
      this._dragstart = false;
    }

    // check if dragging
    if (!this._drag) {
      const dx = this._sx - this._x;
      const dy = this._sy - this._y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > this._taps._dragDistance || Date.now() - this._timestamp > this._taps._dragDelay) {
        this._dragstart = true;
        this._drag = true;
      }
    }

    // check if tap is released
    if (this._release) {
      this._down = false;
      this._up = true;

      if (this._drag) {
        this._dragend = true;
      } else {
        this._click = true;
      }
    }

    this._dx = this._x - this._lx;
    this._dy = this._y - this._ly;

    this._lx = this._x;
    this._ly = this._y;
  }

  get id() {
    return this._id;
  }

  get start() {
    return this._start;
  }

  get up() {
    return this._up;
  }

  get click() {
    return this._click;
  }

  get dragstart() {
    return this._dragstart;
  }

  get drag() {
    return this._drag;
  }

  get dragend() {
    return this._dragend;
  }

  get timestamp() {
    return this._timestamp;
  }

  get mouse() {
    return this._mouse;
  }

  get button() {
    return this._button;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get sx() {
    return this._sx;
  }

  get sy() {
    return this._sy;
  }

  get dx() {
    return this._dx;
  }

  get dy() {
    return this._dy;
  }


export default Tap;
