import {
    open as s
} from "node:fs/promises";

import {
    QyOpRunner as e
} from "./QyOpRunner.js";

import {
    ensureParentDir as r,
    getSize as n,
    getSizeStr as d,
    sleep as _,
    setPromise as o,
    toBuffer as v
} from "./QyUtils.js";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

let l = Array.isArray;

class t extends e {
    constructor(e, t) {
        super({
            ...a("QyBinWriter"),
            ...e
        }, [ "start", "stop" ]), this.filePath = t, this._resetParams();
    }
    getFilePath() {
        return this.filePath;
    }
    getTotalSavedSize() {
        return this.totalSavedSize;
    }
    save(e, t, a) {
        null == t && (t = e, e = 0);
        var i, s = this.lastOp;
        return "_op_save" === s?.opFunName ? (i = s.args, i[0] = e, i = i[1], l(t) ? i.push(...t) : i.push(t), 
        a && o(s), s.promise) : (i = {
            opFunName: "_op_save",
            args: [ e, l(t) ? t : [ t ] ]
        }, a ? this.pushAndRunWithPromise(i) : this.pushAndRun(i));
    }
    truncate() {
        var e = this.lastOp;
        return "_op_truncate" === e?.opFunName ? e.promise : this.pushAndRunWithPromise({
            opFunName: "_op_truncate"
        });
    }
    switch(e) {
        var t = this.lastOp;
        return "_op_switch" === t?.opFunName ? (t.args[0] = e, t.promise) : this.pushAndRunWithPromise({
            opFunName: "_op_switch",
            args: [ e ]
        });
    }
    supressMaxFileSizeEvent() {
        this.maxFileSizeEmitted = !0;
    }
    _getBinData(e) {
        var t = e.length;
        return 0 == t ? "" : 1 == t ? e[0] : Buffer.isBuffer(e[0]) ? Buffer.concat(e) : Buffer.concat(e.map(e => Buffer.from(e)));
    }
    async _saveBinData(e, t) {
        var {
            fileHandle: a,
            totalSavedSize: i,
            filePath: s,
            options: r
        } = this, {
            emitSaveEvent: n,
            maxFileSize: o,
            maxRetryInterval: l,
            retryIntervalFactor: h
        } = r, p = v(t), u = p.length, f = `size ${d(u)} (MaxId:${e}) to ` + s;
        let m;
        for (;"_op_truncate" !== this.firstOp?.opFunName; ) try {
            await a.appendFile(p, {
                flush: !0
            });
            var c = this.totalSavedSize = i + u;
            return n && this.emit("save", e), void (o && o < c && !this.maxFileSizeEmitted && (this.supressMaxFileSizeEvent(), 
            this.emit("maxFileSize", c)));
        } catch (e) {
            logger.error(`Saving ${f} failed:`, e, "Truncated back to " + i), await a.truncate(i), 
            m = m ? Math.min(l, m * h) : 1, logger.log(`Retry in ${m} seconds`), 
            await _(m);
        }
    }
    async _op_start(e) {
        return e = e || this.filePath, await this._openFile(e), this;
    }
    async _op_stop() {
        var {
            fileHandle: e,
            filePath: t
        } = this;
        if (e) try {
            await e.close(), this.fileHandle = void 0;
        } catch (e) {
            logger.error(`Close ${t} failed:`, e);
        }
        this._resetParams();
    }
    _op_save(e, t) {
        t = this._getBinData(t, e);
        if (t) return this._saveBinData(e, t);
    }
    async _op_truncate() {
        var {
            fileHandle: e,
            filePath: t
        } = this;
        if (e) try {
            await e.truncate(0), logger.info("Truncated " + t);
        } catch (e) {
            logger.error(`Truncate ${t} failed:`, e);
        }
        this._resetParams();
    }
    async _op_switch(e) {
        var {
            fileHandle: t,
            filePath: a
        } = this;
        t && a == e || (await this._openFile(e), logger.info(`Switched from ${a} to ` + e));
    }
    async _openFile(t) {
        var {
            fileHandle: e,
            options: a
        } = this;
        this._resetParams();
        try {
            e && (e.close(), this.fileHandle = void 0), await r(t);
            var i = a.append;
            this.fileHandle = await s(t, i ? "a" : "w"), this.filePath = t, i && (this.totalSavedSize = await n(t));
        } catch (e) {
            logger.error(`Open ${t} failed:`, e);
        }
    }
    _resetParams() {
        Object.assign(this, {
            totalSavedSize: 0,
            maxFileSizeEmitted: !1
        });
    }
}

export {
    t as QyBinWriter
};