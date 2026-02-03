let util = require("node:util"), {
    getValByNamePath,
    setValByNamePath
} = require("./QyFileContentUtils.js"), {
    isEmptyObj,
    isMatchName,
    getMatchParam,
    arrayLast,
    propNameJoin
} = require("./QyUtils.js"), isArray = Array.isArray;

class QyTriggerNode {
    constructor(e, r) {
        Object.assign(this, {
            name: e,
            parent: r,
            children: {},
            triggerMap: {}
        });
    }
    insertTrigger(e, r, t, a) {
        let i = this;
        for (var g of r) {
            isMatchName(g) && (g = "*");
            var s = i.children;
            i = s[g] || (s[g] = new QyTriggerNode(g, i));
        }
        var l = i.triggerMap, o = l[e];
        o ? Object.assign(o, {
            triggerName: e,
            fileNamePath: r,
            propNamePathList: t,
            fun: a
        }) : l[e] = new QyTrigger(e, r, t, a);
    }
    removeTrigger(e, r) {
        let t = this;
        for (var a of r) if (isMatchName(a) && (a = "*"), !(t = t.children[a])) return !1;
        r = t.triggerMap;
        return !!r[e] && (delete r[e], t.isEmpty && t.removeEmptyNodes(), !0);
    }
    get isEmpty() {
        return isEmptyObj(this.children) && isEmptyObj(this.triggerMap);
    }
    removeEmptyNodes() {
        let e = this;
        for (;;) {
            var {
                parent: r,
                name: t
            } = e;
            if (!r) return;
            if (delete r.children[t], !r.isEmpty) return;
            e = r;
        }
    }
    checkTrigger(e, r) {
        var t, a = this.triggerMap;
        for (t in a) a[t].checkTrigger(e, r);
    }
}

class QyTrigger {
    constructor(e, r, t, a) {
        Object.assign(this, {
            triggerName: e,
            fileNamePath: r,
            propNamePathList: t,
            fun: a
        });
    }
    checkTrigger(e, r) {
        var t, {
            triggerName: a,
            fileNamePath: i,
            propNamePathList: g,
            fun: s
        } = this, l = e.fileContent;
        let o;
        for (t of g) {
            var n = getValByNamePath(r.oldValue, t), h = getValByNamePath(r.newValue, t);
            util.isDeepStrictEqual(n, h) || (n = {
                oldValue: n,
                newValue: h
            }, (isArray(h) || isArray(getValByNamePath(l, t))) && (n.isArrayDelta = !0), 
            (o = o || {
                _file: e,
                _fileContent: l
            })[propNameJoin(t)] = n, setValByNamePath(o, t, n));
        }
        if (o) {
            var {
                namePath: m,
                qyCache: g
            } = e;
            for (let e = 0; e < m.length; ++e) {
                var y = getMatchParam(i[e]);
                y && (o[y] = m[e]);
            }
            try {
                s && s(o), g.emit(a, o);
            } catch (e) {
                logger.error(`Running trigger ${a} failed:`, o, e);
            }
        }
    }
}

let emptyArray = [];

function _getMatchedSubItems(e, r) {
    return e ? isMatchName(r) ? Object.values(e) : (e = e[r]) ? [ e ] : emptyArray : emptyArray;
}

function updateTriggerNodes(e, a) {
    if (0 != a.length) {
        let r = [ e ], t = [];
        for (let e = 0; e < a.length - 1; ++e) {
            var i, g = a[e];
            for (i of r) for (var s of _getMatchedSubItems(i.subdirMap, g)) i.setChildTriggerNodes(s), 
            t.push(s);
            if (0 == t.length) return;
            [ r, t ] = [ t, r ], t.length = 0;
        }
        var l, o = arrayLast(a);
        for (l of r) for (var n of _getMatchedSubItems(l.fileMap, o)) l.setChildTriggerNodes(n);
    }
}

Object.assign(module.exports, {
    QyTriggerNode: QyTriggerNode,
    updateTriggerNodes: updateTriggerNodes
});