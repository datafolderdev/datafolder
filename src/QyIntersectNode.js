import {
    QyQueryNode as t
} from "./QyUnionNode.js";

class n extends t {
    sorted = !1;
    constructor() {
        super(), Object.assign(this, {
            fileCount: void 0
        });
    }
    containsFile(t) {
        var {
            nodeList: e,
            fileCount: i
        } = this;
        if (0 != e.length && 0 != i) return s(this), e[0].containsFile(t) && l(e, t);
    }
    *getFiles(t, e = {}) {
        var {
            nodeList: i,
            fileCount: n
        } = this;
        if (0 != i.length && 0 != n) {
            s(this);
            for (var o of i[0].getFiles()) if (!(o in e) && l(i, o) && this.encounterOne(e, o, t) && (yield o, 
            t?.isFull)) return;
        }
    }
    addNode(t) {
        var e, i;
        t && null != t.fileCount && ({
            fileCount: e,
            nodeList: i
        } = this, 0 < i.length && 0 == e || (t instanceof n ? (i.push(...t.nodeList), 
        this.sorted = !1) : i.push(t), (null == e || e > t.fileCount) && (this.fileCount = t.fileCount)));
    }
}

function s(t) {
    t.sorted || (t.nodeList.sort((t, e) => t.fileCount - e.fileCount), t.sorted = !0);
}

function l(e, i) {
    var n = e.length;
    for (let t = 1; t < n; ++t) if (!e[t].containsFile(i)) return !1;
    return !0;
}

export {
    n as QyIntersectNode
};