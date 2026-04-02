import {
    join as t
} from "node:path";

import {
    getDefaultOptions as o
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as a
} from "./QyMessageWorker.js";

import {
    QySnapshots as n
} from "./QySnapshots.js";

import {
    QyKVDataCleaner as p
} from "./QyKVDataCleaner.js";

import {
    logger as m
} from "./QyLogger.js";

export default class extends a {
    kvFolder;
    snapshotFolder;
    qySnapshots;
    qyKVDataCleaner;
    aclKeyValueMap = {};
    snapshotSavedChangeId = 0;
    maxChangeId;
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...o("QySnapshotSaver_Worker"),
            ...s
        }, [], [ "waitForSnapshotSaved" ]);
        var e = t(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            snapshotFolder: e,
            qySnapshots: new n(e, s),
            qyKVDataCleaner: new p(this, a, s)
        });
    }
    _op_start(a, s, e) {
        this.maxChangeId = a, this.qyKVDataCleaner.start(), s && this.waitForSnapshotSaved(h(this, s, a, e));
    }
    castSave(a, s, e) {
        var {
            aclKeyValueMap: t,
            qySnapshots: o
        } = this;
        o.applyCmdObj(s, t, e), this.maxChangeId = a;
    }
    async saveSnapshot(a) {
        var {
            maxChangeId: s,
            aclKeyValueMap: e
        } = this;
        this.aclKeyValueMap = {}, this.waitForSnapshotSaved(h(this, a, s, e));
    }
    releaseSnapshot(a) {
        var s, e = this.qySnapshots, {
            numToSnapshotMap: t,
            keyToSnapshotMap: o
        } = e, t = t[a], a = t.keyValueMap;
        for (s in delete t.keyValueMap, a) delete o[s];
        e.delSnapshot(t), global.gc && global.gc();
    }
    async _op_stop() {
        var {
            qySnapshots: a,
            qyKVDataCleaner: s,
            snapshotSavedChangeId: e
        } = this;
        return a.closeAllFDs(), await s.stop(), e;
    }
    async _op_waitForSnapshotSaved({
        saveMaxSnapshotInfoPromise: a,
        outdates: s
    }) {
        var e, {
            snapshotNum: a,
            maxChangeId: t
        } = await a, {
            emptySnapshotNumVerList: s,
            pMChangeList: o,
            vLChange: n,
            snapshotInfoMap: p,
            promises: h
        } = (this.snapshotSavedChangeId = t, s), {
            qyKVDataCleaner: r,
            qySnapshots: i,
            options: l
        } = this;
        for (e in r.cleanAclFiles(a), 0 < h.length && (await Promise.all(h), h.length = 0), 
        p) h.push(i.saveSnapshotInfo(e, p[e]));
        0 < h.length && (await Promise.all(h), h.length = 0), 0 < s.length && r.removeSnapshotsFiles(s), 
        0 < o.length && r.cleanPMFiles(o), 0 < n.length && r.cleanVLFiles(n[0], n[1]);
        let u;
        a = i.snapshotCount;
        0 < a && a >= l.maxInMemSnapshotCount && (delete (s = (a => {
            let s = a.qySnapshots.numToSnapshotMap, e;
            for (var t in s) {
                var o = s[t];
                (!e || e.snapshotNum > t) && (e = o);
            }
            return e;
        })(this)).prefixPM, delete (u = {
            ...s
        }).keyValueMap, delete s.posMap, s.isOut = !0, m.info("Sending snapshot " + s.snapshotNum)), 
        this.castParent("onSnapshotSavedChangeId", t, u);
    }
}

function h(a, s, e, t) {
    var o = (a => {
        var s, e = a.qySnapshots, {
            emptySnapshotNumVerList: t,
            combiningSnapshotList: a,
            pMCompactSnapshotList: o
        } = e.calOutdates(), n = {}, p = [], h = [], r = [];
        for (s of o) {
            var {
                snapshotNum: i,
                info: l
            } = s;
            p.push(e.savePosMap(s)), h.push([ i, l.pMVersion ]), n[i] = {
                ...l
            };
        }
        let u = a.length, m;
        if (0 < u) {
            var S, d = e.keyToSnapshotMap, {
                keyValueMap: y,
                info: o,
                snapshotNum: v
            } = m = e.getMaxCombinedSnapshot(a);
            for (S of a) if (m != S) {
                var g, {
                    keyValueMap: M,
                    snapshotNum: f,
                    info: C
                } = S;
                for (g in M) y[g] = M[g], d[g] = m;
                e.delSnapshot(S), t.push([ f, C.verList[0] ]);
            }
            p.push(e.saveKeyValueMap(m)), h.push([ v, o.pMVersion ]), r.push(v, o.vLVersion), 
            n[v] = {
                ...o
            };
        }
        return {
            emptySnapshotNumVerList: t,
            pMChangeList: h,
            vLChange: r,
            snapshotInfoMap: n,
            promises: p
        };
    })(a), s = {
        snapshotNum: s,
        keyValueMap: t,
        outdatedCount: 0,
        info: {
            maxChangeId: e,
            pMVersion: 0,
            vLVersion: 0,
            verList: []
        }
    }, t = (a.qySnapshots.addMaxSnapshot(s), (async (a, s) => {
        await (a = a.qySnapshots).saveKeyValueMap(s);
        var {
            snapshotNum: s,
            info: e
        } = s;
        return await a.saveSnapshotInfo(s, e), m.log("Created snapshot " + s), {
            snapshotNum: s,
            maxChangeId: e.maxChangeId
        };
    })(a, s));
    return {
        saveMaxSnapshotInfoPromise: t,
        outdates: o
    };
}