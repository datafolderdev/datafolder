let arrayLast = require("./QyUtils.js").arrayLast, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, logger = require("./QyLogger.js").logger;

class QyQueue {
    constructor(e) {
        e = {
            ...getDefaultOptions("QyQueue"),
            ...e
        }, Object.assign(this, {
            options: e,
            queue: [],
            firstIdx: 0,
            _waterMark: 0
        });
    }
    get first() {
        return this.queue[this.firstIdx];
    }
    get last() {
        return this.isEmpty ? void 0 : arrayLast(this.queue);
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
    push(...e) {
        this.queue.push(...e);
        e = this.queue.length;
        e > this._waterMark && (this._waterMark = e);
    }
    shift() {
        var e;
        if (!this.isEmpty) return e = this.first, this._advanceIdx(), e;
    }
    _advanceIdx() {
        var {
            queue: t,
            firstIdx: e,
            options: s
        } = this, r = t.length, i = e + 1;
        if (r <= i) this.reset(); else {
            var u = r - i;
            if (i > s.maxLenBeforeRecycle || u <= i) {
                for (let e = 0; e < u; ++e) t[e] = t[e + i];
                this.firstIdx = 0, t.length = u;
            } else this.firstIdx = i, t[e] = void 0;
        }
    }
}

Object.assign(module.exports, {
    QyQueue: QyQueue
});