class QueryCounter {
    constructor(e = 1 / 0, i = 0) {
        Object.assign(this, {
            limit: e,
            cursor: i,
            added: 0,
            count: 0,
            encounteredMap: {}
        });
    }
    get isFull() {
        return this.limit <= this.added;
    }
    encounterOne(e) {
        var {
            encounteredMap: i,
            isFull: r
        } = this;
        if (!r && !i[e]) return i[e] = 1, this.countOne();
    }
    countOne() {
        if (this.count++ >= this.cursor) return ++this.added, !0;
    }
}

class QyQueryNode {
    constructor() {
        Object.assign(this, {
            fileCount: 0,
            nodeList: []
        });
    }
    encounterOne(e, i, r) {
        if (r) {
            if (r.encounterOne(i)) return e[i] = 1, r.isFull;
        } else e[i] = 1;
    }
}

class QyUnionNode extends QyQueryNode {
    constructor(e) {
        super(), Object.assign(this, {
            dirMap: {},
            checkedDirMap: {}
        }), e && this.addDir(e);
    }
    containsFile(i) {
        var {
            fileCount: e,
            dirMap: r,
            nodeList: t
        } = this;
        if (0 < e) {
            for (var n in r) if (null != r[n].getFile(i)) return !0;
            for (let e = 0; e < t.length; ++e) if (t[e].containsFile(i)) return !0;
        }
        return !1;
    }
    getFileMap(e) {
        var i, r, t, {
            dirMap: n,
            nodeList: o
        } = this, s = {};
        for (i in n) {
            var u, d = n[i].fileMap;
            for (u in d) if (d[u].created && !s[u] && this.encounterOne(s, u, e)) return s;
        }
        for (r of o) for (t in r.getFileMap()) if (!s[t] && this.encounterOne(s, t, e)) return s;
        return s;
    }
    addNode(e) {
        if (e) {
            var {
                dirMap: i,
                checkedDirMap: r,
                nodeList: t
            } = this;
            if (e instanceof QyUnionNode) {
                for (var n in e.dirMap) i[n] = e.dirMap[n];
                for (var o in t.push(...e.nodeList), e.checkedDirMap) r[o] = 1;
            } else t.push(e);
            this.fileCount += e.fileCount;
        }
    }
    addDir(e) {
        var {
            dirMap: i,
            checkedDirMap: r
        } = this, {
            fileCount: t,
            subdirCount: n,
            fullPathHash: o
        } = e;
        if (!i[o] && !r[o]) {
            if (0 < n) for (var s of e.subdirList) this.addDir(s);
            0 < t ? (i[o] = e, this.fileCount += t) : r[o] = 1;
        }
    }
}

Object.assign(module.exports, {
    QyUnionNode: QyUnionNode,
    QyQueryNode: QyQueryNode,
    QueryCounter: QueryCounter
});