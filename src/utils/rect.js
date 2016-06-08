export default class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    width() { return this.w; }
    height() { return this.h; }

    center() {
        return {
            x: this.x + this.width() / 2.0,
            y: this.y + this.height() / 2.0
        }
    }

    ratio() { return Math.min(this.width() / this.height(), this.height() / this.width()); }
}