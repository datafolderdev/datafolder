let path = require("node:path"), fsPromises = require("node:fs/promises"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, QyKVDataCleaner = require("./QyKVDataCleaner.js").QyKVDataCleaner, QySnapshots = require("./QySnapshots.js").QySnapshots, {
    isEmptyObj,
    listToMap,
    readBufferAsync
} = require("./QyUtils.js");

class QySnapshotCompactor_Worker extends QyMessageWorker {
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...getDefaultOptions("QySnapshotCompactor_Worker"),
            ...s
        }, [], [ "compactSnapshots", "saveSnapshotInfos" ]);
        var e = path.join(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            snapshotFolder: e,
            qySnapshots: new QySnapshots(e, s),
            qyKVDataCleaner: new QyKVDataCleaner(this, a, s),
            pMInfoMap: {},
            vLInfoMap: {}
        });
    }
    start() {
        this.qyKVDataCleaner.start();
    }
    async stop() {
        await this.qyKVDataCleaner.stop();
    }
    async _op_compactSnapshots(a, e, s) {
        var o = {}, t = [];
        if (0 < a.length) {
            let s = o.pMUpdates = {};
            t.push(...a.map(a => this._compactPosMap(a, s)));
        }
        if (0 < e.length) {
            let s = o.vLUpdates = {};
            t.push(...e.map(a => this._compactValueList(a, s)));
        }
        0 < s.length && t.push(this._combinePMLoadedSnapshots(s, o)), await Promise.all(t), 
        this.castParent("onCompactUpdates", o);
    }
    async _op_saveSnapshotInfos(a) {
        var s, e, {
            qySnapshots: o,
            pMInfoMap: t,
            vLInfoMap: p,
            qyKVDataCleaner: n
        } = this, i = (Object.assign(this, {
            pMInfoMap: {},
            vLInfoMap: {}
        }), listToMap(a)), r = [];
        for (s in t) s in i && r.push(o.saveSnapshotInfo(s, t[s]));
        for (e in p) e in i && r.push(o.saveSnapshotInfo(e, p[e]));
        if (0 < r.length) {
            await Promise.all(r);
            var h, l, M = [];
            for (h in t) {
                var f = t[h];
                M.push([ h, f.pMVersion ]);
            }
            for (l in p) {
                var y = p[l];
                M.push([ l, y.pMVersion ]), n.cleanVLFiles(l, y.vLVersion);
            }
            n.cleanPMFiles(M);
        }
    }
    async _combinePMLoadedSnapshots(a, s) {
        var e, {
            qySnapshots: o,
            vLInfoMap: t
        } = this, p = o.getMaxCombinedSnapshot(a), {
            snapshotNum: n,
            info: i,
            keyValueMap: r
        } = (await this._loadKVMap(p), p), h = (Object.assign(p, {
            posMap: void 0,
            prefixPM: void 0
        }), []);
        for (e of a) e != p && (h.push(e.snapshotNum), await this._loadKVMap(e), 
        Object.assign(r, e.keyValueMap), Object.assign(e, {
            keyValueMap: void 0,
            posMap: void 0,
            prefixPM: void 0
        }));
        await o.saveKeyValueMap(p), t[n] = i, s.combineUpdate = {
            snapshotNum: n,
            combinedSnapshotNumList: h,
            posMap: p.posMap
        };
    }
    async _compactValueList(a, s) {
        var e, o, {
            qySnapshots: t,
            vLInfoMap: p
        } = this;
        await this._loadPosMap(a) && (await this._loadKVMap(a), await t.saveKeyValueMap(a), 
        {
            snapshotNum: t,
            info: a,
            posMap: e,
            prefixPM: o
        } = a, p[t] = a, s[t] = {
            posMap: e,
            prefixPM: o
        });
    }
    async _compactPosMap(a, s) {
        var {
            qySnapshots: e,
            pMInfoMap: o
        } = this, {
            snapshotNum: t,
            info: p,
            prefixPM: n
        } = a;
        (null == n || isEmptyObj(n) || await this._loadPosMap(a)) && (await e.savePosMap(a), 
        o[t] = p, s[t] = a.prefixPM);
    }
    async _loadPosMap(a) {
        var s = this.qySnapshots;
        let {
            prefixPM: e,
            posMap: o
        } = a;
        var t, p = s.getPMFilePath(a), n = await fsPromises.open(p);
        for (t of Object.keys(e).sort()) {
            var [ i, r ] = e[t], i = await readBufferAsync(p, n, i, r);
            if (!i) return void n.close();
            s.iterPMBuffer(i, (a, s) => o[a] = s);
        }
        return n.close(), !0;
    }
    async _loadKVMap(a) {
        var s, e = this.qySnapshots, o = a.posMap, t = a.keyValueMap = {}, p = e.getVLFilePath(a), n = await fsPromises.open(p);
        for (s of Object.keys(o).sort()) {
            var [ i, r ] = o[s];
            if (0 < r) {
                i = await readBufferAsync(p, n, i, r);
                if (!i) return void n.close();
                t[s] = i;
            } else t[s] = void 0;
        }
        return n.close(), !0;
    }
}

module.exports = QySnapshotCompactor_Worker;