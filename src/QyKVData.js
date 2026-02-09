import {
    join as n
} from "node:path";

import {
    open as v
} from "node:fs/promises";

import {
    getDefaultOptions as e
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
    readBufferAsync as g,
    sleep as c
} from "./QyUtils.js";

class t {
    constructor(t, a, o) {
        a = {
            ...e("QyKVData"),
            ...a
        };
        var s = n(t, "snapshot");
        Object.assign(this, {
            qyCache: o,
            options: a,
            kvFolder: t,
            snapshotFolder: s,
            qyKVDataSaver: new p(this, t, a),
            qySnapshotCompactor: new i(this, t, a),
            qyKVDataCleaner: new r(this, t, a),
            compactState: 1,
            compactMaxChangeId: 0,
            snapshotSavedChangeId: 0,
            snapshotInfoNumList: [],
            emptySnapshotNumList: []
        });
    }
    start(t, a, o, s) {
        var {
            options: n,
            qyKVDataSaver: e,
            qySnapshotCompactor: p,
            qyKVDataCleaner: i
        } = this, {
            maxSnapshotNum: r,
            snapshotMaxChangeId: h
        } = o, e = (e.start(t, r, a, s), p.start(), i.start(), setInterval(() => l(this), n.compactSnapshotsInterval)), r = setInterval(() => (async o => {
            if (!o.unloadingMemory) {
                o.unloadingMemory = !0;
                var {
                    qyCache: s,
                    options: n
                } = o;
                let t = 0, a = 0;
                if (s) {
                    var e, p = n.maxFileCountToUnload, n = s.rootDir;
                    a = m(o, n), t = a;
                    for (e of n.allLoadedSubdirs()) if ((a += m(o, e)) > p && (t += a, 
                    a = 0, await c(0), o.isStopping)) break;
                }
                t += a, global.gc && global.gc(), o.unloadingMemory = !1;
            }
        })(this), n.unloadMemInterval);
        return Object.assign(this, {
            maxChangeId: t,
            snapshotSavedChangeId: h,
            qySnapshots: o,
            aclKeyValueMap: s,
            compactInterval: e,
            unloadInterval: r
        }), n.bgLoadPosMaps ? (async t => {
            for (var a of Object.keys(t.qySnapshots.numToSnapshotMap).sort((t, a) => a - t)) {
                if (await async function e(p, i, r, h, c, l) {
                    if (p.isStopping) return void (l && l.close());
                    let m = p.qySnapshots;
                    let u = m.numToSnapshotMap;
                    let d = u[i];
                    if (!d) return void (l && l.close());
                    let {
                        info: S,
                        prefixPM: f
                    } = d;
                    r = r || Object.keys(f).sort().reverse();
                    if (0 == r.length) return void (l && l.close());
                    if (null == h || h != S.pMVersion) return l && l.close(), c = m.getPMFilePath(d), 
                    e(p, i, r, S.pMVersion, c, await v(c));
                    for (;0 < r.length; ) {
                        let s = y(r), n = f[s];
                        if (n) {
                            let [ t, a ] = n, o = await g(c, l, t, a);
                            if (p.isStopping || !u[i]) return void l.close();
                            if (h != S.pMVersion) return l.close(), e(p, i, r);
                            s in f && m.loadPartialPosMapBuffer(d, s, o);
                        }
                        r.pop();
                    }
                    l.close();
                    logger.info("bgLoadPosMap:" + i);
                }(t, a), t.isStopping) break;
                if (await c(0), t.isStopping) break;
            }
            !t.isStopping && t.options.compactAtStart && l(t);
        })(this) : n.compactAtStart && l(this), this;
    }
    async stop() {
        this.isStopping = !0;
        var {
            qyKVDataSaver: t,
            qySnapshotCompactor: a,
            qySnapshots: o,
            compactInterval: s,
            unloadInterval: n,
            qyKVDataCleaner: e
        } = this;
        clearInterval(s), clearInterval(n), await t.stop(), o && o.closeAllFDs(), 
        await a.stop(), await e.stop();
    }
    save(t, a, o, s) {
        var n = this.qyKVDataSaver;
        if (s) return n.callSave(t, a, o);
        n.castSave(t, a, o);
    }
    increaseChangeId() {
        return ++this.maxChangeId;
    }
    decreaseChangeId() {
        --this.maxChangeId;
    }
    getValueSync(t) {
        var {
            qySnapshots: a,
            aclKeyValueMap: o
        } = this;
        return t in o ? o[t] : a.getValueSync(t);
    }
    removeKey(t) {
        var {
            qySnapshots: a,
            aclKeyValueMap: o
        } = this;
        if (!(t in o)) return a.removeKey(t);
        o[t] = void 0;
    }
    onSnapshotSavedChangeId(t, a) {
        if (this.snapshotSavedChangeId = t, 3 == this.compactState && t >= this.compactMaxChangeId && (w(this), 
        this.compactState = 1), a) {
            var o, t = a, s = this.qySnapshots, n = s.keyToSnapshotMap;
            for (o in t.posMap) {
                var e = n[o];
                e && s.removeKeyFromSnapshot(e, o);
            }
            s.addMaxSnapshot(t), logger.info("addPMOnlySnapshot: " + s.snapshotMaxChangeId), 
            this.qyKVDataSaver.releaseSnapshot(a.snapshotNum);
        }
    }
    onCompactUpdates(t) {
        if (2 == this.compactState) {
            var u = this, {
                pMUpdates: t,
                vLUpdates: d,
                combineUpdate: S
            } = t = t;
            if (t) {
                var a, o = t, {
                    qySnapshots: s,
                    snapshotInfoNumList: n,
                    emptySnapshotNumList: e
                } = u, p = s.numToSnapshotMap;
                for (a in o) {
                    var i = p[a];
                    if (s.isEmptySnapshot(i)) s.delSnapshot(i), e.push(a); else {
                        var r, h = o[a], {
                            prefixPM: c,
                            info: l
                        } = i;
                        for (r in c) c[r] = h[r];
                        ++l.pMVersion, (t => {
                            var {
                                info: a,
                                compactOutedCount: o
                            } = t;
                            a.outdatedCount += o, t.outdatedCount -= o, t.compactOutedCount = 0;
                        })(i), n.push(a);
                    }
                }
            }
            if (d) {
                var m, f = d, {
                    qySnapshots: v,
                    snapshotInfoNumList: y,
                    emptySnapshotNumList: g
                } = t = u, C = v.numToSnapshotMap;
                for (m in f) {
                    var M = C[m];
                    if (v.isEmptySnapshot(M)) v.delSnapshot(M), g.push(m); else {
                        var I, q, {
                            posMap: V,
                            prefixPM: L
                        } = f[m], {
                            posMap: K,
                            prefixPM: x,
                            info: D
                        } = M;
                        for (I in K) K[I] = V[I];
                        for (q in x) x[q] = L[q];
                        ++D.pMVersion, ++D.vLVersion, j(M), y.push(m);
                    }
                }
            }
            if (S) {
                var b, d = S;
                let {
                    qySnapshots: s,
                    snapshotInfoNumList: t,
                    emptySnapshotNumList: a
                } = u, {
                    numToSnapshotMap: n,
                    keyToSnapshotMap: e
                } = s, {
                    snapshotNum: o,
                    combinedSnapshotNumList: p,
                    posMap: i
                } = d, r = n[o], {
                    posMap: h,
                    info: c
                } = r;
                for (b in h) h[b] = i[b];
                j(r);
                let l = c.totalCount, m = r.outdatedCount;
                for (let o of p) {
                    var N, O = n[o];
                    let {
                        posMap: t,
                        info: a
                    } = O;
                    for (N in t) h[N] = i[N], e[N] = r;
                    j(O), l += a.totalCount, m += O.outdatedCount, s.delSnapshot(O);
                }
                a.push(...p), (l == m ? a : (++c.pMVersion, ++c.vLVersion, c.totalCount = l, 
                r.outdatedCount = m, t)).push(o);
            }
            this.snapshotSavedChangeId >= this.compactMaxChangeId ? (w(this), this.compactState = 1) : this.compactState = 3;
        }
    }
}

function j(t) {
    var {
        info: a,
        compactOutedCount: o
    } = t;
    a.totalCount -= a.outdatedCount + o, a.outdatedCount = 0, t.outdatedCount -= o, 
    t.compactOutedCount = 0;
}

function l(t) {
    if (1 == t.compactState) {
        var {
            maxChangeId: a,
            qySnapshots: o,
            qySnapshotCompactor: s
        } = t, {
            emptySnapshotNumList: o,
            pMCompactSnapshotList: n,
            vLCompactSnapshotList: e,
            combiningSnapshotList: p
        } = o.calOutdates();
        if (0 < p.length || 0 < n.length || 0 < e.length) {
            Object.assign(t, {
                compactState: 2,
                compactMaxChangeId: a
            });
            for (var i of [ n, e, p ]) for (var r of i) r.compactOutedCount = r.outdatedCount;
            s.compactSnapshots(n, e, p);
        }
        0 < o.length && (t.emptySnapshotNumList.push(...o), t.snapshotSavedChangeId >= a ? h(t) : 1 == t.compactState && Object.assign(t, {
            compactState: 3,
            compactMaxChangeId: a
        }));
    }
}

function m(t, a) {
    var o = t.qySnapshots.snapshotMaxChangeId;
    let s = 0;
    if (a.fileMapLoaded) for (var n of a.fileList) ++s, n.cChangeId <= o && (n.visited ? n.visited = !1 : n.unloadFileContent());
    return s;
}

function h(t) {
    var {
        qyKVDataCleaner: t,
        emptySnapshotNumList: a
    } = t;
    0 < a.length && (t.removeSnapshotsFiles(a), a.length = 0);
}

function w(t) {
    var {
        qySnapshotCompactor: a,
        snapshotInfoNumList: o
    } = t;
    0 < o.length && (a.saveSnapshotInfos(o), o.length = 0), h(t);
}

export {
    t as QyKVData
};