import {
    join as n
} from "node:path";

import {
    open as f
} from "node:fs/promises";

import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

import {
    QyKVDataSaver as p
} from "./QyKVDataSaver.js";

import {
    QySnapshotCompactor as i
} from "./QySnapshotCompactor.js";

import {
    QyKVDataCleaner as r
} from "./QyKVDataCleaner.js";

import {
    arrayLast as y,
    readBufferAsync as C,
    sleep as c
} from "./QyUtils.js";

import {
    logger as g
} from "./QyLogger.js";

class a {
    kvFolder;
    snapshotFolder;
    qyCache;
    options;
    qyKVDataSaver;
    qySnapshotCompactor;
    qyKVDataCleaner;
    compactState = 1;
    compactMaxChangeId = 0;
    snapshotSavedChangeId = 0;
    maxChangeId = 0;
    emptySnapshotNumVerList = [];
    isStopping = !1;
    qySnapshots;
    aclKeyValueMap;
    compactInterval;
    unloadInterval;
    constructor(a, t, o) {
        t = {
            ...s("QyKVData"),
            ...t
        };
        var e = n(a, "snapshot");
        Object.assign(this, {
            qyCache: o,
            options: t,
            kvFolder: a,
            snapshotFolder: e,
            qyKVDataSaver: new p(this, a, t),
            qySnapshotCompactor: new i(this, a, t),
            qyKVDataCleaner: new r(this, a, t)
        });
    }
    start(a, t, o, e) {
        var {
            options: n,
            qyKVDataSaver: s,
            qySnapshotCompactor: p,
            qyKVDataCleaner: i
        } = this, {
            maxSnapshotNum: r,
            snapshotMaxChangeId: h
        } = o, s = (s.start(a, r, t, e), p.start(), i.start(), setInterval(() => l(this), n.compactSnapshotsInterval)), r = setInterval(() => (async o => {
            if (!o.unloadingMemory) {
                o.unloadingMemory = !0;
                var {
                    qyCache: e,
                    options: n
                } = o;
                let a = 0, t = 0;
                if (e) {
                    var s, p = n.maxFileCountToUnload, n = e.rootDir;
                    t = d(o, n), a = t;
                    for (s of n.allLoadedSubdirs()) if ((t += d(o, s)) > p && (a += t, 
                    t = 0, await c(0), o.isStopping)) break;
                }
                a += t, global.gc && global.gc(), o.unloadingMemory = !1;
            }
        })(this), n.unloadMemInterval);
        return Object.assign(this, {
            maxChangeId: a,
            snapshotSavedChangeId: h,
            qySnapshots: o,
            aclKeyValueMap: e,
            compactInterval: s,
            unloadInterval: r
        }), n.bgLoadPosMaps ? (async a => {
            var t, {
                qySnapshots: o,
                options: e
            } = a;
            console.time("bgLoadPosMaps");
            for (t of Object.keys(o.numToSnapshotMap).sort((a, t) => t - a)) {
                if (await async function s(p, i, r = void 0, h = void 0, c = void 0, l = void 0) {
                    if (p.isStopping) return void (l && l.close());
                    let d = p.qySnapshots;
                    let m = d.numToSnapshotMap;
                    let S = m[i];
                    if (!S) return void (l && l.close());
                    let {
                        info: u,
                        prefixPM: v
                    } = S;
                    r = r || Object.keys(v).sort().reverse();
                    if (0 == r.length) return void (l && l.close());
                    if (null == h || h != u.pMVersion) return l && l.close(), c = d.getPMFilePath(S), 
                    s(p, i, r, u.pMVersion, c, await f(c));
                    for (;0 < r.length; ) {
                        let e = y(r), n = v[e];
                        if (n) {
                            let [ a, t ] = n, o = await C(c, l, a, t);
                            if (p.isStopping || !m[i]) return void l.close();
                            if (h != u.pMVersion) return l.close(), s(p, i, r);
                            e in v && d.loadPartialPosMapBuffer(S, e, o);
                        }
                        r.pop();
                    }
                    l.close();
                    g.info("bgLoadPosMap:" + i);
                }(a, t), a.isStopping) break;
                if (await c(0), a.isStopping) break;
            }
            console.timeEnd("bgLoadPosMaps"), !a.isStopping && e.compactAtStart && l(a);
        })(this) : n.compactAtStart && l(this), this;
    }
    async stop() {
        this.isStopping = !0;
        var {
            qyKVDataSaver: a,
            qySnapshotCompactor: t,
            qySnapshots: o,
            compactInterval: e,
            unloadInterval: n,
            qyKVDataCleaner: s
        } = this;
        clearInterval(e), clearInterval(n), this.onSnapshotSavedChangeId(await a.stop()), 
        o && o.closeAllFDs(), await t.stop(), await s.stop();
    }
    save(a, t, o, e) {
        var n = this.qyKVDataSaver;
        if (e) return n.callSave(a, t, o);
        n.castSave(a, t, o);
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
            aclKeyValueMap: o
        } = this;
        return a in o ? o[a] : t.getValueSync(a);
    }
    removeKey(a) {
        var {
            qySnapshots: t,
            aclKeyValueMap: o
        } = this;
        if (!(a in o)) return t.removeKey(a);
        o[a] = void 0;
    }
    onSnapshotSavedChangeId(a, t = void 0) {
        this.snapshotSavedChangeId = a;
        var {
            compactState: o,
            compactMaxChangeId: e,
            qyKVDataSaver: n
        } = this;
        if (3 == o && e <= a && (L(this), this.compactState = 1), t) {
            var s, o = t, p = this.qySnapshots, i = p.keyToSnapshotMap;
            for (s in o.posMap) {
                var r = i[s];
                r && p.removeKeyFromSnapshot(r, s);
            }
            p.addMaxSnapshot(o), g.info("addPMOnlySnapshot: " + p.snapshotMaxChangeId), 
            n.releaseSnapshot(t.snapshotNum);
        }
    }
    onCompactUpdates(a) {
        if (2 == this.compactState) {
            var l = this, {
                pMUpdates: a,
                vLUpdates: d,
                combinationUpdate: m
            } = a = a;
            if (a) {
                var t = a, o = l.qySnapshots.numToSnapshotMap;
                for (s in t) {
                    var e, n = t[s], s = o[s], {
                        prefixPM: p,
                        info: i
                    } = s;
                    for (e in ++i.pMVersion, i.verList[0] = i.pMVersion + i.vLVersion, 
                    p) p[e] = n[e];
                    (a => {
                        var {
                            info: t,
                            compactOutedCount: o
                        } = a;
                        t.outdatedCount += o, a.outdatedCount -= o, a.compactOutedCount = 0;
                    })(s);
                }
            }
            if (d) {
                var r = d, h = (a = l).qySnapshots.numToSnapshotMap;
                for (f in r) {
                    var c, S, {
                        posMap: u,
                        prefixPM: v
                    } = r[f], f = h[f], {
                        posMap: y,
                        prefixPM: C,
                        info: g
                    } = f;
                    for (c in ++g.pMVersion, ++g.vLVersion, g.verList[0] = g.pMVersion + g.vLVersion, 
                    y) y[c] = u[c];
                    for (S in C) C[S] = v[S];
                    q(f);
                }
            }
            if (m) {
                var M, d = m;
                let e = l.qySnapshots, {
                    numToSnapshotMap: n,
                    keyToSnapshotMap: s
                } = e, {
                    snapshotNum: a,
                    combinedSnapshotNumVerList: t,
                    posMap: p
                } = d, i = n[a], {
                    posMap: r,
                    info: o
                } = i;
                for (M in ++o.pMVersion, ++o.vLVersion, o.verList[0] = o.pMVersion + o.vLVersion, 
                r) r[M] = p[M];
                q(i);
                let h = o.totalCount, c = i.outdatedCount;
                for (let [ o ] of t) {
                    var V, I = n[o];
                    let {
                        posMap: a,
                        info: t
                    } = I;
                    for (V in a) r[V] = p[V], s[V] = i;
                    q(I), h += t.totalCount, c += I.outdatedCount, e.delSnapshot(I);
                }
                o.totalCount = h, i.outdatedCount = c;
            }
            this.snapshotSavedChangeId >= this.compactMaxChangeId ? (L(this), this.compactState = 1) : this.compactState = 3;
        }
    }
}

function q(a) {
    var {
        info: t,
        compactOutedCount: o
    } = a;
    t.totalCount -= t.outdatedCount + o, t.outdatedCount = 0, a.outdatedCount -= o, 
    a.compactOutedCount = 0;
}

function l(a) {
    if (1 == a.compactState) {
        var {
            maxChangeId: t,
            qySnapshots: o,
            qySnapshotCompactor: e
        } = a, {
            emptySnapshotNumVerList: o,
            pMCompactSnapshotList: n,
            vLCompactSnapshotList: s,
            combiningSnapshotList: p
        } = o.calOutdates();
        if (0 < p.length || 0 < n.length || 0 < s.length) {
            Object.assign(a, {
                compactState: 2,
                compactMaxChangeId: t
            });
            for (var i of [ n, s, p ]) for (var r of i) r.compactOutedCount = r.outdatedCount;
            e.compactSnapshots(n, s, p);
        }
        0 < o.length && (a.emptySnapshotNumVerList.push(...o), a.snapshotSavedChangeId >= t ? h(a) : 1 == a.compactState && Object.assign(a, {
            compactState: 3,
            compactMaxChangeId: t
        }));
    }
}

function d(a, t) {
    var o = a.qySnapshots.snapshotMaxChangeId;
    let e = 0;
    if (t.fileMapLoaded) for (var n of t.fileList) ++e, n.cChangeId <= o && (n.visited ? n.visited = !1 : n.unloadFileContent());
    return e;
}

function h(a) {
    var {
        qyKVDataCleaner: a,
        emptySnapshotNumVerList: t
    } = a;
    0 < t.length && (a.removeSnapshotsFiles(t), t.length = 0);
}

function L(a) {
    a.qySnapshotCompactor.saveSnapshotInfos(), h(a);
}

export {
    a as QyKVData
};