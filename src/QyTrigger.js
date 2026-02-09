import {
    isDeepStrictEqual as p
} from "node:util";

import {
    getValByNamePath as c,
    setValByNamePath as u
} from "./QyFileContentUtils.js";

import {
    isEmptyObj as e,
    isMatchName as l,
    getMatchParam as d,
    arrayLast as f,
    propNameJoin as N
} from "./QyUtils.js";

let v = Array.isArray;

class h {
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
        for (var s of r) {
            l(s) && (s = "*");
            var o = i.children;
            i = o[s] || (o[s] = new h(s, i));
        }
        var n = i.triggerMap, g = n[e];
        g ? Object.assign(g, {
            triggerName: e,
            fileNamePath: r,
            propNamePathList: t,
            fun: a
        }) : n[e] = new m(e, r, t, a);
    }
    removeTrigger(e, r) {
        let t = this;
        for (var a of r) if (l(a) && (a = "*"), !(t = t.children[a])) return !1;
        r = t.triggerMap;
        return !!r[e] && (delete r[e], t.isEmpty && t.removeEmptyNodes(), !0);
    }
    get isEmpty() {
        return e(this.children) && e(this.triggerMap);
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

class m {
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
            propNamePathList: s,
            fun: o
        } = this, n = e.fileContent;
        let g;
        for (t of s) {
            var l = c(r.oldValue, t), f = c(r.newValue, t);
            p(l, f) || (l = {
                oldValue: l,
                newValue: f
            }, (v(f) || v(c(n, t))) && (l.isArrayDelta = !0), (g = g || {
                _file: e,
                _fileContent: n
            })[N(t)] = l, u(g, t, l));
        }
        if (g) {
            var {
                namePath: h,
                qyCache: s
            } = e;
            for (let e = 0; e < h.length; ++e) {
                var m = d(i[e]);
                m && (g[m] = h[e]);
            }
            try {
                o && o(g), s.emit(a, g);
            } catch (e) {
                logger.error(`Running trigger ${a} failed:`, g, e);
            }
        }
    }
}

let t = [];

function y(e, r) {
    return e ? l(r) ? Object.values(e) : (e = e[r]) ? [ e ] : t : t;
}

function r(e, a) {
    if (0 != a.length) {
        let r = [ e ], t = [];
        for (let e = 0; e < a.length - 1; ++e) {
            var i, s = a[e];
            for (i of r) for (var o of y(i.subdirMap, s)) i.setChildTriggerNodes(o), 
            t.push(o);
            if (0 == t.length) return;
            [ r, t ] = [ t, r ], t.length = 0;
        }
        var n, g = f(a);
        for (n of r) for (var l of y(n.fileMap, g)) n.setChildTriggerNodes(l);
    }
}

export {
    h as QyTriggerNode,
    r as updateTriggerNodes
};