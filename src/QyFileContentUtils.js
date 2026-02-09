import {
    isNotNullObj as f,
    arrayLast as u,
    trimArrayTail as V,
    isSimpleType as h,
    SpecialOperators as n
} from "./QyUtils.js";

let m = Array.isArray, {
    $del: y,
    $rpl: p,
    $ext: w
} = n;

function i(n, e) {
    if (null == e) return n;
    if (e !== y) {
        if (h(e)) return e;
        var r = e[p];
        if (null != r) return r;
        if (null == n || h(n)) return e;
        if (n != e) {
            var l, t = m(n);
            for (l in e) {
                var u = i(n[l], e[l]);
                null == u ? (delete n[l], t && V(n)) : n[l] = u;
            }
        }
        return n;
    }
}

function a(n, e) {
    if (e == y) return y;
    if (null != e[p]) return e;
    var r = n[p];
    if (null != r) n[p] = i(r, e); else {
        if (n == y) return {
            [p]: S(e)
        };
        if (h(n) || h(e)) return e;
        for (var l in e) {
            var t = e[l], u = n[l];
            n[l] = null == u ? t : a(u, t);
        }
    }
    return n;
}

function e(n, e) {
    let r = {
        oldValue: {},
        newValue: {}
    };
    n = C(n, e, [], 0, r);
    return r.oldValue = S(r.oldValue, !0, !0), r.newValue = S(r.newValue, !1, !1), 
    {
        merged: n,
        delta: r = r.oldValue || r.newValue ? r : void 0
    };
}

function C(e, r, l, t, u) {
    if (null == r) return e;
    if (r !== y) {
        if (null == e || h(e) || h(r)) return A(e, r, l, u);
        var i = r[p];
        if (null != i) return A(e, i, l, u);
        let n = r[w];
        if (null != n) return m(n) || (n = [ n ]), (m(e) ? (e, r, n, l) => {
            r = S(r);
            var t = {};
            for (let n = 0; n < r.length; ++n) {
                var u = r[n];
                null != u && (t[n + e.length] = h(u) ? u : {
                    [p]: u
                });
            }
            return N(l, n, e, t), e.concat(r);
        } : A)(e, n, l, u);
        if (m(e) && !m(r) || !m(e) && m(r)) return A(e, r, l, u);
        var a = e, f = r, o = l, v = t, s = u;
        if (a != f) {
            var d, c = m(a);
            for (d in f) {
                o[v] = d, o.length = v + 1;
                var g = C(a[d], f[d], o, v + 1, s);
                null == g ? (delete a[d], c && V(a)) : a[d] = g;
            }
        }
        return a;
    }
    null != e && N(u, l, e, y);
}

function A(n, e, r, l) {
    e = S(e);
    return n === e ? n : null != e ? (null == n ? N(l, r, 0 == r.length ? void 0 : null, h(e) ? e : {
        [p]: e
    }) : N(l, r, n, h(n) ? e : {
        [p]: e
    }), e) : void N(l, r, n, y);
}

function N(n, e, r, l) {
    n.oldValue = t(n.oldValue, e, r), n.newValue = t(n.newValue, e, l);
}

function t(n, e, r) {
    if (!e || 0 == e.length) return r;
    let l = n;
    for (let n = 0; n < e.length - 1; ++n) {
        var t = e[n];
        f(l[t]) || (l[t] = {}), l = l[t];
    }
    return l[u(e)] = r, n;
}

function r(n, e) {
    if (null != e && null != (n = l(n))) {
        if (!m(e)) return "" == e ? n : l(n[e]);
        if (0 != e.length && (1 != e.length || "" != e[0])) for (var r of e) if (null == (n = l(n[r]))) return;
        return n;
    }
}

function l(n) {
    if (null != n && n != y) {
        for (;null != n[p]; ) if ((n = n[p]) == y) return;
        return n;
    }
}

function S(n, e = !0, r = !1) {
    return function r(l, t, u) {
        if (l instanceof Date) return l.toISOString();
        if (!f(l)) return (u ? void 0 === l : null == l) || t && l === y ? void 0 : l;
        if (t) {
            let n = l[p];
            if (null != n) return r(n, t, u);
            let e = l[w];
            if (null != e) return r(m(e) ? e : [ e ], t, u);
        }
        let e = m(l);
        let i = !0;
        for (var a in l) {
            let n = r(l[a], t, u);
            (u ? void 0 === n : null == n) ? (delete l[a], e && V(l)) : (l[a] = n, 
            i = !1);
        }
        return i ? void 0 : l;
    }(n, e, r);
}

function o(n) {
    if (h(n)) return n ? y : void 0;
    for (var e in n) {
        var r = o(n[e]);
        r ? n[e] = r : delete n[e];
    }
    return m(n) && V(n), n;
}

export {
    i as mergeContent,
    e as mergeContentAndGenDelta,
    a as mergeContentChanges,
    t as setValByNamePath,
    r as getValByNamePath,
    S as cleanContent,
    o as objToDelMarks
};