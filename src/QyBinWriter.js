let open = require("node:fs/promises").open, QyOpRunner = require("./QyOpRunner.js").QyOpRunner, {
    ensureParentDir,
    getSize,
    getSizeStr,
    sleep,
    setPromise,
    toBuffer
} = require("./QyUtils.js"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyBinWriter extends QyOpRunner {
    constructor(e, t) {
        super({
            ...getDefaultOptions("QyBinWriter"),
            ...e
        }, [ "start", "stop" ]), this.filePath = t, this._resetParams();
    }
    getFilePath() {
        return this.filePath;
    }
    getTotalSavedSize() {
        return this.totalSavedSize;
    }
    save(e, t, i) {
        null == t && (t = e, e = 0);
        var a, r = this.lastOp;
        return "_op_save" === r?.opFunName ? (a = r.args, a[0] = e, a[1].push(t), 
        i && setPromise(r), r.promise) : (a = {
            opFunName: "_op_save",
            args: [ e, [ t ] ]
        }, i ? this.pushAndRunWithPromise(a) : this.pushAndRun(a));
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
            fileHandle: i,
            totalSavedSize: a,
            filePath: r,
            options: s
        } = this, {
            emitSaveEvent: n,
            maxFileSize: o,
            maxRetryInterval: l,
            retryIntervalFactor: h
        } = s, u = toBuffer(t), p = u.length, f = `size ${getSizeStr(p)} (MaxId:${e}) to ` + r;
        let c;
        for (;"_op_truncate" !== this.firstOp?.opFunName; ) try {
            await i.appendFile(u, {
                flush: !0
            });
            var d = this.totalSavedSize = a + p;
            return n && this.emit("save", e), void (o && o < d && !this.maxFileSizeEmitted && (this.supressMaxFileSizeEvent(), 
            this.emit("maxFileSize", d)));
        } catch (e) {
            logger.error(`Saving ${f} failed:`, e, "Truncated back to " + a), await i.truncate(a), 
            c = c ? Math.min(l, c * h) : 1, logger.log(`Retry in ${c} seconds`), 
            await sleep(c);
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
            filePath: i
        } = this;
        t && i == e || (await this._openFile(e), logger.info(`Switched from ${i} to ` + e));
    }
    async _openFile(t) {
        var {
            fileHandle: e,
            options: i
        } = this;
        this._resetParams();
        try {
            e && (e.close(), this.fileHandle = void 0), await ensureParentDir(t);
            var a = i.append;
            this.fileHandle = await open(t, a ? "a" : "w"), this.filePath = t, a && (this.totalSavedSize = await getSize(t));
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

Object.assign(module.exports, {
    QyBinWriter: QyBinWriter
});