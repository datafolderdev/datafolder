let {
    pathSplit,
    isSimpleType,
    isFunction,
    isString,
    isNotNullObj,
    SpecialOperators,
    getSuffix,
    fromSingleName,
    toSingleName
} = require("./QyUtils.js"), getValByNamePath = require("./QyFileContentUtils.js").getValByNamePath, QyUnionNode = require("./QyUnionNode.js").QyUnionNode, QyIntersectNode = require("./QyIntersectNode.js").QyIntersectNode, isArray = Array.isArray, {
    $or,
    $and
} = SpecialOperators, Empty_Union_Node = new QyUnionNode();

function getIndexPropPaths(e) {
    if (null != e && !isString(e)) return _getIndexPropPaths_rec(e, e = {}, [], 0), 
    Object.keys(e).map(e => fromSingleName(e));
}

function calDifferenceList(e, r, i, t, n, l) {
    t = getValByNamePath(t, r), n = getValByNamePath(n, r);
    if (t !== n) {
        var o, a, s, u, l = isArray(n) || isArray(getValByNamePath(l, r)), f = Object.fromEntries(_itemToPropValList(t, l).map(e => [ JSON.stringify(e), e ])), d = Object.fromEntries(_itemToPropValList(n, l).map(e => [ JSON.stringify(e), e ])), c = [], y = [];
        for (o in f) d[o] || (a = f[o], (a = e.searchSubdir(a)) && (a = a.getFile(i)) && y.push(a));
        for (s in d) f[s] || (u = d[s], u = e.searchOrCreateSubdir(u), c.push(u.getOrCreateFile(i)));
        return {
            toAddFileList: c,
            toDelFileList: y
        };
    }
}

function parseNamePathAndQuery(e, r, i, t, n, l) {
    if (isString(t) || isNotNullObj(t)) if (e.isDir) _queryIndexHostDir(e, i, t, n, l); else {
        var o = e.$or;
        if (o) {
            for (var a of o) if (parseNamePathAndQuery(a, r, i, t, n, l), l?.isFull) return;
        } else for (var s of _getMatchedDirs(e = isString(e) ? pathSplit(e) : e, r)) if (_queryIndexHostDir(s, i, t, n, l), 
        l?.isFull) return;
    }
}

function* _getMatchedDirs(e, r, i = 0) {
    i == e.length ? yield r : yield* _getMatchedDirsWithPattern(e, e[i], r, i);
}

function* _getMatchedDirsWithPattern(e, r, i, t) {
    if ("**" == r) {
        i.isHiddenFolder || (yield i);
        for (var n of i.allSubdirs()) yield n;
    } else if ("*" == r) for (var l of i.subdirList) yield* _getMatchedDirs(e, l, t + 1); else if (isFunction(r)) for (var o of i.subdirList) r(o.name) && (yield* _getMatchedDirs(e, o, t + 1)); else if (isArray(r)) for (var a of r) yield* _getMatchedDirsWithPattern(e, a, i, t); else {
        var s = r.$or;
        if (s) for (var u of s) yield* _getMatchedDirsWithPattern(e, u, i, t); else {
            s = i.getSubdir(r);
            s && (yield* _getMatchedDirs(e, s, t + 1));
        }
    }
}

function _queryIndexHostDir(r, i, t, n, l) {
    var o = r.fileCount;
    if (!(o <= 0)) {
        let e = 0;
        if (isString(t)) {
            var a = r.getFile(t);
            a && l.countOne() && (n.push(a), ++e);
        } else {
            var s, a = r.qyCache, i = (0 < i?.length && a.qyDB.createIndex(r, i), 
            a.getIndexDir(r));
            if (!i) return;
            for (s in _constructQueryNode(i, t).getFileMap(l)) n.push(r.getFile(s)), 
            ++e;
        }
        logger.info(`Checking ${o} file${getSuffix(o)}, result: ${e} file` + getSuffix(e));
    }
}

function _isValidSimpleValue(e) {
    var r = typeof e;
    return "number" == r || "boolean" == r || "string" == r && !(e in SpecialOperators);
}

function _filterSubdirs(e, r) {
    var i, t = new QyUnionNode();
    for (i of e.subdirList) r(i.name) && t.addDir(i);
    return t;
}

function _filterSubdirsHtoL(e, r) {
    var i = e.sortedSubdirList, t = new QyUnionNode();
    for (let e = i.length - 1; 0 <= e; --e) {
        var n = i[e], l = n.nameNum;
        if (!isNaN(l)) {
            if (!r(l)) break;
            t.addDir(n);
        }
    }
    return t;
}

function _filterSubdirsLtoH(e, r) {
    var i = e.sortedSubdirList, t = new QyUnionNode();
    for (let e = 0; e < i.length; ++e) {
        var n = i[e], l = n.nameNum;
        if (!isNaN(l)) {
            if (!r(l)) break;
            t.addDir(n);
        }
    }
    return t;
}

function _isSimpleQueryObj(e) {
    var r, i, t;
    return !(null != e && !isSimpleType(e) && !isFunction(e)) || ({
        $gt: e,
        $lt: r,
        $gte: i,
        $lte: t
    } = e, null != (e ?? r ?? i ?? t));
}

function _getIndexPropPaths_rec(e, r, i, t) {
    if (_isSimpleQueryObj(e)) 0 < i.length && (r[toSingleName(i)] = 1); else {
        var n = e[$or] || e[$and];
        if (null != n) if (isArray(n)) for (var l of n) _getIndexPropPaths_rec(l, r, i, t), 
        i.length = t; else _getIndexPropPaths_rec(n, r, i, t), i.length = t; else for (var o in e) i.push(o), 
        _getIndexPropPaths_rec(e[o], r, i, t + 1), i.length = t;
    }
}

function _constructComparingNode(e, r, i, t, n) {
    if (null != r && null != i && (i <= r ? i = void 0 : r = void 0), null != n && null != t && (n <= t ? t = void 0 : n = void 0), 
    null != r) if (null != n) {
        if (r < n) return _filterSubdirs(e, e => r < e && e < n);
    } else {
        if (null == t) return _filterSubdirsHtoL(e, e => r < e);
        if (r < t) return _filterSubdirs(e, e => r < e && e <= t);
    } else if (null != i) if (null != n) {
        if (i < n) return _filterSubdirs(e, e => i <= e && e < n);
    } else {
        if (null == t) return _filterSubdirsHtoL(e, e => i <= e);
        if (i < t) return _filterSubdirs(e, e => i <= e && e <= t);
        if (i == t) return new QyUnionNode(e.getSubdir(i));
    } else {
        if (null != n) return _filterSubdirsLtoH(e, e => e < n);
        if (null != t) return _filterSubdirsLtoH(e, e => e <= t);
    }
    return Empty_Union_Node;
}

function _matchObj(r, i, t) {
    if (null == i) return !1;
    if (isSimpleType(t)) return isArray(i) ? i.includes(t) : isNotNullObj(i) ? i[t] : i == t;
    if (isFunction(t)) return t(i);
    if (isArray(t)) {
        if (isArray(i)) {
            for (let e = 0; e < t.length; ++e) if (!_matchObj(r, i[e], t[e])) return !1;
            return !0;
        }
        return !1;
    }
    var e, {
        $link: n,
        $spec: l
    } = t;
    if (n) {
        if (isSimpleType(i)) return _matchLink(r, n, i, l);
        if (isArray(i)) {
            for (var o of i) if (_matchLink(r, n, o, l)) return !0;
        } else for (var a in i) if (_matchLink(r, n, a, l)) return !0;
        return !1;
    }
    if (isSimpleType(i) || isArray(i)) return !1;
    for (e in t) if (!_matchObj(r, i[e], t[e])) return !1;
    return !0;
}

function _matchLink(e, r, i, t) {
    var r = e.getDir(r);
    return !!r && !!(r = r.getFile(i)) && (null == t || _matchObj(e, r.fileContent, t));
}

function _constructQueryNode(e, r) {
    if (null == r) return Empty_Union_Node;
    if (isSimpleType(r)) return new QyUnionNode(e.getSubdir(r));
    if (isFunction(r)) return _filterSubdirs(e, r);
    var {
        $gt: i,
        $lt: t,
        $gte: n,
        $lte: l
    } = r;
    if (null != (i ?? t ?? n ?? l)) return _constructComparingNode(e, i, n, l, t);
    var {
        $link: o,
        $spec: a
    } = r;
    if (null != o) {
        var s, u = new QyUnionNode(), {
            qyCache: f,
            subdirList: i
        } = e;
        for (s of i) _matchLink(f, o, s.name, a) && u.addDir(s);
        return u;
    }
    var d = new QyIntersectNode();
    if (isArray(r)) for (var c of r) d.addNode(_constructQueryNode(e, c)); else for (var y in r) {
        var g = r[y];
        if (y == $or) if (isArray(g)) {
            var _, N = new QyUnionNode();
            for (_ of g) N.addNode(_constructQueryNode(e, _));
            d.addNode(N);
        } else d.addNode(_constructQueryNode(e, g)); else if (y == $and) if (isArray(g)) for (var h of g) d.addNode(_constructQueryNode(e, h)); else d.addNode(_constructQueryNode(e, g)); else {
            y = e.getSubdir(y);
            if (null == y) return Empty_Union_Node;
            d.addNode(_constructQueryNode(y, g));
        }
    }
    return d;
}

function _itemToPropValList(e, r, i = [], t = [], n = 0) {
    if (null != e) if (_isValidSimpleValue(e = isNotNullObj(e) && r ? Object.values(e) : e)) t[n] = e, 
    t.length = n + 1, i.push([ ...t ]); else if (isArray(e)) {
        t.length = n + 1;
        for (var l of e.filter(e => _isValidSimpleValue(e))) t[n] = l, i.push([ ...t ]);
    } else if (isNotNullObj(e)) for (var o in e) t[n] = o, t.length = n + 1, _itemToPropValList(e[o], !1, i, t, n + 1);
    return i;
}

Object.assign(module.exports, {
    calDifferenceList: calDifferenceList,
    getIndexPropPaths: getIndexPropPaths,
    parseNamePathAndQuery: parseNamePathAndQuery
});