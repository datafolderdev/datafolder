let QyItem = require("./QyItem.js").QyItem, {
    SpecialOperators,
    SpecialFilePaths,
    getContentKey,
    isNotNullObj,
    isSimpleType,
    fromSingleName
} = require("./QyUtils.js"), getValByNamePath = require("./QyFileContentUtils.js").getValByNamePath, QyIndexPropTree = require("./QyIndexPropTree.js").QyIndexPropTree, isArray = Array.isArray, IndexPropPathsFileName = SpecialFilePaths.IndexPropPathsFileName, {
    $spec,
    $raw,
    $clone
} = SpecialOperators;

class QyFile extends QyItem {
    constructor(e, t, i) {
        super(e, t, i), t && (++i._fileCount, ++i.fileMapChangeCount), this.cChangeId = 0;
    }
    get created() {
        return this._created;
    }
    set created(e) {
        var t;
        this._created != (e = !!e) && (this._created = e, t = this.parentDir, t._fileCount += e ? 1 : -1, 
        ++t.fileMapChangeCount);
    }
    get fileContentKey() {
        return this._fileContentKey || (this._fileContentKey = getContentKey(this.fullPathHash));
    }
    get fileContent() {
        return this._ensureFileContentLoaded(), this.visited = !0, this._fileContent;
    }
    set fileContent(e) {
        this.visited = !0, this._fileContent = e;
    }
    get qyIndexPropTree() {
        var {
            created: e,
            _qyIndexPropTree: t,
            name: i,
            fileContent: n,
            underHiddenFolder: r
        } = this;
        if (e && r && i == IndexPropPathsFileName) {
            if (t) return t;
            var l, s = this._qyIndexPropTree = new QyIndexPropTree();
            for (l in n) s.insert(fromSingleName(l));
            return s;
        }
    }
    get isFile() {
        return !0;
    }
    get contentAsText() {
        var e = this.fileContent;
        return null == e ? "" : isNotNullObj(e) ? JSON.stringify(e) : e.toString();
    }
    get clonedContent() {
        return structuredClone(this.fileContent);
    }
    setContent(e) {
        this.fileContent = e;
    }
    view(e = $clone, t) {
        var i = this.fileContent;
        return null == i || isSimpleType(i) ? i : this._viewBySpec(i, e, t);
    }
    getProp(e, t = $clone, i) {
        var n;
        if (t) return e = getValByNamePath(this.fileContent, isArray(e) ? e : [ e ]), 
        n = t.$link, null != n ? this._link(e, n, t[$spec], i) : i || t === $raw ? e : structuredClone(e);
    }
    unloadFileContent() {
        this.created && this.fileContentLoaded && null != this._fileContent && (this._fileContent = void 0, 
        this.fileContentLoaded = !1);
    }
    _ensureFileContentLoaded() {
        var e;
        this.created && null == this._fileContent && !this.fileContentLoaded && (this.fileContentLoaded = !0, 
        e = this.qyCache, e) && (this._fileContent = e.qyKVData.getValueSync(this.fileContentKey));
    }
    _link(e, t, i, n) {
        let r = this.qyCache.getDir(t);
        if (isArray(e)) return e.map(e => this._getLinkedFileContent(r, e, i, n));
        if (isNotNullObj(e)) {
            var l, s = {};
            for (l in e) s[l] = this._getLinkedFileContent(r, l, i, n);
            return s;
        }
        return this._getLinkedFileContent(r, e, i, n);
    }
    _getLinkedFileContent(e, t, i, n) {
        if (e) {
            e = e.getFile(t);
            if (e) return e.view(i, n);
        }
        return t;
    }
    _viewBySpec(e, t, i) {
        if (t === $raw) return e;
        if (null != t) {
            if (isSimpleType(t)) return t ? i ? e : structuredClone(e) : void 0;
            var n = t.$link;
            if (null != n) return this._link(e, n, t[$spec]);
            if (isSimpleType(e)) return e;
            isArray(t) && (t = Object.fromEntries(t.filter(e => e).map(e => [ e, 1 ])));
            var r = isArray(e) ? [] : {}, {
                $all: l,
                "**": s
            } = t;
            if (l || s) for (var o in e) {
                var a = t[o] ?? l ?? s;
                a && (r[o] = this._viewBySpec(e[o], a, i));
            } else for (var h in t) {
                var u = t[h];
                u && (r[h] = this._viewBySpec(e[h], u, i));
            }
            return r;
        }
    }
}

Object.assign(module.exports, {
    QyFile: QyFile
});