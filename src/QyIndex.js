import {
    pathSplit as a,
    isSimpleType as d,
    isFunction as g,
    isString as s,
    isNotNullObj as c,
    SpecialOperators as i,
    getSuffix as p,
    fromSingleName as r,
    toSingleName as o
} from "./QyUtils.js";

import {
    getValByNamePath as v
} from "./QyFileContentUtils.js";

import {
    QyUnionNode as m
} from "./QyUnionNode.js";

import {
    QyIntersectNode as y
} from "./QyIntersectNode.js";

let h = Array.isArray, {
    $or: b,
    $and: S
} = i, N = new m(), l = [];

function e(e) {
    if (null != e && !s(e)) return function r(i, n, t, l) {
        if (H(i)) 0 < t.length && (n[o(t)] = 1); else {
            let e = i[b] || i[S];
            if (null != e) if (h(e)) for (var f of e) r(f, n, t, l), t.length = l; else r(e, n, t, l), 
            t.length = l; else for (var u in i) t.push(u), r(i[u], n, t, l + 1), 
            t.length = l;
        }
    }(e, e = {}, [], 0), Object.keys(e).map(e => r(e));
}

function n(e, r, i, n, t, l) {
    n = v(n, r), t = v(t, r);
    if (n !== t) {
        var f, u, o, a, l = h(t) || h(v(l, r)), s = Object.fromEntries(R(n, l).map(e => [ JSON.stringify(e), e ])), d = Object.fromEntries(R(t, l).map(e => [ JSON.stringify(e), e ])), g = [], c = [];
        for (f in s) d[f] || (u = s[f], (u = e.searchSubdir(u)) && (u = u.getFile(i)) && c.push(u));
        for (o in d) s[o] || (a = d[o], a = e.searchOrCreateSubdir(a), g.push(a.getOrCreateFile(i)));
        return {
            toAddFileList: g,
            toDelFileList: c
        };
    }
}

function $(e, r, i, n, t, l) {
    if (s(n) || c(n)) if (e.isDir) L(e, i, n, t, l); else {
        var f = e.$or;
        if (f) {
            for (var u of f) if ($(u, r, i, n, t, l), l?.isFull) return;
        } else for (var o of F(e = s(e) ? a(e) : e, r)) if (L(o, i, n, t, l), l?.isFull) return;
    }
}

function* F(e, r, i = 0) {
    i == e.length ? yield r : yield* function* r(i, n, t, l) {
        if (null == n) return;
        if ("**" == n) {
            t.isHiddenFolder || (yield t);
            for (var e of t.allSubdirs()) yield e;
        } else if ("*" == n) for (var f of t.subdirList) yield* F(i, f, l + 1); else if (g(n)) for (var u of t.filterSubdirNames(n)) yield* F(i, u, l + 1); else if (h(n)) for (var o of n) yield* r(i, o, t, l); else {
            let e = n.$or || n.$in;
            if (h(e)) for (var a of e) yield* r(i, a, t, l); else if (j(n)) for (var s of C(t, n)) yield* F(i, s, l + 1); else {
                let e = t.getSubdir(n);
                e && (yield* F(i, e, l + 1));
            }
        }
    }(e, e[i], r, i);
}

function L(r, i, n, t, l) {
    var f = r.fileCount;
    if (!(f <= 0)) {
        let e = 0;
        if (s(n)) {
            var u = r.getFile(n);
            u && l.countOne() && (t.push(u), ++e);
        } else {
            var o, u = r.qyCache, i = (0 < i?.length && u.qyDB.createIndex(r, i), 
            u.getIndexDir(r));
            if (!i) return;
            for (o of function i(n, e) {
                if (null == e) return N;
                if (d(e)) return new m(n.getSubdir(e));
                if (g(e)) return O(n.filterSubdirNames(e));
                if (j(e)) return O(C(n, e));
                let {
                    $link: t,
                    $spec: l
                } = e;
                if (null != t) {
                    let e = new m(), {
                        qyCache: r,
                        subdirList: i
                    } = n;
                    for (var f of i) D(r, t, f.name, l) && e.addDir(f);
                    return e;
                }
                let u = new y();
                if (h(e)) for (var r of e) u.addNode(i(n, r)); else for (var o in e) {
                    let r = e[o];
                    if (o == b) if (h(r)) {
                        let e = new m();
                        for (var a of r) e.addNode(i(n, a));
                        u.addNode(e);
                    } else u.addNode(i(n, r)); else if (o == S) if (h(r)) for (var s of r) u.addNode(i(n, s)); else u.addNode(i(n, r)); else {
                        let e = n.getSubdir(o);
                        if (null == e) return N;
                        u.addNode(i(e, r));
                    }
                }
                return u;
            }(i, n).getFiles(l)) t.push(r.getFile(o)), ++e;
        }
        logger.info(`Checking ${f} file${p(f)}, result: ${e} file` + p(e));
    }
}

function u(e) {
    var r = typeof e;
    return "number" == r || "boolean" == r || "string" == r && !(e in i);
}

function O(e) {
    if (0 == e.length) return N;
    var r, i = new m();
    for (r of e) i.addDir(r);
    return i;
}

function j(e) {
    return null != e && null != (e.$gt ?? e.$lt ?? e.$gte ?? e.$lte);
}

function H(e) {
    return null == e || d(e) || g(e) || j(e);
}

function C(e, {
    $gt: r,
    $gte: i,
    $lte: n,
    $lt: t
}) {
    if (null != r && null != i && (i <= r ? i = void 0 : r = void 0), null != t && null != n && (t <= n ? n = void 0 : t = void 0), 
    null != r) if (null != t) {
        if (r < t) return e.compareSubdirRangeL2H(e => r < e && e < t);
    } else {
        if (null == n) return e.compareSubdirRangeH2L(e => r < e);
        if (r < n) return e.compareSubdirRangeL2H(e => r < e && e <= n);
    } else if (null != i) if (null != t) {
        if (i < t) return e.compareSubdirRangeL2H(e => i <= e && e < t);
    } else {
        if (null == n) return e.compareSubdirRangeH2L(e => i <= e);
        if (i < n) return e.compareSubdirRangeL2H(e => i <= e && e <= n);
        if (i == n) return [ e.getSubdir(i) ];
    } else {
        if (null != t) return e.compareSubdirRangeL2H(e => e < t);
        if (null != n) return e.compareSubdirRangeL2H(e => e <= n);
    }
    return l;
}

function D(e, r, i, n) {
    var r = e.getDir(r);
    return !!r && !!(r = r.getFile(i)) && (null == n || function r(i, n, t) {
        if (null == n) return !1;
        if (d(t)) return h(n) ? n.includes(t) : c(n) ? n[t] : n == t;
        if (g(t)) return t(n);
        if (h(t)) {
            if (h(n)) {
                for (let e = 0; e < t.length; ++e) if (!r(i, n[e], t[e])) return !1;
                return !0;
            }
            return !1;
        }
        var e, {
            $link: l,
            $spec: f
        } = t;
        if (l) {
            if (d(n)) return D(i, l, n, f);
            if (h(n)) {
                for (var u of n) if (D(i, l, u, f)) return !0;
            } else for (var o in n) if (D(i, l, o, f)) return !0;
            return !1;
        }
        if (d(n) || h(n)) return !1;
        for (e in t) if (!r(i, n[e], t[e])) return !1;
        return !0;
    }(e, r.fileContent, n));
}

function R(e, r, i = [], n = [], t = 0) {
    if (null != e) if (u(e = c(e) && r ? Object.values(e) : e)) n[t] = e, n.length = t + 1, 
    i.push([ ...n ]); else if (h(e)) {
        n.length = t + 1;
        for (var l of e.filter(e => u(e))) n[t] = l, i.push([ ...n ]);
    } else if (c(e)) for (var f in e) n[t] = f, n.length = t + 1, R(e[f], !1, i, n, t + 1);
    return i;
}

export {
    n as calDifferenceList,
    e as getIndexPropPaths,
    $ as parseNamePathAndQuery
};