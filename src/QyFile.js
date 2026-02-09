import {
    QyItem as e
} from "./QyItem.js";

import {
    SpecialOperators as t,
    SpecialFilePaths as n,
    getContentKey as i,
    isNotNullObj as a,
    isSimpleType as C,
    fromSingleName as s
} from "./QyUtils.js";

import {
    getValByNamePath as r
} from "./QyFileContentUtils.js";

import {
    QyIndexPropTree as f
} from "./QyIndexPropTree.js";

let d = Array.isArray, u = n.IndexPropPathsFileName, {
    $spec: h,
    $raw: c,
    $clone: l
} = t;

class o extends e {
    constructor(e, t, n) {
        super(e, t, n), t && (++n._fileCount, ++n.fileMapChangeCount), this.cChangeId = 0;
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
        return this._fileContentKey || (this._fileContentKey = i(this.fullPathHash));
    }
    get fileContent() {
        var e, t = this;
        return t.created && null == t._fileContent && !t.fileContentLoaded && (t.fileContentLoaded = !0, 
        e = t.qyCache) && (t._fileContent = e.qyKVData.getValueSync(t.fileContentKey)), 
        this.visited = !0, this._fileContent;
    }
    set fileContent(e) {
        this.visited = !0, this._fileContent = e;
    }
    get qyIndexPropTree() {
        var {
            created: e,
            _qyIndexPropTree: t,
            name: n,
            fileContent: i,
            underHiddenFolder: r
        } = this;
        if (e && r && n == u) {
            if (t) return t;
            var l, o = this._qyIndexPropTree = new f();
            for (l in i) o.insert(s(l));
            return o;
        }
    }
    get isFile() {
        return !0;
    }
    get contentAsText() {
        var e = this.fileContent;
        return null == e ? "" : a(e) ? JSON.stringify(e) : e.toString();
    }
    get clonedContent() {
        return structuredClone(this.fileContent);
    }
    setContent(e) {
        this.fileContent = e;
    }
    view(e = l, t) {
        var n = this.fileContent;
        return null == n || C(n) ? n : function t(n, i, r, l) {
            if (r === c) return i;
            if (null == r) return;
            if (C(r)) return r ? l ? i : structuredClone(i) : void 0;
            let e = r.$link;
            if (null != e) return y(n, i, e, r[h]);
            if (C(i)) return i;
            d(r) && (r = Object.fromEntries(r.filter(e => e).map(e => [ e, 1 ])));
            let o = d(i) ? [] : {};
            let {
                $all: s,
                "**": a
            } = r;
            if (s || a) for (var f in i) {
                let e = r[f] ?? s ?? a;
                e && (o[f] = t(n, i[f], e, l));
            } else for (var u in r) {
                let e = r[u];
                e && (o[u] = t(n, i[u], e, l));
            }
            return o;
        }(this, n, e, t);
    }
    prop(e, t = l, n) {
        var i;
        if (t) return e = r(this.fileContent, d(e) ? e : [ e ]), i = t.$link, null != i ? y(this, e, i, t[h], n) : n || t === c ? e : structuredClone(e);
    }
    unloadFileContent() {
        this.created && this.fileContentLoaded && null != this._fileContent && (this._fileContent = void 0, 
        this.fileContentLoaded = !1);
    }
}

function p(e, t, n, i) {
    if (e) {
        e = e.getFile(t);
        if (e) return e.view(n, i);
    }
    return t;
}

function y(e, t, n, i, r) {
    let l = e.qyCache.getDir(n);
    if (d(t)) return t.map(e => p(l, e, i, r));
    if (a(t)) {
        var o, s = {};
        for (o in t) s[o] = p(l, o, i, r);
        return s;
    }
    return p(l, t, i, r);
}

export {
    o as QyFile
};