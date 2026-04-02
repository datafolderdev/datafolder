import {
    arrayLast as t
} from "./QyUtils.js";

import {
    getDefaultOptions as e
} from "./QyDefaultOptions.js";

class s {
    options;
    queue = [];
    firstIdx = 0;
    _waterMark = 0;
    constructor(t) {
        this.options = {
            ...e("QyQueue"),
            ...t
        };
    }
    get first() {
        return this.queue[this.firstIdx];
    }
    get last() {
        return this.isEmpty ? void 0 : t(this.queue);
    }
    get isEmpty() {
        return this.firstIdx >= this.queue.length;
    }
    get waterMark() {
        return this._waterMark;
    }
    pop() {
        return this.queue.pop();
    }
    reset() {
        this.firstIdx = 0, this.queue.length = 0;
    }
    push(...t) {
        this.queue.push(...t);
        t = this.queue.length;
        t > this._waterMark && (this._waterMark = t);
    }
    shift() {
        if (!this.isEmpty) {
            var t = this.first, e = this, {
                queue: s,
                firstIdx: r,
                options: i
            } = e, u = s.length, h = r + 1;
            if (u <= h) e.reset(); else {
                var a = u - h;
                if (h > i.maxLenBeforeRecycle || a <= h) {
                    for (let t = 0; t < a; ++t) s[t] = s[t + h];
                    e.firstIdx = 0, s.length = a;
                } else e.firstIdx = h, s[r] = void 0;
            }
            return t;
        }
    }
}

export {
    s as QyQueue
};