let QyQueryNode = require("./QyUnionNode.js").QyQueryNode;

class QyIntersectNode extends QyQueryNode {
    constructor() {
        super(), Object.assign(this, {
            fileCount: void 0
        });
    }
    containsFile(e) {
        var {
            nodeList: t,
            fileCount: n
        } = this;
        if (0 != t.length && 0 != n) return this._ensureSorted(), t[0].containsFile(e) && this._inAllOthers(e);
    }
    getFileMap(e) {
        var {
            nodeList: t,
            fileCount: n
        } = this;
        if (0 == t.length || 0 == n) return {};
        this._ensureSorted();
        var i, s = {};
        for (i in t[0].getFileMap()) if (!s[i] && this._inAllOthers(i) && this.encounterOne(s, i, e)) return s;
        return s;
    }
    addNode(e) {
        var t, n;
        e && null != e.fileCount && ({
            fileCount: t,
            nodeList: n
        } = this, 0 < n.length && 0 == t || (e instanceof QyIntersectNode ? (n.push(...e.nodeList), 
        this.sorted = !1) : n.push(e), (null == t || t > e.fileCount) && (this.fileCount = e.fileCount)));
    }
    _ensureSorted() {
        this.sorted || (this.nodeList.sort((e, t) => e.fileCount - t.fileCount), 
        this.sorted = !0);
    }
    _inAllOthers(t) {
        var n = this.nodeList;
        for (let e = 1; e < n.length; ++e) if (!n[e].containsFile(t)) return !1;
        return !0;
    }
}

Object.assign(module.exports, {
    QyIntersectNode: QyIntersectNode
});