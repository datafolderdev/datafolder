let {
    isNotNullObj,
    arrayLast,
    trimArrayTail,
    isSimpleType,
    SpecialOperators
} = require("./QyUtils.js"), isArray = Array.isArray, {
    $del,
    $rpl,
    $ext
} = SpecialOperators;

function mergeContent(e, n) {
    if (null == n) return e;
    if (n !== $del) {
        if (isSimpleType(n)) return n;
        var r = n[$rpl];
        if (null != r) return r;
        if (null == e || isSimpleType(e)) return n;
        if (e != n) {
            var l, t = isArray(e);
            for (l in n) {
                var a = mergeContent(e[l], n[l]);
                null == a ? (delete e[l], t && trimArrayTail(e)) : e[l] = a;
            }
        }
        return e;
    }
}

function mergeContentChanges(e, n) {
    if (n == $del) return $del;
    if (null != n[$rpl]) return n;
    var r = e[$rpl];
    if (null != r) e[$rpl] = mergeContent(r, n); else {
        if (e == $del) return {
            [$rpl]: cleanContent(n)
        };
        if (isSimpleType(e) || isSimpleType(n)) return n;
        for (var l in n) {
            var t = n[l], a = e[l];
            e[l] = null == a ? t : mergeContentChanges(a, t);
        }
    }
    return e;
}

function mergeContentAndGenDelta(e, n) {
    let r = {
        oldValue: {},
        newValue: {}
    };
    e = _mergeContentAndGenDelta_rec(e, n, [], 0, r);
    return r.oldValue = cleanContent(r.oldValue, !0, !0), r.newValue = cleanContent(r.newValue, !1, !1), 
    {
        merged: e,
        delta: r = r.oldValue || r.newValue ? r : void 0
    };
}

function _mergeArrayOrObj(e, n, r, l, t) {
    if (e != n) {
        var a, i = isArray(e);
        for (a in n) {
            r[l] = a, r.length = l + 1;
            var u = _mergeContentAndGenDelta_rec(e[a], n[a], r, l + 1, t);
            null == u ? (delete e[a], i && trimArrayTail(e)) : e[a] = u;
        }
    }
    return e;
}

function _mergeContentAndGenDelta_rec(n, r, l, t, a) {
    if (null == r) return n;
    if (r !== $del) {
        if (null == n || isSimpleType(n) || isSimpleType(r)) return _genRpl(n, r, l, a);
        var i = r[$rpl];
        if (null != i) return _genRpl(n, i, l, a);
        let e = r[$ext];
        return null != e ? (isArray(e) || (e = [ e ]), (isArray(n) ? _genExt : _genRpl)(n, e, l, a)) : isArray(n) && !isArray(r) || !isArray(n) && isArray(r) ? _genRpl(n, r, l, a) : _mergeArrayOrObj(n, r, l, t, a);
    }
    null != n && setDeltaValues(a, l, n, $del);
}

function _genExt(n, r, e, l) {
    r = cleanContent(r);
    var t = {};
    for (let e = 0; e < r.length; ++e) {
        var a = r[e];
        null != a && (t[e + n.length] = isSimpleType(a) ? a : {
            [$rpl]: a
        });
    }
    return setDeltaValues(l, e, n, t), n.concat(r);
}

function _genRpl(e, n, r, l) {
    n = cleanContent(n);
    return e === n ? e : null != n ? (null == e ? setDeltaValues(l, r, 0 == r.length ? void 0 : null, isSimpleType(n) ? n : {
        [$rpl]: n
    }) : setDeltaValues(l, r, e, isSimpleType(e) ? n : {
        [$rpl]: n
    }), n) : void setDeltaValues(l, r, e, $del);
}

function setDeltaValues(e, n, r, l) {
    e.oldValue = setValByNamePath(e.oldValue, n, r), e.newValue = setValByNamePath(e.newValue, n, l);
}

function setValByNamePath(e, n, r) {
    if (!n || 0 == n.length) return r;
    let l = e;
    for (let e = 0; e < n.length - 1; ++e) {
        var t = n[e];
        isNotNullObj(l[t]) || (l[t] = {}), l = l[t];
    }
    return l[arrayLast(n)] = r, e;
}

function getValByNamePath(e, n) {
    if (null != n && null != (e = _getValFromObj(e))) {
        if (!isArray(n)) return "" == n ? e : _getValFromObj(e[n]);
        if (0 != n.length && (1 != n.length || "" != n[0])) for (var r of n) if (null == (e = _getValFromObj(e[r]))) return;
        return e;
    }
}

function _getValFromObj(e) {
    if (null != e && e != $del) {
        for (;null != e[$rpl]; ) if ((e = e[$rpl]) == $del) return;
        return e;
    }
}

function cleanContent(e, n = !0, r = !1) {
    return _cleanContent_rec(e, n, r);
}

function _cleanContent_rec(e, n, r) {
    if (e instanceof Date) return e.toISOString();
    if (!isNotNullObj(e)) return (r ? void 0 === e : null == e) || n && e === $del ? void 0 : e;
    if (n) {
        var l = e[$rpl];
        if (null != l) return _cleanContent_rec(l, n, r);
        l = e[$ext];
        if (null != l) return _cleanContent_rec(isArray(l) ? l : [ l ], n, r);
    }
    var t, a = isArray(e);
    let i = !0;
    for (t in e) {
        var u = _cleanContent_rec(e[t], n, r);
        (r ? void 0 === u : null == u) ? (delete e[t], a && trimArrayTail(e)) : (e[t] = u, 
        i = !1);
    }
    return i ? void 0 : e;
}

function objToDelMarks(e) {
    if (isSimpleType(e)) return e ? $del : void 0;
    for (var n in e) {
        var r = objToDelMarks(e[n]);
        r ? e[n] = r : delete e[n];
    }
    return isArray(e) && trimArrayTail(e), e;
}

Object.assign(module.exports, {
    mergeContent: mergeContent,
    mergeContentAndGenDelta: mergeContentAndGenDelta,
    mergeContentChanges: mergeContentChanges,
    setValByNamePath: setValByNamePath,
    getValByNamePath: getValByNamePath,
    cleanContent: cleanContent,
    objToDelMarks: objToDelMarks
});