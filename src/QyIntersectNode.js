import {
    QyQueryNode as t
} from "./QyUnionNode.js";

class i extends t {
    constructor() {
        super(), Object.assign(this, {
            fileCount: void 0
        });
    }
    containsFile(t) {
        var {
            nodeList: e,
            fileCount: n
        } = this;
        if (0 != e.length && 0 != n) return s(this), e[0].containsFile(t) && l(e, t);
    }
    *getFiles(t, e = {}) {
        var {
            nodeList: n,
            fileCount: i
        } = this;
        if (0 != n.length && 0 != i) {
            s(this);
            for (var o of n[0].getFiles()) if (!(o in e) && l(n, o) && this.encounterOne(e, o, t) && (yield o, 
            t?.isFull)) return;
        }
    }
    addNode(t) {
        var e, n;
        t && null != t.fileCount && ({
            fileCount: e,
            nodeList: n
        } = this, 0 < n.length && 0 == e || (t instanceof i ? (n.push(...t.nodeList), 
        this.sorted = !1) : n.push(t), (null == e || e > t.fileCount) && (this.fileCount = t.fileCount)));
    }
}

function s(t) {
    t.sorted || (t.nodeList.sort((t, e) => t.fileCount - e.fileCount), t.sorted = !0);
}

function l(e, n) {
    var i = e.length;
    for (let t = 1; t < i; ++t) if (!e[t].containsFile(n)) return !1;
    return !0;
}

export {
    i as QyIntersectNode
};