let t = Array.isArray;

class o {
    name;
    parent;
    children;
    childCount;
    indexPropPath;
    constructor(e = void 0, t = void 0) {
        Object.assign(this, {
            name: e,
            parent: t,
            childCount: 0
        });
    }
    insert(e, t) {
        var n = this.children;
        if (t == e.length) return !this.indexPropPath && (this.indexPropPath = e, 
        !0);
        var r = e[t];
        let h;
        return n ? (h = n[r]) || (h = n[r] = new o(r, this), ++this.childCount) : (h = new o(r, this), 
        this.children = {
            [r]: h
        }, ++this.childCount), h.insert(e, t + 1);
    }
    remove(e, t = 0, n = {}) {
        var {
            parent: r,
            name: h,
            children: o
        } = this;
        if (t == e.length) return this.indexPropPath && (n.removed = !0, delete this.indexPropPath), 
        r && i(this) && function e(t, n) {
            let {
                children: r,
                parent: h,
                name: o
            } = t;
            r[n] && (delete r[n], 0 == --t.childCount && delete t.children, h) && i(t) && e(h, o);
        }(r, h), n;
        this.indexPropPath && (n.hasPrefix = !0);
        r = o && o[e[t]];
        return r ? r.remove(e, t + 1, n) : n;
    }
    getAllIndexPropPaths(e) {
        var {
            children: t,
            indexPropPath: n
        } = this;
        if (n) e.push(n); else for (var r in t) t[r].getAllIndexPropPaths(e);
    }
}

function i(e) {
    return !e.indexPropPath && 0 == e.childCount;
}

class r {
    rootNode;
    changeCount;
    allIndexPropPaths;
    _cachedChangeCount;
    constructor() {
        Object.assign(this, {
            rootNode: new o(),
            changeCount: 0,
            allIndexPropPaths: []
        });
    }
    insert(e) {
        0 < (e = t(e) ? e : [ e ]).length && this.rootNode.insert(e, 0) && ++this.changeCount;
    }
    remove(e) {
        t(e) || (e = [ e ]);
        e = this.rootNode.remove(e);
        return e.removed && ++this.changeCount, e;
    }
    getAllIndexPropPaths() {
        var {
            _cachedChangeCount: e,
            allIndexPropPaths: t,
            rootNode: n,
            changeCount: r
        } = this;
        return e != r && (t.length = 0, n.getAllIndexPropPaths(t), this._cachedChangeCount = r), 
        t;
    }
}

function e(e) {
    if (0 == e.length) return [];
    var t, n = new r();
    for (t of e) n.insert(t);
    return n.getAllIndexPropPaths();
}

export {
    r as QyIndexPropTree,
    e as getPrefixPropPaths
};