let path = require("node:path"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, QySnapshots = require("./QySnapshots.js").QySnapshots, QyKVDataCleaner = require("./QyKVDataCleaner.js").QyKVDataCleaner;

class QySnapshotSaver_Worker extends QyMessageWorker {
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...getDefaultOptions("QySnapshotSaver_Worker"),
            ...s
        }, [ "stop", "waitForSnapshotSaved" ]);
        var e = path.join(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            snapshotFolder: e,
            qySnapshots: new QySnapshots(e, s),
            qyKVDataCleaner: new QyKVDataCleaner(this, a, s),
            aclKeyValueMap: {}
        });
    }
    start(a, s, e) {
        this.maxChangeId = a, this.qyKVDataCleaner.start(), s && this.waitForSnapshotSaved(this._createMaxSnapshot(s, a, e));
    }
    castSave(a, s, e) {
        var {
            aclKeyValueMap: t,
            qySnapshots: n
        } = this;
        n.applyCmdObj(s, t, e), this.maxChangeId = a;
    }
    async saveSnapshot(a) {
        var {
            maxChangeId: s,
            aclKeyValueMap: e
        } = this;
        this.aclKeyValueMap = {}, this.waitForSnapshotSaved(this._createMaxSnapshot(a, s, e));
    }
    releaseSnapshot(a) {
        var s, e = this.qySnapshots, {
            numToSnapshotMap: t,
            keyToSnapshotMap: n
        } = e, t = t[a], a = t.keyValueMap;
        for (s in delete t.keyValueMap, a) delete n[s];
        e.delSnapshot(t), global.gc && global.gc();
    }
    _createMaxSnapshot(a, s, e) {
        var t = this._processOutdates(), a = {
            snapshotNum: a,
            keyValueMap: e,
            outdatedCount: 0,
            info: {
                maxChangeId: s,
                pMVersion: 0,
                vLVersion: 0
            }
        }, e = (this.qySnapshots.addMaxSnapshot(a), this._saveKeyValueMapAndSnapshotInfo(a));
        return {
            saveMaxSnapshotInfoPromise: e,
            outdates: t
        };
    }
    async _saveKeyValueMapAndSnapshotInfo(a) {
        var s = this.qySnapshots, {
            snapshotNum: a,
            info: e
        } = (await s.saveKeyValueMap(a), a);
        return await s.saveSnapshotInfo(a, e), logger.log("Created snapshot " + a), 
        {
            snapshotNum: a,
            maxChangeId: e.maxChangeId
        };
    }
    _processOutdates() {
        var a, s = this.qySnapshots, {
            emptySnapshotNumList: e,
            combiningSnapshotList: t,
            pMCompactSnapshotList: n
        } = s.calOutdates(), o = {}, p = [], h = [], r = [];
        for (a of n) {
            var {
                snapshotNum: i,
                info: l
            } = a;
            p.push(s.savePosMap(a)), h.push([ i, l.pMVersion ]), o[i] = {
                ...l
            };
        }
        n = t.length;
        if (0 < n) {
            var u, S, y = s.keyToSnapshotMap, {
                keyValueMap: M,
                info: n,
                snapshotNum: d
            } = u = s.getMaxCombinedSnapshot(t);
            for (S of t) if (u != S) {
                var g, {
                    keyValueMap: v,
                    snapshotNum: m
                } = S;
                for (g in v) M[g] = v[g], y[g] = u;
                s.delSnapshot(S), e.push(m);
            }
            p.push(s.saveKeyValueMap(u)), h.push([ d, n.pMVersion ]), r.push(d, n.vLVersion), 
            o[d] = {
                ...n
            };
        }
        return {
            emptySnapshotNumList: e,
            pMChangeList: h,
            vLChange: r,
            snapshotInfoMap: o,
            promises: p
        };
    }
    async _op_stop() {
        var {
            qySnapshots: a,
            qyKVDataCleaner: s
        } = this;
        a.closeAllFDs(), await s.stop();
    }
    async _op_waitForSnapshotSaved({
        saveMaxSnapshotInfoPromise: a,
        outdates: s
    }) {
        var e, {
            snapshotNum: a,
            maxChangeId: t
        } = await a, {
            emptySnapshotNumList: s,
            pMChangeList: n,
            vLChange: o,
            snapshotInfoMap: p,
            promises: h
        } = s, {
            qyKVDataCleaner: r,
            qySnapshots: i,
            options: l
        } = this;
        for (e in r.cleanAclFiles(a), 0 < h.length && await Promise.all(h), h.length = 0, 
        p) h.push(i.saveSnapshotInfo(e, p[e]));
        0 < h.length && await Promise.all(h), 0 < s.length && r.removeSnapshotsFiles(s), 
        0 < n.length && r.cleanPMFiles(n), 0 < o.length && r.cleanVLFiles(o[0], o[1]);
        let u;
        a = i.snapshotCount;
        0 < a && a >= l.maxInMemSnapshotCount && (delete (s = this._getMinSnapshot()).prefixPM, 
        delete (u = {
            ...s
        }).keyValueMap, delete s.posMap, s.isOut = !0, logger.info("Sending snapshot " + s.snapshotNum)), 
        this.castParent("onSnapshotSavedChangeId", t, u);
    }
    _getMinSnapshot() {
        var a, s = this.qySnapshots.numToSnapshotMap;
        let e;
        for (a in s) {
            var t = s[a];
            (!e || e.snapshotNum > a) && (e = t);
        }
        return e;
    }
}

module.exports = QySnapshotSaver_Worker;