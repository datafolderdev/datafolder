import {
    join as e
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

class s extends a {
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...o("QySnapshotSaver_Worker"),
            ...s
        }, [ "stop", "waitForSnapshotSaved" ]);
        var t = e(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            snapshotFolder: t,
            qySnapshots: new n(t, s),
            qyKVDataCleaner: new p(this, a, s),
            aclKeyValueMap: {}
        });
    }
    start(a, s, t) {
        this.maxChangeId = a, this.qyKVDataCleaner.start(), s && this.waitForSnapshotSaved(h(this, s, a, t));
    }
    castSave(a, s, t) {
        var {
            aclKeyValueMap: e,
            qySnapshots: o
        } = this;
        o.applyCmdObj(s, e, t), this.maxChangeId = a;
    }
    async saveSnapshot(a) {
        var {
            maxChangeId: s,
            aclKeyValueMap: t
        } = this;
        this.aclKeyValueMap = {}, this.waitForSnapshotSaved(h(this, a, s, t));
    }
    releaseSnapshot(a) {
        var s, t = this.qySnapshots, {
            numToSnapshotMap: e,
            keyToSnapshotMap: o
        } = t, e = e[a], a = e.keyValueMap;
        for (s in delete e.keyValueMap, a) delete o[s];
        t.delSnapshot(e), global.gc && global.gc();
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
        var t, {
            snapshotNum: a,
            maxChangeId: e
        } = await a, {
            emptySnapshotNumList: s,
            pMChangeList: o,
            vLChange: n,
            snapshotInfoMap: p,
            promises: h
        } = s, {
            qyKVDataCleaner: r,
            qySnapshots: i,
            options: l
        } = this;
        for (t in r.cleanAclFiles(a), 0 < h.length && await Promise.all(h), h.length = 0, 
        p) h.push(i.saveSnapshotInfo(t, p[t]));
        0 < h.length && await Promise.all(h), 0 < s.length && r.removeSnapshotsFiles(s), 
        0 < o.length && r.cleanPMFiles(o), 0 < n.length && r.cleanVLFiles(n[0], n[1]);
        let u;
        a = i.snapshotCount;
        0 < a && a >= l.maxInMemSnapshotCount && (delete (s = (a => {
            let s = a.qySnapshots.numToSnapshotMap, t;
            for (var e in s) {
                var o = s[e];
                (!t || t.snapshotNum > e) && (t = o);
            }
            return t;
        })(this)).prefixPM, delete (u = {
            ...s
        }).keyValueMap, delete s.posMap, s.isOut = !0, logger.info("Sending snapshot " + s.snapshotNum)), 
        this.castParent("onSnapshotSavedChangeId", e, u);
    }
}

function h(a, s, t, e) {
    var o = (a => {
        var s, t = a.qySnapshots, {
            emptySnapshotNumList: e,
            combiningSnapshotList: a,
            pMCompactSnapshotList: o
        } = t.calOutdates(), n = {}, p = [], h = [], r = [];
        for (s of o) {
            var {
                snapshotNum: i,
                info: l
            } = s;
            p.push(t.savePosMap(s)), h.push([ i, l.pMVersion ]), n[i] = {
                ...l
            };
        }
        let u = a.length, m;
        if (0 < u) {
            var S, y = t.keyToSnapshotMap, {
                keyValueMap: d,
                info: o,
                snapshotNum: v
            } = m = t.getMaxCombinedSnapshot(a);
            for (S of a) if (m != S) {
                var g, {
                    keyValueMap: M,
                    snapshotNum: f
                } = S;
                for (g in M) d[g] = M[g], y[g] = m;
                t.delSnapshot(S), e.push(f);
            }
            p.push(t.saveKeyValueMap(m)), h.push([ v, o.pMVersion ]), r.push(v, o.vLVersion), 
            n[v] = {
                ...o
            };
        }
        return {
            emptySnapshotNumList: e,
            pMChangeList: h,
            vLChange: r,
            snapshotInfoMap: n,
            promises: p
        };
    })(a), s = {
        snapshotNum: s,
        keyValueMap: e,
        outdatedCount: 0,
        info: {
            maxChangeId: t,
            pMVersion: 0,
            vLVersion: 0
        }
    }, e = (a.qySnapshots.addMaxSnapshot(s), (async (a, s) => {
        await (a = a.qySnapshots).saveKeyValueMap(s);
        var {
            snapshotNum: s,
            info: t
        } = s;
        return await a.saveSnapshotInfo(s, t), logger.log("Created snapshot " + s), 
        {
            snapshotNum: s,
            maxChangeId: t.maxChangeId
        };
    })(a, s));
    return {
        saveMaxSnapshotInfoPromise: e,
        outdates: o
    };
}

export default s;