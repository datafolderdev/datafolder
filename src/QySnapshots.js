import {
    close as e,
    readSync as i,
    openSync as p
} from "node:fs";

import {
    readdir as l,
    readFile as r
} from "node:fs/promises";

import {
    join as n
} from "node:path";

import m from "node:zlib";

import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

import {
    Hash_Key_Length as u,
    folderOrFileExists as d,
    listToMap as f,
    isEmptyObj as h,
    isString as v
} from "./QyUtils.js";

import {
    QyBinWriter as M
} from "./QyBinWriter.js";

import {
    bufferToNums as y,
    numsToBuffer as c,
    applyAclChange as g,
    iterCmdKeys as S
} from "./QyAcl.js";

import {
    QyJsonSaver as C
} from "./QyJsonSaver.js";

import {
    logger as P
} from "./QyLogger.js";

let x = Array.isArray, F = Buffer.from("\n"), L = Buffer.from("'"), O = Buffer.from("z"), j = L[0], J = O[0];

class t {
    snapshotFolder;
    snapshotInfoFolder;
    options;
    qyJsonSaver;
    numToSnapshotMap = {};
    keyToSnapshotMap = {};
    fDMap = {};
    prefixMap = {};
    snapshotMaxChangeId = 0;
    maxSnapshotNum = 0;
    snapshotCount = 0;
    constructor(t, o) {
        (o = {
            ...s("QySnapshots"),
            ...o
        }).vLOutdatedPercent = 2 * o.pMOutdatedPercent;
        var a = n(t, "info");
        Object.assign(this, {
            snapshotFolder: t,
            snapshotInfoFolder: a,
            options: o,
            qyJsonSaver: new C(a, o)
        });
    }
    async loadSnapshotInfos() {
        let {
            snapshotInfoFolder: t,
            qyJsonSaver: s,
            numToSnapshotMap: r
        } = this;
        if (await d(t)) {
            var o = await (async (t, o) => {
                var a = {};
                for (s of await l(o)) {
                    var e, n, s = /^([1-9][0-9]*)(_([0-9]+))*\.json/.exec(s);
                    s && (e = +s[1], s = s[3], s = s ? +s : 2, null == (n = a[e]) ? a[e] = s : (t.removeFile(D(e, Math.min(n, s))), 
                    a[e] = Math.max(n, s)));
                }
                return Object.entries(a).map(([ t, o ]) => [ +t, o ]).sort((t, o) => t[0] - o[0]);
            })(s, t);
            let e = 0, n = 0;
            await Promise.all(o.map(async ([ t, o ]) => {
                var a = await s.loadFromFile(D(t, o)), o = (a.verList = [ o ], r[t] = {
                    snapshotNum: t,
                    info: a,
                    posMap: {},
                    outdatedCount: 0
                }), t = (++this.snapshotCount, t > e && (e = t, n = a.maxChangeId), 
                this), a = o;
                t = N(t, a), P.info("Loading " + t), a.prefixPM = await b(t);
            })), Object.assign(this, {
                maxSnapshotNum: e,
                snapshotMaxChangeId: n
            });
            var {
                numToSnapshotMap: a,
                prefixMap: i
            } = this;
            for ([ f ] of o) {
                var p, u = a[f], f = u.prefixPM;
                for (p in f) {
                    var h = i[p];
                    h ? h.push(u) : i[p] = [ u ];
                }
            }
        }
    }
    closeAllFDs() {
        var t, o = this.fDMap;
        for (t in o) e(o[t]), delete o[t];
    }
    saveKeyValueMap(t) {
        var o, a = this.options.minLenToCompress, {
            keyValueMap: e,
            info: n
        } = t, s = (++n.vLVersion, new M()), r = (s.start(this.getVLFilePath(t)), 
        Object.keys(e).sort()), i = {};
        let p = 0, u = 0, f, h;
        for (o of r) {
            var l = e[o];
            let t;
            null == l ? t = K : (h = Buffer.isBuffer(l) ? (f = l, 0) : v(l) ? (f = l.length >= a ? (s.save(O), 
            m.zstdCompressSync(l)) : (s.save(L), Buffer.from(l)), 1) : (f = Buffer.from(JSON.stringify(I(o) && !x(l) ? Object.keys(l) : l)), 
            0), s.save([ f, F ]), l = h + f.length, t = [ p, l ], p += l + 1), i[o] = t, 
            ++u;
        }
        return Object.assign(t, {
            posMap: i,
            outdatedCount: 0
        }), Object.assign(n, {
            totalCount: u,
            outdatedCount: 0
        }), Promise.all([ this.savePosMap(t, r), s.stop() ]);
    }
    addMaxSnapshot(t) {
        var o, {
            numToSnapshotMap: a,
            keyToSnapshotMap: e
        } = this, {
            posMap: n,
            keyValueMap: s,
            snapshotNum: r,
            info: i
        } = t, i = i.maxChangeId, i = (Object.assign(this, {
            maxSnapshotNum: r,
            snapshotMaxChangeId: i
        }), s || n);
        for (o in i) e[o] = t;
        a[r] = t, ++this.snapshotCount;
    }
    removeKey(t) {
        var o = this.keyToSnapshotMap, a = o[t];
        if (a) return this.removeKeyFromSnapshot(a, t), delete o[t], !0;
    }
    applyCmdObj(t, o, a) {
        if (null != a) {
            var e = a.length;
            for (let t = 0; t < e; t += 2) {
                var n = a[t], s = a[t + 1];
                o[n] = null != s && I(n) ? f(s) : s;
            }
        }
        S(t, t => {
            t in o || (o[t] = this.getValueSync(t)), this.removeKey(t);
        }), g(o, t);
    }
    getValueSync(t) {
        var o = ((t, o) => {
            let {
                keyToSnapshotMap: a,
                prefixMap: e
            } = t, n = a[o];
            if (n) return n;
            var s = w(o), r = e[s];
            if (r) for (;0 < r.length; ) {
                n = r.pop();
                var i = ((t, o, a) => {
                    var e, {
                        posMap: n,
                        prefixPM: s
                    } = o;
                    if (s = s[a]) return [ s, e ] = s, s = T(t, t.getPMFilePath(o), s, e), 
                    t.loadPartialPosMapBuffer(o, a, s), n;
                })(t, n, s);
                if (i && o in i) return n;
            }
        })(this, t);
        if (o) {
            var {
                keyValueMap: a,
                posMap: e
            } = o;
            if (a) return a[t];
            a = e[t];
            if (a) {
                var [ e, a ] = a;
                if (0 != a) {
                    var n = this;
                    if (o = n.getVLFilePath(o), n = T(n, o, e, a)) return (o = n[0]) == j ? n.toString("utf8", 1) : o == J ? m.zstdDecompressSync(n.subarray(1)).toString() : (e = JSON.parse(n), 
                    I(t) ? f(e) : e);
                }
            }
        }
    }
    loadPartialPosMapBuffer(a, t, o) {
        let {
            posMap: e,
            prefixPM: n
        } = a, s = (delete n[t], this).keyToSnapshotMap;
        V(o, (t, o) => {
            t in s ? ++a.outdatedCount : (e[t] = o, s[t] = a);
        });
    }
    delSnapshot(t) {
        delete this.numToSnapshotMap[t.snapshotNum], --this.snapshotCount, o(this, this.getVLFilePath(t)), 
        o(this, this.getPMFilePath(t));
    }
    calOutdates() {
        var t, o, a, e = [], n = [], s = [], r = [], {
            options: i,
            numToSnapshotMap: p
        } = this, {
            pMOutdatedPercent: u,
            vLOutdatedPercent: f
        } = i;
        for (t in p) {
            var h, l = p[t];
            l.isOut || (100 == (h = Q(l)) ? (this.delSnapshot(l), e.push([ t, l.info.verList[0] ])) : f < h ? (B(l) ? n : r).push(l) : Math.floor(l.outdatedCount / l.info.totalCount * 100) > u ? s.push(l) : (h = this, 
            l.info.totalCount < h.options.minSnapshotKeyCount && B(l) && n.push(l)));
        }
        1 == n.length && Q(n[0]) < f && (n.length = 0);
        for ([ o, a ] of [ [ "pMCompacts", s ], [ "vLCompacts", r ], [ "combiningSnapshots", n ] ]) 0 < a.length && P.log(o + ":" + a.map(t => t.snapshotNum + "." + t.info.verList[0]));
        return {
            emptySnapshotNumVerList: e,
            combiningSnapshotList: n,
            pMCompactSnapshotList: s,
            vLCompactSnapshotList: r
        };
    }
    getMaxCombinedSnapshot(t) {
        let o, a;
        for (var e of t) {
            var n = e.snapshotNum;
            (!a || a < n) && (o = e, a = n);
        }
        return o;
    }
    getPMFilePath(t) {
        var {
            snapshotNum: t,
            info: o
        } = t;
        return n(this.snapshotFolder, "" + t, o.pMVersion + "_pM.txt");
    }
    getVLFilePath(t) {
        var {
            snapshotNum: t,
            info: o
        } = t;
        return n(this.snapshotFolder, "" + t, o.vLVersion + "_vL.txt");
    }
    async saveSnapshotInfo(t, o) {
        var a = this.qyJsonSaver, {
            pMVersion: e,
            vLVersion: n,
            verList: s,
            outdatedCount: r,
            totalCount: i
        } = o, p = s[0], s = s[0] = e + n;
        return o.outdated = Math.floor(100 * r / i) + "%", P.log(`Saving snapshotInfo:${p ? t + `.${p}->` : ""}${t}.` + s), 
        !!await a.saveToFile({
            ...o,
            verList: void 0
        }, D(t, s), !0) && (null != p && a.removeFile(D(t, p)), !0);
    }
    savePosMap(t, o) {
        var a, {
            outdatedCount: e,
            info: n,
            posMap: s
        } = t, r = (n.outdatedCount += e, t.outdatedCount = 0, ++n.pMVersion, new M()), i = (r.start(this.getPMFilePath(t)), 
        t.prefixPM = {});
        let p = 0, u = 0, f;
        for (a of o = o || Object.keys(s).sort()) {
            null == f ? f = w(a) : a.startsWith(f) || (i[f] = [ p, u ], f = w(a), 
            p += u, u = 0);
            var h = Buffer.from(a), l = c(s[a]);
            r.save([ h, l ]), u += h.length + l.length;
        }
        return null != f && (i[f] = [ p, u ]), Promise.all([ r.stop(), ((t, o) => {
            var a, e = new M(), n = (e.start(N(t, o)), o).prefixPM;
            for (a in n) e.save([ Buffer.from(a), c(n[a]) ]);
            return e.stop();
        })(this, t) ]);
    }
    isEmptySnapshot(t) {
        var {
            info: t,
            outdatedCount: o
        } = t;
        return o + t.outdatedCount == t.totalCount;
    }
    removeKeyFromSnapshot(t, o) {
        var {
            posMap: a,
            keyValueMap: e
        } = t;
        e && delete e[o], a && delete a[o], ++t.outdatedCount;
    }
}

function V(o, a) {
    var e = o.length;
    for (let t = 0; t < e; ) {
        var n = t + u, s = o.toString("latin1", t, n), r = [];
        t = y(o, n, r), a(s, r);
    }
}

async function b(t) {
    var o = await r(t), a = o.length, e = {};
    for (let t = 0; t < a; ) {
        var n = t + k, s = e[o.toString("latin1", t, n)] = [];
        t = y(o, n, s);
    }
    return e;
}

function T(t, o, a, e) {
    var n = ((t, o) => {
        let a = t.fDMap, e = a[o];
        if (!e) {
            P.info("Opening " + o);
            try {
                e = a[o] = p(o, "r");
            } catch (t) {
                throw P.error(`Opening ${o} failed:`, t), t;
            }
        }
        return e;
    })(t, o), s = Buffer.allocUnsafe(e);
    for (let t = 0; t < e; ) {
        var r = i(n, s, t, e - t, a + t);
        if (0 == r) return void P.error(`readSync ${o} at ${a + t} returning 0 byte`);
        t += r;
    }
    return s;
}

function B(t) {
    var {
        keyValueMap: o,
        prefixPM: a
    } = t;
    return o || null == a || h(t.prefixPM);
}

function N(t, o) {
    var {
        snapshotNum: o,
        info: a
    } = o;
    return n(t.snapshotFolder, "" + o, a.pMVersion + "_prefixPM.txt");
}

function o(t, o) {
    var t = t.fDMap, a = t[o];
    null != a && (e(a), delete t[o]);
}

let K = [ 0, 0 ], k = 3;

function w(t) {
    return t.substring(0, k);
}

function I(t) {
    return !t.startsWith("c");
}

function Q(t) {
    var {
        outdatedCount: t,
        info: o
    } = t, a = o.totalCount, t = t + o.outdatedCount;
    return t == a ? 100 : Math.floor(t / a * 100);
}

function D(t, o) {
    return t + (2 < o ? "_" + o : "") + ".json";
}

export {
    t as QySnapshots,
    V as iterPMBuffer,
    b as loadPrefixPMFile,
    D as getInfoFileName
};