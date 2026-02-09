class i {
    constructor(i = 1 / 0, e = 0) {
        Object.assign(this, {
            limit: i,
            cursor: e,
            added: 0,
            count: 0,
            encounteredMap: {}
        });
    }
    get isFull() {
        return this.limit <= this.added;
    }
    encounterOne(i) {
        var {
            encounteredMap: e,
            isFull: t
        } = this;
        if (!(t || i in e)) return e[i] = 1, this.countOne();
    }
    countOne() {
        if (this.count++ >= this.cursor) return ++this.added, !0;
    }
}

class e {
    constructor() {
        Object.assign(this, {
            fileCount: 0,
            nodeList: []
        });
    }
    encounterOne(i, e, t) {
        if (!t || t.encounterOne(e)) return i[e] = 1, !0;
    }
}

class o extends e {
    constructor(i) {
        super(), Object.assign(this, {
            dirMap: {},
            checkedDirMap: {}
        }), i && this.addDir(i);
    }
    containsFile(e) {
        var {
            fileCount: i,
            dirMap: t,
            nodeList: r
        } = this;
        if (0 < i) {
            for (var n in t) if (null != t[n].getFile(e)) return !0;
            for (let i = 0; i < r.length; ++i) if (r[i].containsFile(e)) return !0;
        }
        return !1;
    }
    *getFiles(i, e = {}) {
        var t, r, {
            dirMap: n,
            nodeList: s
        } = this;
        for (t in n) {
            var o = n[t];
            if (0 != o.fileCount) for (var a of o.fileNameList) if (!(a in e) && this.encounterOne(e, a, i) && (yield a, 
            i?.isFull)) return;
        }
        for (r of s) if (yield* r.getFiles(i, e), i?.isFull) return;
    }
    addNode(i) {
        if (i) {
            var {
                dirMap: e,
                checkedDirMap: t,
                nodeList: r
            } = this;
            if (i instanceof o) {
                for (var n in i.dirMap) e[n] = i.dirMap[n];
                for (var s in r.push(...i.nodeList), i.checkedDirMap) t[s] = 1;
            } else r.push(i);
            this.fileCount += i.fileCount;
        }
    }
    addDir(i) {
        var {
            dirMap: e,
            checkedDirMap: t
        } = this, {
            fileCount: r,
            subdirCount: n,
            fullPathHash: s
        } = i;
        if (!(s in e || s in t)) {
            if (0 < n) for (var o of i.subdirList) this.addDir(o);
            0 < r ? (e[s] = i, this.fileCount += r) : t[s] = 1;
        }
    }
}

export {
    o as QyUnionNode,
    e as QyQueryNode,
    i as QueryCounter
};