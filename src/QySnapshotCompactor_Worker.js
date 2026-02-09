import {
    join as t
} from "node:path";

import {
    open as h
} from "node:fs/promises";

import {
    getDefaultOptions as e
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as a
} from "./QyMessageWorker.js";

import {
    QyKVDataCleaner as p
} from "./QyKVDataCleaner.js";

import {
    QySnapshots as n
} from "./QySnapshots.js";

import {
    isEmptyObj as r,
    listToMap as y,
    readBufferAsync as l
} from "./QyUtils.js";

class s extends a {
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...e("QySnapshotCompactor_Worker"),
            ...s
        }, [], [ "compactSnapshots", "saveSnapshotInfos" ]);
        var o = t(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            snapshotFolder: o,
            qySnapshots: new n(o, s),
            qyKVDataCleaner: new p(this, a, s),
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
    async _op_compactSnapshots(a, o, s) {
        var t = {}, e = [];
        if (0 < a.length) {
            let s = t.pMUpdates = {};
            e.push(...a.map(a => (async (a, s, o) => {
                var {
                    qySnapshots: t,
                    pMInfoMap: e
                } = a, {
                    snapshotNum: p,
                    info: n,
                    prefixPM: i
                } = s;
                (null == i || r(i) || await f(a, s)) && (await t.savePosMap(s), 
                e[p] = n, o[p] = s.prefixPM);
            })(this, a, s)));
        }
        if (0 < o.length) {
            let s = t.vLUpdates = {};
            e.push(...o.map(a => (async (a, s, o) => {
                var t, {
                    qySnapshots: e,
                    vLInfoMap: p
                } = a;
                await f(a, s) && (await M(a, s), await e.saveKeyValueMap(s), {
                    snapshotNum: a,
                    info: e,
                    posMap: s,
                    prefixPM: t
                } = s, p[a] = e, o[a] = {
                    posMap: s,
                    prefixPM: t
                });
            })(this, a, s)));
        }
        0 < s.length && e.push((async (a, s, o) => {
            var t, {
                qySnapshots: e,
                vLInfoMap: p
            } = a, n = e.getMaxCombinedSnapshot(s), {
                snapshotNum: i,
                info: r,
                keyValueMap: f
            } = (await M(a, n), n), h = (Object.assign(n, {
                posMap: void 0,
                prefixPM: void 0
            }), []);
            for (t of s) t != n && (h.push(t.snapshotNum), await M(a, t), Object.assign(f, t.keyValueMap), 
            Object.assign(t, {
                keyValueMap: void 0,
                posMap: void 0,
                prefixPM: void 0
            }));
            await e.saveKeyValueMap(n), p[i] = r, o.combineUpdate = {
                snapshotNum: i,
                combinedSnapshotNumList: h,
                posMap: n.posMap
            };
        })(this, s, t)), await Promise.all(e), this.castParent("onCompactUpdates", t);
    }
    async _op_saveSnapshotInfos(a) {
        var s, o, {
            qySnapshots: t,
            pMInfoMap: e,
            vLInfoMap: p,
            qyKVDataCleaner: n
        } = this, i = (Object.assign(this, {
            pMInfoMap: {},
            vLInfoMap: {}
        }), y(a)), r = [];
        for (s in e) s in i && r.push(t.saveSnapshotInfo(s, e[s]));
        for (o in p) o in i && r.push(t.saveSnapshotInfo(o, p[o]));
        if (0 < r.length) {
            await Promise.all(r);
            var f, h, l = [];
            for (f in e) {
                var M = e[f];
                l.push([ f, M.pMVersion ]);
            }
            for (h in p) {
                var v = p[h];
                l.push([ h, v.pMVersion ]), n.cleanVLFiles(h, v.vLVersion);
            }
            n.cleanPMFiles(l);
        }
    }
}

async function f(a, s) {
    var o = a.qySnapshots;
    let {
        prefixPM: t,
        posMap: e
    } = s;
    var p, n = o.getPMFilePath(s), i = await h(n);
    for (p of Object.keys(t).sort()) {
        var [ r, f ] = t[p], r = await l(n, i, r, f);
        if (!r) return void i.close();
        o.iterPMBuffer(r, (a, s) => e[a] = s);
    }
    return i.close(), !0;
}

async function M(a, s) {
    var o, a = a.qySnapshots, t = s.posMap, e = s.keyValueMap = {}, p = a.getVLFilePath(s), n = await h(p);
    for (o of Object.keys(t).sort()) {
        var [ i, r ] = t[o];
        if (0 < r) {
            i = await l(p, n, i, r);
            if (!i) return void n.close();
            e[o] = i;
        } else e[o] = void 0;
    }
    return n.close(), !0;
}

export default s;