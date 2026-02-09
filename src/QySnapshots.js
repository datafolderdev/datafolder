import {
    close as e,
    readSync as i,
    openSync as p
} from "node:fs";

import {
    readdir as l,
    readFile as d
} from "node:fs/promises";

import {
    join as s
} from "node:path";

import m from "node:zlib";

import {
    getDefaultOptions as n
} from "./QyDefaultOptions.js";

import {
    Hash_Key_Length as u,
    folderOrFileExists as v,
    listToMap as r,
    isEmptyObj as f,
    isString as M
} from "./QyUtils.js";

import {
    QyBinWriter as g
} from "./QyBinWriter.js";

import {
    bufferToNums as y,
    numsToBuffer as S,
    applyAclChange as h,
    iterCmdKeys as c
} from "./QyAcl.js";

import {
    QyJsonSaver as C
} from "./QyJsonSaver.js";

import {
    logger as P
} from "./QyLogger.js";

let x = Array.isArray, O = Buffer.from("\n"), F = Buffer.from("'"), j = F[0], b = Buffer.from("z"), L = b[0];

class t {
    constructor(t, a) {
        (a = {
            ...n("QySnapshots"),
            ...a
        }).vLOutdatedPercent = 2 * a.pMOutdatedPercent;
        var o = s(t, "info");
        Object.assign(this, {
            snapshotFolder: t,
            snapshotInfoFolder: o,
            options: a,
            qyJsonSaver: new C(o, a),
            numToSnapshotMap: {},
            keyToSnapshotMap: {},
            fDMap: {},
            prefixMap: {},
            snapshotMaxChangeId: 0,
            maxSnapshotNum: 0,
            snapshotCount: 0
        });
    }
    async loadSnapshotInfos() {
        let {
            snapshotInfoFolder: t,
            qyJsonSaver: f,
            numToSnapshotMap: h
        } = this;
        if (await v(t)) {
            var a = (await l(t)).filter(t => /^[1-9]/.test(t)).map(t => parseInt(t)).sort((t, a) => t - a);
            let p = 0, u = 0;
            await Promise.all(a.map(async t => {
                var a = await f.loadFromFile(t + ".json"), o = h[t] = {
                    snapshotNum: t,
                    info: a,
                    posMap: {},
                    outdatedCount: 0
                };
                ++this.snapshotCount, t > p && (p = t, u = a.maxChangeId);
                var t = o, a = N(a = this, t), e = (P.info("Loading " + a), await d(a)), s = e.length, n = t.prefixPM = {};
                for (let t = 0; t < s; ) {
                    var r = t + k, i = e.toString("latin1", t, r), i = n[i] = [];
                    t = y(e, r, i);
                }
            })), Object.assign(this, {
                maxSnapshotNum: p,
                snapshotMaxChangeId: u
            });
            var {
                numToSnapshotMap: o,
                prefixMap: e
            } = this;
            for (r of a) {
                var s, n = o[r], r = n.prefixPM;
                for (s in r) {
                    var i = e[s];
                    i ? i.push(n) : e[s] = [ n ];
                }
            }
        }
    }
    closeAllFDs() {
        var t, a = this.fDMap;
        for (t in a) e(a[t]), delete a[t];
    }
    saveKeyValueMap(t) {
        var a, o = this.options.compressValText, {
            keyValueMap: e,
            info: s
        } = t, n = (++s.vLVersion, new g()), r = (n.start(this.getVLFilePath(t)), 
        Object.keys(e).sort()), i = {};
        let p = 0, u = 0, f, h;
        for (a of r) {
            var l = e[a];
            let t;
            null == l ? t = T : (h = Buffer.isBuffer(l) ? (f = l, 0) : M(l) ? (f = o ? (n.save(b), 
            m.zstdCompressSync(l)) : (n.save(F), Buffer.from(l)), 1) : (f = Buffer.from(JSON.stringify(w(a) && !x(l) ? Object.keys(l) : l)), 
            0), n.save([ f, O ]), l = h + f.length, t = [ p, l ], p += l + 1), i[a] = t, 
            ++u;
        }
        return Object.assign(t, {
            posMap: i,
            outdatedCount: 0
        }), Object.assign(s, {
            totalCount: u,
            outdatedCount: 0
        }), Promise.all([ this.savePosMap(t, r), n.stop() ]);
    }
    addMaxSnapshot(t) {
        var a, {
            numToSnapshotMap: o,
            keyToSnapshotMap: e
        } = this, {
            posMap: s,
            keyValueMap: n,
            snapshotNum: r,
            info: i
        } = t, i = i.maxChangeId, i = (Object.assign(this, {
            maxSnapshotNum: r,
            snapshotMaxChangeId: i
        }), n || s);
        for (a in i) e[a] = t;
        o[r] = t, ++this.snapshotCount;
    }
    removeKey(t) {
        var a = this.keyToSnapshotMap, o = a[t];
        if (o) return this.removeKeyFromSnapshot(o, t), delete a[t], !0;
    }
    applyCmdObj(t, a, o) {
        if (null != o) {
            var e = o.length;
            for (let t = 0; t < e; t += 2) {
                var s = o[t], n = o[t + 1];
                a[s] = null != n && w(s) ? r(n) : n;
            }
        }
        c(t, t => {
            t in a || (a[t] = this.getValueSync(t)), this.removeKey(t);
        }), h(a, t);
    }
    getValueSync(t) {
        var a = ((t, a) => {
            let {
                keyToSnapshotMap: o,
                prefixMap: e
            } = t, s = o[a];
            if (s) return s;
            var n = I(a), r = e[n];
            if (r) for (;0 < r.length; ) {
                s = r.pop();
                var i = ((t, a, o) => {
                    var e, {
                        posMap: s,
                        prefixPM: n
                    } = a;
                    if (n = n[o]) return [ n, e ] = n, n = V(t, t.getPMFilePath(a), n, e), 
                    t.loadPartialPosMapBuffer(a, o, n), s;
                })(t, s, n);
                if (i && a in i) return s;
            }
        })(this, t);
        if (a) {
            var {
                keyValueMap: o,
                posMap: e
            } = a;
            if (o) return o[t];
            o = e[t];
            if (o) {
                var [ e, o ] = o;
                if (0 != o) {
                    var s = this;
                    if (a = s.getVLFilePath(a), s = V(s, a, e, o)) return (a = s[0]) == j ? s.toString("utf8", 1) : a == L ? m.zstdDecompressSync(s.subarray(1)).toString() : (e = JSON.parse(s), 
                    w(t) ? r(e) : e);
                }
            }
        }
    }
    iterPMBuffer(a, o) {
        var e = a.length;
        for (let t = 0; t < e; ) {
            var s = t + u, n = a.toString("latin1", t, s), r = [];
            t = y(a, s, r), o(n, r);
        }
    }
    loadPartialPosMapBuffer(o, t, a) {
        let {
            posMap: e,
            prefixPM: s
        } = o, n = (delete s[t], this).keyToSnapshotMap;
        this.iterPMBuffer(a, (t, a) => {
            t in n ? ++o.outdatedCount : (e[t] = a, n[t] = o);
        });
    }
    delSnapshot(t) {
        delete this.numToSnapshotMap[t.snapshotNum], --this.snapshotCount, a(this, this.getVLFilePath(t)), 
        a(this, this.getPMFilePath(t));
    }
    calOutdates() {
        var t, a = [], o = [], e = [], s = [], {
            options: n,
            numToSnapshotMap: r
        } = this, {
            pMOutdatedPercent: i,
            vLOutdatedPercent: p
        } = n;
        for (t in r) {
            var u, f = r[t];
            f.isOut || (100 == (u = Q(f)) ? (this.delSnapshot(f), a.push(t)) : p < u ? (B(f) ? o : s).push(f) : Math.round(f.outdatedCount / f.info.totalCount * 100) > i ? e.push(f) : (u = this, 
            f.info.totalCount < u.options.minSnapshotKeyCount && B(f) && o.push(f)));
        }
        return 1 == o.length && Q(o[0]) < p && (o.length = 0), 0 < e.length && P.log("pMCompacts:" + e.map(t => t.snapshotNum)), 
        0 < s.length && P.log("vLCompacts:" + s.map(t => t.snapshotNum)), 0 < o.length && P.log("combiningSnapshots:" + o.map(t => t.snapshotNum)), 
        {
            emptySnapshotNumList: a,
            combiningSnapshotList: o,
            pMCompactSnapshotList: e,
            vLCompactSnapshotList: s
        };
    }
    getMaxCombinedSnapshot(t) {
        let a, o;
        for (var e of t) {
            var s = e.snapshotNum;
            (!o || o < s) && (a = e, o = s);
        }
        return a;
    }
    getPMFilePath(t) {
        var {
            snapshotNum: t,
            info: a
        } = t;
        return s(this.snapshotFolder, "" + t, a.pMVersion + "_pM.txt");
    }
    getVLFilePath(t) {
        var {
            snapshotNum: t,
            info: a
        } = t;
        return s(this.snapshotFolder, "" + t, a.vLVersion + "_vL.txt");
    }
    saveSnapshotInfo(t, a) {
        var {
            outdatedCount: o,
            totalCount: e
        } = a;
        return a.outdated = Math.round(100 * o / e) + "%", P.log("Saving snapshotInfo:" + t), 
        this.qyJsonSaver.saveToFile(a, t + ".json", !0);
    }
    savePosMap(t, a) {
        var o, {
            outdatedCount: e,
            info: s,
            posMap: n
        } = t, r = (s.outdatedCount += e, t.outdatedCount = 0, ++s.pMVersion, new g()), i = (r.start(this.getPMFilePath(t)), 
        t.prefixPM = {});
        let p = 0, u = 0, f;
        for (o of a = a || Object.keys(n).sort()) {
            null == f ? f = I(o) : o.startsWith(f) || (i[f] = [ p, u ], f = I(o), 
            p += u, u = 0);
            var h = Buffer.from(o), l = S(n[o]);
            r.save([ h, l ]), u += h.length + l.length;
        }
        return null != f && (i[f] = [ p, u ]), Promise.all([ r.stop(), ((t, a) => {
            var o, e = new g(), s = (e.start(N(t, a)), a).prefixPM;
            for (o in s) e.save([ Buffer.from(o), S(s[o]) ]);
            return e.stop();
        })(this, t) ]);
    }
    isEmptySnapshot(t) {
        var {
            info: t,
            outdatedCount: a
        } = t;
        return a + t.outdatedCount == t.totalCount;
    }
    removeKeyFromSnapshot(t, a) {
        var {
            posMap: o,
            keyValueMap: e
        } = t;
        e && delete e[a], o && delete o[a], ++t.outdatedCount;
    }
}

function V(t, a, o, e) {
    var s = ((t, a) => {
        let o = t.fDMap, e = o[a];
        if (!e) {
            P.info("Opening " + a);
            try {
                e = o[a] = p(a, "r");
            } catch (t) {
                throw P.error(`Opening ${a} failed:`, t), t;
            }
        }
        return e;
    })(t, a), n = Buffer.allocUnsafe(e);
    for (let t = 0; t < e; ) {
        var r = i(s, n, t, e - t, o + t);
        if (0 == r) return void P.error(`readSync ${a} at ${o + t} returning 0 byte`);
        t += r;
    }
    return n;
}

function B(t) {
    var {
        keyValueMap: a,
        prefixPM: o
    } = t;
    return a || null == o || f(t.prefixPM);
}

function N(t, a) {
    var {
        snapshotNum: a,
        info: o
    } = a;
    return s(t.snapshotFolder, "" + a, o.pMVersion + "_prefixPM.txt");
}

function a(t, a) {
    var t = t.fDMap, o = t[a];
    null != o && (e(o), delete t[a]);
}

let T = [ 0, 0 ], k = 3;

function I(t) {
    return t.substring(0, k);
}

function w(t) {
    return !t.startsWith("c");
}

function Q(t) {
    var {
        outdatedCount: t,
        info: a
    } = t, o = a.totalCount, t = t + a.outdatedCount;
    return t == o ? 100 : Math.round(t / o * 100);
}

export {
    t as QySnapshots
};