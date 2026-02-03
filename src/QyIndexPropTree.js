let isArray = Array.isArray;

class QyIndexPropNode {
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
        return r ? (h = r[n]) || (h = r[n] = new QyIndexPropNode(n, this), ++this.childCount) : (h = new QyIndexPropNode(n, this), 
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
        n && this._isEmpty() && n._removeChild(h), r;
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
    _removeChild(e) {
        var {
            children: t,
            parent: r,
            name: n
        } = this;
        t[e] && (delete t[e], 0 == --this.childCount && delete this.children, r) && this._isEmpty() && r._removeChild(n);
    }
    _isEmpty() {
        return !this.indexPropPath && 0 == this.childCount;
    }
}

class QyIndexPropTree {
    constructor() {
        Object.assign(this, {
            rootNode: new QyIndexPropNode(),
            changeCount: 0,
            allIndexPropPaths: []
        });
    }
    insert(e) {
        0 < (e = isArray(e) ? e : [ e ]).length && this.rootNode.insert(e, 0) && ++this.changeCount;
    }
    remove(e) {
        isArray(e) || (e = [ e ]);
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

function getPrefixPropPaths(e) {
    if (0 == e.length) return [];
    var t, r = new QyIndexPropTree();
    for (t of e) r.insert(t);
    return r.getAllIndexPropPaths();
}

Object.assign(module.exports, {
    QyIndexPropTree: QyIndexPropTree,
    getPrefixPropPaths: getPrefixPropPaths
});