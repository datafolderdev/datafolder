import {
    isNotNullObj as a,
    arrayLast as t,
    trimArrayTail as g,
    isSimpleType as h,
    SpecialOperators as r
} from "./QyUtils.js";

let p = Array.isArray, {
    $del: w,
    $rpl: y,
    $ext: m
} = r;

function i(r, n) {
    if (null == n) return r;
    if (n !== w) {
        if (h(n)) return n;
        var l = n[y];
        if (null != l) return l;
        if (null == r || h(r)) return n;
        if (r != n) {
            var e, u = p(r);
            for (e in n) {
                var t = i(r[e], n[e]);
                null == t ? (delete r[e], u && g(r)) : r[e] = t;
            }
        }
        return r;
    }
}

function f(r, n) {
    if (n == w) return w;
    if (null != n[y]) return n;
    var l = r[y];
    if (null != l) r[y] = i(l, n); else {
        if (r == w) return {
            [y]: S(n)
        };
        if (h(r) || h(n)) return n;
        for (var e in n) {
            var u = n[e], t = r[e];
            r[e] = null == t ? u : f(t, u);
        }
    }
    return r;
}

function n(r, n) {
    let l = {
        oldValue: {},
        newValue: {}
    };
    r = A(r, n, [], 0, l);
    return l.oldValue = S(l.oldValue, !0, !0), l.newValue = S(l.newValue, !1, !1), 
    {
        merged: r,
        delta: l = l.oldValue || l.newValue ? l : void 0
    };
}

function u(r, n, l) {
    if (!n || 0 == n.length) return l;
    let e = r;
    for (let r = 0; r < n.length - 1; ++r) {
        var u = n[r];
        a(e[u]) || (e[u] = {}), e = e[u];
    }
    return e[t(n)] = l, r;
}

function l(r, n) {
    if (null != n && null != (r = o(r))) {
        if (!p(n)) return "" == n ? r : o(r[n]);
        if (0 != n.length && (1 != n.length || "" != n[0])) for (var l of n) if (null == (r = o(r[l]))) return;
        return r;
    }
}

function S(r, n = !0, l = !1) {
    return function l(e, u, t) {
        if (e instanceof Date) return e.toISOString();
        if (!a(e)) return (t ? void 0 === e : null == e) || u && e === w ? void 0 : e;
        if (u) {
            let r = e[y];
            if (null != r) return l(r, u, t);
            let n = e[m];
            if (null != n) return l(p(n) ? n : [ n ], u, t);
        }
        let n = p(e);
        let i = !0;
        for (var f in e) {
            let r = l(e[f], u, t);
            (t ? void 0 === r : null == r) ? (delete e[f], n && g(e)) : (e[f] = r, 
            i = !1);
        }
        return i ? void 0 : e;
    }(r, n, l);
}

function e(r) {
    if (h(r)) return r ? w : void 0;
    for (var n in r) {
        var l = e(r[n]);
        l ? r[n] = l : delete r[n];
    }
    return p(r) && g(r), r;
}

function A(n, l, e, u, t) {
    if (null == l) return n;
    if (l !== w) {
        if (null == n || h(n) || h(l)) return O(n, l, e, t);
        var i = l[y];
        if (null != i) return O(n, i, e, t);
        let r = l[m];
        if (null != r) return p(r) || (r = [ r ]), (p(n) ? (n, l, r, e) => {
            l = S(l);
            var u = {};
            for (let r = 0; r < l.length; ++r) {
                var t = l[r];
                null != t && (u[r + n.length] = h(t) ? t : {
                    [y]: t
                });
            }
            return $(e, r, n, u), n.concat(l);
        } : O)(n, r, e, t);
        if (p(n) && !p(l) || !p(n) && p(l)) return O(n, l, e, t);
        var f = n, a = l, o = e, v = u, d = t;
        if (f != a) {
            var c, s = p(f);
            for (c in a) {
                o[v] = c, o.length = v + 1;
                var V = A(f[c], a[c], o, v + 1, d);
                null == V ? (delete f[c], s && g(f)) : f[c] = V;
            }
        }
        return f;
    }
    null != n && $(t, e, n, w);
}

function O(r, n, l, e) {
    n = S(n);
    return r === n ? r : null != n ? (null == r ? $(e, l, 0 == l.length ? void 0 : null, h(n) ? n : {
        [y]: n
    }) : $(e, l, r, h(r) ? n : {
        [y]: n
    }), n) : void $(e, l, r, w);
}

function $(r, n, l, e) {
    r.oldValue = u(r.oldValue, n, l), r.newValue = u(r.newValue, n, e);
}

function o(r) {
    if (null != r && r != w) {
        for (;null != r[y]; ) if ((r = r[y]) == w) return;
        return r;
    }
}

export {
    i as mergeContent,
    f as mergeContentChanges,
    n as mergeContentAndGenDelta,
    u as setValByNamePath,
    l as getValByNamePath,
    S as cleanContent,
    e as objToDelMarks
};