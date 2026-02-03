let path = require("node:path"), fsPromises = require("node:fs/promises"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyKVDataSaver = require("./QyKVDataSaver.js").QyKVDataSaver, QySnapshotCompactor = require("./QySnapshotCompactor.js").QySnapshotCompactor, QyKVDataCleaner = require("./QyKVDataCleaner.js").QyKVDataCleaner, {
    arrayLast,
    readBufferAsync,
    sleep
} = require("./QyUtils.js"), Idle = 1, WaitForCompactUpdates = 2, WaitForSnapshotSaved = 3;

class QyKVData {
    constructor(a, t, s) {
        t = {
            ...getDefaultOptions("QyKVData"),
            ...t
        };
        var o = path.join(a, "snapshot");
        Object.assign(this, {
            qyCache: s,
            options: t,
            kvFolder: a,
            snapshotFolder: o,
            qyKVDataSaver: new QyKVDataSaver(this, a, t),
            qySnapshotCompactor: new QySnapshotCompactor(this, a, t),
            qyKVDataCleaner: new QyKVDataCleaner(this, a, t),
            compactState: Idle,
            compactMaxChangeId: 0,
            snapshotSavedChangeId: 0,
            snapshotInfoNumList: [],
            emptySnapshotNumList: []
        });
    }
    start(a, t, s, o) {
        var {
            options: e,
            qyKVDataSaver: n,
            qySnapshotCompactor: p,
            qyKVDataCleaner: i
        } = this, n = (n.start(a, s.maxSnapshotNum, t, o), p.start(), i.start(), 
        setInterval(() => this._compactSnapshots(), e.compactSnapshotsInterval)), t = setInterval(() => this._unloadMemory(), e.unloadMemInterval);
        return Object.assign(this, {
            maxChangeId: a,
            qySnapshots: s,
            aclKeyValueMap: o,
            compactInterval: n,
            unloadInterval: t
        }), e.bgLoadPosMaps && this._bgLoadPosMaps(), this;
    }
    async stop() {
        this.isStopping = !0;
        var {
            qyKVDataSaver: a,
            qySnapshotCompactor: t,
            qySnapshots: s,
            compactInterval: o,
            unloadInterval: e,
            qyKVDataCleaner: n
        } = this;
        clearInterval(o), clearInterval(e), await a.stop(), s && s.closeAllFDs(), 
        await t.stop(), await n.stop();
    }
    save(a, t, s, o) {
        var e = this.qyKVDataSaver;
        if (o) return e.callSave(a, t, s);
        e.castSave(a, t, s);
    }
    increaseChangeId() {
        return ++this.maxChangeId;
    }
    decreaseChangeId() {
        --this.maxChangeId;
    }
    getValueSync(a) {
        var {
            qySnapshots: t,
            aclKeyValueMap: s
        } = this;
        return a in s ? s[a] : t.getValueSync(a);
    }
    removeKey(a) {
        var {
            qySnapshots: t,
            aclKeyValueMap: s
        } = this;
        if (!(a in s)) return t.removeKey(a);
        s[a] = void 0;
    }
    onSnapshotSavedChangeId(a, t) {
        this.snapshotSavedChangeId = a, this.compactState == WaitForSnapshotSaved && a >= this.compactMaxChangeId && this._finishCompactUpdates(), 
        t && (this._addPMOnlySnapshot(t), this.qyKVDataSaver.releaseSnapshot(t.snapshotNum));
    }
    onCompactUpdates(a) {
        this.compactState == WaitForCompactUpdates && (this._processCompactUpdates(a), 
        this.snapshotSavedChangeId >= this.compactMaxChangeId ? this._finishCompactUpdates() : this.compactState = WaitForSnapshotSaved);
    }
    _addPMOnlySnapshot(a) {
        var t, s = this.qySnapshots, o = s.keyToSnapshotMap;
        for (t in a.posMap) {
            var e = o[t];
            e && s.removeKeyFromSnapshot(e, t);
        }
        s.addMaxSnapshot(a), logger.info("addPMOnlySnapshot: " + s.snapshotMaxChangeId);
    }
    _finishCompactUpdates() {
        var {
            qySnapshotCompactor: a,
            qyKVDataCleaner: t,
            snapshotInfoNumList: s,
            emptySnapshotNumList: o
        } = this;
        a.saveSnapshotInfos(s), (s.length = 0) < o.length && (t.removeSnapshotsFiles(o), 
        o.length = 0), this.compactState = Idle;
    }
    _processCompactUpdates(a) {
        var {
            pMUpdates: a,
            vLUpdates: t,
            combineUpdate: s
        } = a;
        a && this._processPMUpdates(a), t && this._processVLUpdates(t), s && this._processCombineUpdate(s);
    }
    _processCombineUpdate(a) {
        var {
            qySnapshots: o,
            snapshotInfoNumList: t,
            emptySnapshotNumList: s
        } = this, {
            numToSnapshotMap: e,
            keyToSnapshotMap: n
        } = o;
        let {
            snapshotNum: p,
            combinedSnapshotNumList: i,
            posMap: r
        } = a;
        var h, c = e[p];
        let {
            posMap: l,
            info: d
        } = c;
        for (h in l) l[h] = r[h];
        this._countLVCompact(c);
        let u = d.totalCount, m = c.outdatedCount;
        for (let s of i) {
            var S, y = e[s];
            let {
                posMap: a,
                info: t
            } = y;
            for (S in a) l[S] = r[S], n[S] = c;
            this._countLVCompact(y), u += t.totalCount, m += y.outdatedCount, o.delSnapshot(y);
        }
        s.push(...i), (u == m ? s : (++d.pMVersion, ++d.vLVersion, d.totalCount = u, 
        c.outdatedCount = m, t)).push(p);
    }
    _processVLUpdates(a) {
        var t, {
            qySnapshots: s,
            snapshotInfoNumList: o,
            emptySnapshotNumList: e
        } = this, n = s.numToSnapshotMap;
        for (t in a) {
            var p = n[t];
            if (s.isEmptySnapshot(p)) s.delSnapshot(p), e.push(t); else {
                var i, r, {
                    posMap: h,
                    prefixPM: c
                } = a[t], {
                    posMap: l,
                    prefixPM: d,
                    info: u
                } = p;
                for (i in l) l[i] = h[i];
                for (r in d) d[r] = c[r];
                ++u.pMVersion, ++u.vLVersion, this._countLVCompact(p), o.push(t);
            }
        }
    }
    _countLVCompact(a) {
        var {
            info: t,
            compactOutedCount: s
        } = a;
        t.totalCount -= t.outdatedCount + s, t.outdatedCount = 0, a.outdatedCount -= s, 
        a.compactOutedCount = 0;
    }
    _countPMCompact(a) {
        var {
            info: t,
            compactOutedCount: s
        } = a;
        t.outdatedCount += s, a.outdatedCount -= s, a.compactOutedCount = 0;
    }
    _processPMUpdates(a) {
        var t, {
            qySnapshots: s,
            snapshotInfoNumList: o,
            emptySnapshotNumList: e
        } = this, n = s.numToSnapshotMap;
        for (t in a) {
            var p = n[t];
            if (s.isEmptySnapshot(p)) s.delSnapshot(p), e.push(t); else {
                var i, r = a[t], {
                    prefixPM: h,
                    info: c
                } = p;
                for (i in h) h[i] = r[i];
                ++c.pMVersion, this._countPMCompact(p), o.push(t);
            }
        }
    }
    _compactSnapshots() {
        if (this.compactState == Idle) {
            var {
                maxChangeId: a,
                qySnapshots: t,
                qySnapshotCompactor: s
            } = this, {
                emptySnapshotNumList: t,
                pMCompactSnapshotList: o,
                vLCompactSnapshotList: e,
                combiningSnapshotList: n
            } = t.calOutdates();
            if (0 < t.length && this.emptySnapshotNumList.push(...t), 0 < n.length || 0 < o.length || 0 < e.length) {
                Object.assign(this, {
                    compactState: WaitForCompactUpdates,
                    compactMaxChangeId: a
                });
                for (var p of [ o, e, n ]) for (var i of p) i.compactOutedCount = i.outdatedCount;
                s.compactSnapshots(o, e, n);
            }
        }
    }
    async _bgLoadPosMaps() {
        for (var a of Object.keys(this.qySnapshots.numToSnapshotMap).sort((a, t) => t - a)) {
            if (await this._bgLoadPosMap(a), this.isStopping) break;
            if (await sleep(0), this.isStopping) break;
        }
    }
    async _bgLoadPosMap(a, t, s, o, e) {
        if (this.isStopping) e && e.close(); else {
            var n = this.qySnapshots, p = n.numToSnapshotMap, i = p[a];
            if (i) {
                var {
                    info: r,
                    prefixPM: h
                } = i;
                if (0 == (t = t || Object.keys(h).sort().reverse()).length) e && e.close(); else {
                    if (null == s || s != r.pMVersion) return e && e.close(), o = n.getPMFilePath(i), 
                    this._bgLoadPosMap(a, t, r.pMVersion, o, await fsPromises.open(o));
                    for (;0 < t.length; ) {
                        var c = arrayLast(t), l = h[c];
                        if (l) {
                            var [ l, d ] = l, l = await readBufferAsync(o, e, l, d);
                            if (this.isStopping || !p[a]) return void e.close();
                            if (s != r.pMVersion) return e.close(), this._bgLoadPosMap(a, t);
                            c in h && n.loadPartialPosMapBuffer(i, c, l);
                        }
                        t.pop();
                    }
                    e.close(), logger.info("bgLoadPosMap:" + a);
                }
            } else e && e.close();
        }
    }
    async _unloadMemory() {
        if (!this.unloadingMemory) {
            this.unloadingMemory = !0;
            var {
                qyCache: s,
                options: o
            } = this;
            let a = 0, t = 0;
            if (s) {
                var e, n = o.maxFileCountToUnload, o = s.rootDir;
                t = this._unloadDirFilesMem(o), a = t;
                for (e of o.allLoadedSubdirs()) if ((t += this._unloadDirFilesMem(e)) > n && (a += t, 
                t = 0, await sleep(0), this.isStopping)) break;
            }
            a += t, global.gc && global.gc(), this.unloadingMemory = !1;
        }
    }
    _unloadDirFilesMem(a) {
        var t = this.qySnapshots.snapshotMaxChangeId;
        let s = 0;
        if (a.fileMapLoaded) for (var o of a.fileList) ++s, o.cChangeId <= t && (o.visited ? o.visited = !1 : o.unloadFileContent());
        return s;
    }
}

Object.assign(module.exports, {
    QyKVData: QyKVData
});