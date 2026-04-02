import {
    QyItem as e
} from "./QyItem.js";

import {
    getSubdirMapKey as i,
    getFileMapKey as t,
    SpecialFilePaths as r,
    arrayLast as s,
    isString as d
} from "./QyUtils.js";

import {
    QyFile as a
} from "./QyFile.js";

let u = r.HiddenFolderName;

class h extends e {
    _subdirCount = 0;
    _fileCount = 0;
    subdirMapChangeCount = 0;
    fileMapChangeCount = 0;
    dChangeId = 0;
    fChangeId = 0;
    cache = {};
    constructor(e, i = !1, t = void 0, r = void 0) {
        super(e, i, t), r && (this._qyCache = r), t && i && (++t._subdirCount, ++t.subdirMapChangeCount);
    }
    get created() {
        return this._created;
    }
    set created(e) {
        var i;
        this._created != (e = !!e) && (this._created = e, i = this.parentDir, i) && (i._subdirCount += e ? 1 : -1, 
        ++i.subdirMapChangeCount);
    }
    get fileCount() {
        return o(this), this._fileCount;
    }
    get subdirCount() {
        return n(this), this._subdirCount;
    }
    get isDir() {
        return !0;
    }
    get isEmpty() {
        return 0 == this.fileCount && 0 == this.subdirCount;
    }
    get isHiddenFolder() {
        return this.name == u;
    }
    get subdirMapKey() {
        return this._subdirMapKey || (this._subdirMapKey = i(this.fullPathHash));
    }
    get fileMapKey() {
        return this._fileMapKey || (this._fileMapKey = t(this.fullPathHash));
    }
    get subdirMap() {
        return n(this), this._subdirMap;
    }
    get fileMap() {
        return o(this), this._fileMap;
    }
    getSubdir(e) {
        var i;
        if (this.created) return "." === e ? this : ".." === e ? this.parentDir || this : "/" === e ? this.qyCache?.rootDir : (i = this.subdirMap, 
        (i = i && i[e])?.created ? i : void 0);
    }
    getFile(e) {
        var {
            created: i,
            fileMap: t
        } = this, i = i && t && t[e];
        return i?.created ? i : void 0;
    }
    getOrCreateSubdir(e, i = !1) {
        if ("." === e) return this;
        if (".." === e) return this.parentDir || this;
        if ("/" === e) return this.qyCache?.rootDir || this;
        let t = this.subdirMap;
        var r = (t = t || (this._subdirMap = {}))[e];
        return r || (r = t[e] = new h(e, i, this), this.setChildTriggerNodes(r)), 
        r;
    }
    getOrCreateFile(e, i = !1) {
        let t = this.fileMap;
        var r = (t = t || (this._fileMap = {}))[e];
        return r || (r = t[e] = new a(e, i, this), this.setChildTriggerNodes(r)), 
        r;
    }
    searchSubdir(i, t = i.length) {
        let r = this;
        for (let e = 0; e < t; ++e) {
            var s = i[e];
            if (null != s && "" !== s && !(r = r.getSubdir(s))) return;
        }
        return r;
    }
    searchOrCreateSubdir(i, t = !1, r = i.length) {
        let s = this;
        for (let e = 0; e < r; ++e) {
            var a = i[e];
            null != a && "" !== a && (s = s.getOrCreateSubdir(a, t));
        }
        return s;
    }
    searchFile(e) {
        var i = this.searchSubdir(e, e.length - 1);
        if (i) return i.getFile(s(e));
    }
    searchOrCreateFile(e, i = !1) {
        return this.searchOrCreateSubdir(e, i, e.length - 1).getOrCreateFile(s(e), i);
    }
    get subdirList() {
        return l(this, "_subdirList", this.subdirMapChangeCount, () => this.created && this.subdirMap ? Object.values(this.subdirMap).filter(e => e.created) : []);
    }
    get subdirNameList() {
        return l(this, "_subdirNameList", this.subdirMapChangeCount, () => this.subdirList.map(e => e.name));
    }
    get sortedSubdirList() {
        return l(this, "_sortedSubdirList", this.subdirMapChangeCount, () => this.subdirList.sort((e, i) => e.cmp(i)));
    }
    get sortedSubdirNameList() {
        return l(this, "_sortedSubdirNameList", this.subdirMapChangeCount, () => this.sortedSubdirList.map(e => e.nameNum));
    }
    get fileList() {
        return l(this, "_fileList", this.fileMapChangeCount, () => this.created && this.fileMap ? Object.values(this.fileMap).filter(e => e.created) : []);
    }
    get fileNameList() {
        return l(this, "_fileNameList", this.fileMapChangeCount, () => this.fileList.map(e => e.name));
    }
    get sortedFileList() {
        return l(this, "_sortedFileList", this.fileMapChangeCount, () => this.fileList.sort((e, i) => e.cmp(i)));
    }
    get sortedFileNameList() {
        return l(this, "_sortedFileNameList", this.fileMapChangeCount, () => this.sortedFileList.map(e => e.nameNum));
    }
    *allSubdirs() {
        var e, i, t = this.subdirList;
        for (e of t) e.isHiddenFolder || (yield* e.allSubdirs());
        for (i of t) i.isHiddenFolder || (yield i);
    }
    *allLeafSubdirs() {
        for (var e of this.allSubdirs()) 0 == e.subdirCount && (yield e);
    }
    *allFiles() {
        for (var e of this.allSubdirs()) for (var i of e.fileList) yield i;
        for (var t of this.fileList) yield t;
    }
    *allLoadedSubdirs() {
        if (this.subdirMapLoaded) for (var e of this.subdirList) e.isHiddenFolder || (yield* e.allLoadedSubdirs(), 
        yield e);
    }
    setChildTriggerNodes(e) {
        var i = this.triggerNodes;
        if (i) {
            var t, r, s = e.triggerNodes || [], a = (s.length = 0, e).name;
            for ({
                children: {
                    "*": t,
                    [a]: r
                }
            } of i) t && s.push(t), r && s.push(r);
            e.triggerNodes = 0 < s.length ? s : void 0;
        } else e.triggerNodes = void 0;
    }
    *filterSubdirNames(e) {
        for (var i of this.subdirList) e(i.name) && (yield i);
    }
    *compareSubdirRangeL2H(e) {
        var i, t = this.sortedSubdirList;
        let r = !1;
        for (i of t) {
            var s = i.nameNum;
            if (d(s)) {
                if (r) return;
            } else if (e(s)) yield i, r = !0; else if (r) return;
        }
    }
    *compareSubdirRangeH2L(i) {
        var t = this.sortedSubdirList;
        let r = !1;
        for (let e = t.length - 1; 0 <= e; --e) {
            var s = t[e], a = s.nameNum;
            if (d(a)) {
                if (r) return;
            } else if (i(a)) yield s, r = !0; else if (r) return;
        }
    }
}

function l(e, i, t, r) {
    var e = e.cache, s = i + "ChangeCount";
    return e[i] && e[s] == t || (e[i] = r(), e[s] = t), e[i];
}

function n(e) {
    if (e.created && !e._subdirMap && !e.subdirMapLoaded) {
        e.subdirMapLoaded = !0;
        var i = e.qyCache;
        if (i) {
            i = i.qyKVData.getValueSync(e.subdirMapKey);
            if (i) {
                var t, r = e._subdirMap = {};
                for (t in i) r[t] = new h(t, !0, e);
            }
        }
    }
}

function o(e) {
    if (e.created && !e._fileMap && !e.fileMapLoaded) {
        e.fileMapLoaded = !0;
        var i = e.qyCache;
        if (i) {
            i = i.qyKVData.getValueSync(e.fileMapKey);
            if (i) {
                var t, r = e._fileMap = {};
                for (t in i) r[t] = new a(t, !0, e);
            }
        }
    }
}

export {
    h as QyDir
};