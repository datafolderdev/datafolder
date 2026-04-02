import {
    join as t
} from "node:path";

import {
    open as f
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
    QySnapshots as n,
    iterPMBuffer as h
} from "./QySnapshots.js";

import {
    isEmptyObj as r,
    readBufferAsync as l
} from "./QyUtils.js";

export default class extends a {
    kvFolder;
    snapshotFolder;
    qySnapshots;
    qyKVDataCleaner;
    pMInfoMap = {};
    vLInfoMap = {};
    combinedSnapshotNumVerList = [];
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
            qyKVDataCleaner: new p(this, a, s)
        });
    }
    _op_start() {
        this.qyKVDataCleaner.start();
    }
    async _op_stop() {
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
                (null == i || r(i) || await M(a, s)) && (await t.savePosMap(s), 
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
                await M(a, s) && (await m(a, s), await e.saveKeyValueMap(s), {
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
        0 < s.length && e.push((async (t, a, s) => {
            let {
                qySnapshots: o,
                vLInfoMap: e,
                combinedSnapshotNumVerList: p
            } = t, n = o.getMaxCombinedSnapshot(a), {
                snapshotNum: i,
                info: r,
                keyValueMap: f
            } = (await m(t, n), n);
            Object.assign(n, {
                posMap: void 0,
                prefixPM: void 0
            });
            for (var h of a) if (h != n) {
                await m(t, h);
                let {
                    snapshotNum: a,
                    info: s,
                    keyValueMap: o
                } = h;
                p.push([ a, s.verList[0] ]), Object.assign(f, o), Object.assign(h, {
                    keyValueMap: void 0,
                    posMap: void 0,
                    prefixPM: void 0
                });
            }
            await o.saveKeyValueMap(n), e[i] = r, s.combinationUpdate = {
                snapshotNum: i,
                combinedSnapshotNumVerList: p,
                posMap: n.posMap
            };
        })(this, s, t)), await Promise.all(e), this.castParent("onCompactUpdates", t);
    }
    async _op_saveSnapshotInfos() {
        var a, s, {
            qySnapshots: o,
            pMInfoMap: t,
            vLInfoMap: e,
            combinedSnapshotNumVerList: p,
            qyKVDataCleaner: n
        } = this, i = (Object.assign(this, {
            pMInfoMap: {},
            vLInfoMap: {}
        }), []);
        for (a in t) i.push(o.saveSnapshotInfo(a, t[a]));
        for (s in e) i.push(o.saveSnapshotInfo(s, e[s]));
        await Promise.all(i);
        var r, f, h = [];
        for (r in t) {
            var l = t[r];
            h.push([ r, l.pMVersion ]);
        }
        for (f in e) {
            var M = e[f];
            h.push([ f, M.pMVersion ]), n.cleanVLFiles(f, M.vLVersion);
        }
        n.cleanPMFiles(h), 0 < p.length && (n.removeSnapshotsFiles(p), p.length = 0);
    }
}

async function M(a, s) {
    a = a.qySnapshots;
    let {
        prefixPM: o,
        posMap: t
    } = s;
    var e, p = a.getPMFilePath(s), n = await f(p);
    for (e of Object.keys(o).sort()) {
        var [ i, r ] = o[e], i = await l(p, n, i, r);
        if (!i) return n.close(), !1;
        h(i, (a, s) => t[a] = s);
    }
    return n.close(), !0;
}

async function m(a, s) {
    var o, a = a.qySnapshots, t = s.posMap, e = s.keyValueMap = {}, p = a.getVLFilePath(s), n = await f(p);
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