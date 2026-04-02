import {
    open as s
} from "node:fs/promises";

import {
    QyOpRunner as t
} from "./QyOpRunner.js";

import {
    ensureParentDir as n,
    getSize as o,
    getSizeStr as v,
    sleep as _,
    setPromise as l,
    toBuffer as S
} from "./QyUtils.js";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

import {
    logger as y
} from "./QyLogger.js";

let h = Array.isArray;

class e extends t {
    _filePath;
    _totalSavedSize = 0;
    fileHandle;
    constructor(t = void 0, e = void 0) {
        super({
            ...a("QyBinWriter"),
            ...t
        }), this.filePath = e, f(this);
    }
    get filePath() {
        return this._filePath;
    }
    set filePath(t) {
        this._filePath = t;
    }
    get totalSavedSize() {
        return this._totalSavedSize;
    }
    set totalSavedSize(t) {
        this._totalSavedSize = t;
    }
    save(t, e, a) {
        null == e && (e = t, t = 0);
        var i, r = this.lastOp;
        return "_op_save" === r?.opFunName ? (i = r.args, i[0] = t, i = i[1], h(e) ? i.push(...e) : i.push(e), 
        a && l(r), r.promise) : (i = {
            opFunName: "_op_save",
            args: [ t, h(e) ? e : [ e ] ]
        }, a ? this.pushAndRunWithPromise(i) : this.pushAndRun(i));
    }
    truncate() {
        var t = this.lastOp;
        return "_op_truncate" === t?.opFunName ? t.promise : this.pushAndRunWithPromise({
            opFunName: "_op_truncate"
        });
    }
    switch(t) {
        var e = this.lastOp;
        return "_op_switch" === e?.opFunName ? (e.args[0] = t, e.promise) : this.pushAndRunWithPromise({
            opFunName: "_op_switch",
            args: [ t ]
        });
    }
    getBinData(t, e = 0) {
        var a = t.length;
        return 0 == a ? "" : 1 == a ? t[0] : Buffer.isBuffer(t[0]) ? Buffer.concat(t) : Buffer.concat(t.map(t => Buffer.from(t)));
    }
    async _op_start(t) {
        return await i(this, t = t || this.filePath), this;
    }
    async _op_stop() {
        var {
            fileHandle: t,
            filePath: e
        } = this;
        if (t) try {
            await t.close(), this.fileHandle = void 0;
        } catch (t) {
            y.error(`Close ${e} failed:`, t);
        }
        f(this);
    }
    _op_save(t, e) {
        e = this.getBinData(e, t);
        if (e) return (async (t, e, a) => {
            let {
                fileHandle: i,
                totalSavedSize: r,
                filePath: s,
                options: n
            } = t, {
                emitSaveEvent: o,
                maxFileSize: l,
                maxRetryInterval: h,
                retryIntervalFactor: f
            } = n, p = S(a), u = p.length, c = `size ${v(u)} (MaxId:${e}) to ` + s, d;
            for (;"_op_truncate" !== t.firstOp?.opFunName; ) try {
                await i.appendFile(p, {
                    flush: !0
                });
                var m = t.totalSavedSize = r + u;
                return o && 0 < e && t.emit("save", e), void (!t.maxFileSizeEmitted && l && m > l && (t.maxFileSizeEmitted = !0, 
                t.emit("maxFileSize", m)));
            } catch (t) {
                y.error(`Saving ${c} failed:`, t, "Truncated back to " + r), await i.truncate(r), 
                d = d ? Math.min(h, d * f) : 1, y.log(`Retry in ${d} seconds`), 
                await _(d);
            }
        })(this, t, e);
    }
    async _op_truncate() {
        var {
            fileHandle: t,
            filePath: e
        } = this;
        if (t) try {
            await t.truncate(0), y.info("Truncated " + e);
        } catch (t) {
            y.error(`Truncate ${e} failed:`, t);
        }
        f(this);
    }
    async _op_switch(t) {
        var {
            fileHandle: e,
            filePath: a
        } = this;
        e && a == t || (await i(this, t), y.info(`Switched from ${a} to ` + t));
    }
}

async function i(t, e) {
    var {
        fileHandle: a,
        options: i
    } = t;
    f(t);
    try {
        a && (a.close(), t.fileHandle = void 0), await n(e);
        var r = i.append;
        t.fileHandle = await s(e, r ? "a" : "w"), t.filePath = e, r && (t.totalSavedSize = await o(e));
    } catch (t) {
        y.error(`Open ${e} failed:`, t);
    }
}

function f(t) {
    Object.assign(t, {
        totalSavedSize: 0,
        maxFileSizeEmitted: !1
    });
}

export {
    e as QyBinWriter
};