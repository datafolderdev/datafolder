class i {
    limit;
    cursor;
    added = 0;
    count = 0;
    encounteredMap = {};
    constructor(i, e = 0) {
        i = i || 1 / 0, Object.assign(this, {
            limit: i,
            cursor: e
        });
    }
    get isFull() {
        return this.limit <= this.added;
    }
    encounterOne(i) {
        var {
            encounteredMap: e,
            isFull: r
        } = this;
        if (!(r || i in e)) return e[i] = 1, this.countOne();
    }
    countOne() {
        if (this.count++ >= this.cursor) return ++this.added, !0;
    }
}

class e {
    fileCount = 0;
    nodeList = [];
    constructor() {}
    encounterOne(i, e, r) {
        if (!r || r.encounterOne(e)) return i[e] = 1, !0;
    }
}

class o extends e {
    dirMap = {};
    checkedDirMap = {};
    constructor(i = void 0) {
        super(), i && this.addDir(i);
    }
    containsFile(e) {
        var {
            fileCount: i,
            dirMap: r,
            nodeList: t
        } = this;
        if (0 < i) {
            for (var n in r) if (null != r[n].getFile(e)) return !0;
            for (let i = 0; i < t.length; ++i) if (t[i].containsFile(e)) return !0;
        }
        return !1;
    }
    *getFiles(i, e = {}) {
        var r, t, {
            dirMap: n,
            nodeList: s
        } = this;
        for (r in n) {
            var o = n[r];
            if (0 != o.fileCount) for (var u of o.fileNameList) if (!(u in e) && this.encounterOne(e, u, i) && (yield u, 
            i?.isFull)) return;
        }
        for (t of s) if (yield* t.getFiles(i, e), i?.isFull) return;
    }
    addNode(i) {
        if (i) {
            var {
                dirMap: e,
                checkedDirMap: r,
                nodeList: t
            } = this;
            if (i instanceof o) {
                for (var n in i.dirMap) e[n] = i.dirMap[n];
                for (var s in t.push(...i.nodeList), i.checkedDirMap) r[s] = 1;
            } else t.push(i);
            this.fileCount += i.fileCount;
        }
    }
    addDir(i) {
        var {
            dirMap: e,
            checkedDirMap: r
        } = this, {
            fileCount: t,
            subdirCount: n,
            fullPathHash: s
        } = i;
        if (!(s in e || s in r)) {
            if (0 < n) for (var o of i.subdirList) this.addDir(o);
            0 < t ? (e[s] = i, this.fileCount += t) : r[s] = 1;
        }
    }
}

export {
    i as QueryCounter,
    e as QyQueryNode,
    o as QyUnionNode
};