import t from "node:events";

import {
    setPromise as s
} from "./QyUtils.js";

import {
    logger as u
} from "./QyLogger.js";

import {
    getDefaultOptions as i
} from "./QyDefaultOptions.js";

import {
    QyQueue as r
} from "./QyQueue.js";

class e extends t {
    running = !1;
    opQueue;
    options;
    runningOp;
    constructor(t, s = [], e = []) {
        super(), t = this.options = {
            ...i("QyOpRunner"),
            ...t
        }, this.opQueue = new r(t), n(this, s, !0), n(this, e), n(this, [ "start", "stop" ], !0);
    }
    get firstOp() {
        return this.opQueue.first;
    }
    get lastOp() {
        return this.opQueue.last;
    }
    finish() {
        return this.lastOp?.promise || this.runningOp?.promise;
    }
    pushAndRunWithPromise(t) {
        return s(t), this.pushAndRun(t), t.promise;
    }
    pushAndRun(...t) {
        var s = this.opQueue, e = this.lastOp;
        "_op_stop" === e?.opFunName ? (s.pop(), s.push(...t, e)) : s.push(...t), 
        this.run();
    }
    async run() {
        if (!this.running) {
            this.running = !0;
            for (var t = this.opQueue; !t.isEmpty; ) {
                var s = t.shift(), {
                    opFunName: e,
                    eventName: i,
                    resolve: r,
                    args: n
                } = s;
                if (e) {
                    this.runningOp = s;
                    try {
                        var o = await (n ? this[e](...n) : this[e]());
                        r && r(o), i && this.emit(i, o);
                    } catch (t) {
                        u.error(`Run ${e} failed:`, t), i && this.emit(i, t);
                    }
                    this.runningOp = void 0;
                } else r && r(), i && this.emit(i);
            }
            this.running = !1;
        }
    }
}

function n(i, t, r = !1) {
    for (let e of t) {
        let s = "_op_" + e;
        if (i[e] || (i[e] = r ? (...t) => i.pushAndRunWithPromise({
            opName: e,
            opFunName: s,
            args: t
        }) : (...t) => i.pushAndRun({
            opName: e,
            opFunName: s,
            args: t
        })), !i[s]) {
            let t = i.constructor.name + " not implemented " + s;
            i[s] = () => u.error(t), u.error(t);
        }
    }
}

export {
    e as QyOpRunner
};