import s from "node:events";

import {
    setPromise as t
} from "./QyUtils.js";

import {
    logger as u
} from "./QyLogger.js";

import {
    getDefaultOptions as i
} from "./QyDefaultOptions.js";

import {
    QyQueue as n
} from "./QyQueue.js";

class e extends s {
    constructor(s, t = [], e = []) {
        super(), s = {
            ...i("QyOpRunner"),
            ...s
        }, Object.assign(this, {
            options: s,
            running: !1,
            opQueue: new n(s)
        }), r(this, t, !0), r(this, e);
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
    pushAndRunWithPromise(s) {
        return t(s), this.pushAndRun(s), s.promise;
    }
    pushAndRun(...s) {
        var t = this.opQueue, e = this.lastOp;
        "_op_stop" === e?.opFunName ? (t.pop(), t.push(...s, e)) : t.push(...s), 
        this.run();
    }
    async run() {
        if (!this.running) {
            this.running = !0;
            for (var s = this.opQueue; !s.isEmpty; ) {
                var t = s.shift(), {
                    opFunName: e,
                    eventName: i,
                    resolve: n,
                    args: r
                } = t;
                if (e) {
                    this.runningOp = t;
                    try {
                        var o = await (r ? this[e](...r) : this[e]());
                        n && n(o), i && this.emit(i, o);
                    } catch (s) {
                        u.error(`Run ${e} failed:`, s), i && this.emit(i, s);
                    }
                    this.runningOp = void 0;
                } else n && n(), i && this.emit(i);
            }
            this.running = !1;
        }
    }
}

function r(i, s, n) {
    for (let e of s) {
        let t = "_op_" + e;
        i[e] || (i[e] = n ? (...s) => i.pushAndRunWithPromise({
            opName: e,
            opFunName: t,
            args: s
        }) : (...s) => i.pushAndRun({
            opName: e,
            opFunName: t,
            args: s
        })), i[t] || (i[t] = () => u.error(`Class method ${t} not implemented.`));
    }
}

export {
    e as QyOpRunner
};