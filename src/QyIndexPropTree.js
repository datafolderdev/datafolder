let t = Array.isArray;

class i {
    constructor(e, t) {
        Object.assign(this, {
            name: e,
            parent: t,
            childCount: 0
        });
    }
    insert(e, t) {
        var r = this.children;
        if (t == e.length) return !this.indexPropPath && (this.indexPropPath = e, 
        !0);
        var n = e[t];
        let h;
        return r ? (h = r[n]) || (h = r[n] = new i(n, this), ++this.childCount) : (h = new i(n, this), 
        this.children = {
            [n]: h
        }, ++this.childCount), h.insert(e, t + 1);
    }
    remove(e, t = 0, r = {}) {
        var {
            parent: n,
            name: h,
            children: i
        } = this;
        if (t == e.length) return this.indexPropPath && (r.removed = !0, delete this.indexPropPath), 
        n && o(this) && function e(t, r) {
            let {
                children: n,
                parent: h,
                name: i
            } = t;
            n[r] && (delete n[r], 0 == --t.childCount && delete t.children, h) && o(t) && e(h, i);
        }(n, h), r;
        this.indexPropPath && (r.hasPrefix = !0);
        n = i && i[e[t]];
        return n ? n.remove(e, t + 1, r) : r;
    }
    getAllIndexPropPaths(e) {
        var {
            children: t,
            indexPropPath: r
        } = this;
        if (r) e.push(r); else for (var n in t) t[n].getAllIndexPropPaths(e);
    }
}

function o(e) {
    return !e.indexPropPath && 0 == e.childCount;
}

class n {
    constructor() {
        Object.assign(this, {
            rootNode: new i(),
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
            rootNode: r,
            changeCount: n
        } = this;
        return e != n && (t.length = 0, r.getAllIndexPropPaths(t), this._cachedChangeCount = n), 
        t;
    }
}

function e(e) {
    if (0 == e.length) return [];
    var t, r = new n();
    for (t of e) r.insert(t);
    return r.getAllIndexPropPaths();
}

export {
    n as QyIndexPropTree,
    e as getPrefixPropPaths
};