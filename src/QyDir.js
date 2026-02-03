let QyItem = require("./QyItem.js").QyItem, {
    getSubdirMapKey,
    getFileMapKey,
    SpecialFilePaths,
    arrayLast
} = require("./QyUtils.js"), QyFile = require("./QyFile.js").QyFile, HiddenFolderName = SpecialFilePaths.HiddenFolderName;

class QyDir extends QyItem {
    constructor(e, i, t, r) {
        super(e, i, t), r && (this._qyCache = r), Object.assign(this, {
            _subdirCount: 0,
            _fileCount: 0,
            subdirMapChangeCount: 0,
            fileMapChangeCount: 0,
            dChangeId: 0,
            fChangeId: 0,
            cache: {}
        }), t && i && (++t._subdirCount, ++t.subdirMapChangeCount);
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
        return this._ensureFileMapLoaded(), this._fileCount;
    }
    get subdirCount() {
        return this._ensureSubdirMapLoaded(), this._subdirCount;
    }
    get isDir() {
        return !0;
    }
    get isEmpty() {
        return 0 == this.fileCount && 0 == this.subdirCount;
    }
    get isHiddenFolder() {
        return this.name == HiddenFolderName;
    }
    get subdirMapKey() {
        return this._subdirMapKey || (this._subdirMapKey = getSubdirMapKey(this.fullPathHash));
    }
    get fileMapKey() {
        return this._fileMapKey || (this._fileMapKey = getFileMapKey(this.fullPathHash));
    }
    get subdirMap() {
        return this._ensureSubdirMapLoaded(), this._subdirMap;
    }
    get fileMap() {
        return this._ensureFileMapLoaded(), this._fileMap;
    }
    getSubdir(e) {
        var i;
        if (this.created) return "." === e ? this : ".." === e ? this.parentDir || this : "/" === e ? this.qyCache.rootDir : (i = this.subdirMap, 
        (i = i && i[e])?.created ? i : void 0);
    }
    getFile(e) {
        var {
            created: i,
            fileMap: t
        } = this, i = i && t && t[e];
        return i?.created ? i : void 0;
    }
    getOrCreateSubdir(e, i) {
        if ("." === e) return this;
        if (".." === e) return this.parentDir || this;
        if ("/" === e) return this.qyCache.rootDir;
        let t = this.subdirMap;
        var r = (t = t || (this._subdirMap = {}))[e];
        return r || (r = t[e] = new QyDir(e, i, this), this.setChildTriggerNodes(r)), 
        r;
    }
    getOrCreateFile(e, i) {
        let t = this.fileMap;
        var r = (t = t || (this._fileMap = {}))[e];
        return r || (r = t[e] = new QyFile(e, i, this), this.setChildTriggerNodes(r)), 
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
    searchOrCreateSubdir(i, t, r = i.length) {
        let s = this;
        for (let e = 0; e < r; ++e) {
            var a = i[e];
            null != a && "" !== a && (s = s.getOrCreateSubdir(a, t));
        }
        return s;
    }
    searchFile(e) {
        var i = this.searchSubdir(e, e.length - 1);
        if (i) return i.getFile(arrayLast(e));
    }
    searchOrCreateFile(e, i) {
        return this.searchOrCreateSubdir(e, i, e.length - 1).getOrCreateFile(arrayLast(e));
    }
    get subdirList() {
        return this._getCachedValue("_subdirList", this.subdirMapChangeCount, () => this.created && this.subdirMap ? Object.values(this.subdirMap).filter(e => e.created) : []);
    }
    get subdirNameList() {
        return this._getCachedValue("_subdirNameList", this.subdirMapChangeCount, () => this.subdirList.map(e => e.name));
    }
    get sortedSubdirList() {
        return this._getCachedValue("_sortedSubdirList", this.subdirMapChangeCount, () => this.subdirList.sort((e, i) => e.cmp(i)));
    }
    get sortedSubdirNameList() {
        return this._getCachedValue("_sortedSubdirNameList", this.subdirMapChangeCount, () => this.sortedSubdirList.map(e => e.nameNum));
    }
    get fileList() {
        return this._getCachedValue("_fileList", this.fileMapChangeCount, () => this.created && this.fileMap ? Object.values(this.fileMap).filter(e => e.created) : []);
    }
    get fileNameList() {
        return this._getCachedValue("_fileNameList", this.fileMapChangeCount, () => this.fileList.map(e => e.name));
    }
    get sortedFileList() {
        return this._getCachedValue("_sortedFileList", this.fileMapChangeCount, () => this.fileList.sort((e, i) => e.cmp(i)));
    }
    get sortedFileNameList() {
        return this._getCachedValue("_sortedFileNameList", this.fileMapChangeCount, () => this.sortedFileList.map(e => e.nameNum));
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
    _getCachedValue(e, i, t) {
        var r = this.cache, s = e + "ChangeCount";
        return r[e] && r[s] == i || (r[e] = t(), r[s] = i), r[e];
    }
    _ensureSubdirMapLoaded() {
        if (this.created && !this._subdirMap && !this.subdirMapLoaded) {
            this.subdirMapLoaded = !0;
            var e = this.qyCache;
            if (e) {
                e = e.qyKVData.getValueSync(this.subdirMapKey);
                if (e) {
                    var i, t = this._subdirMap = {};
                    for (i in e) t[i] = new QyDir(i, !0, this);
                }
            }
        }
    }
    _ensureFileMapLoaded() {
        if (this.created && !this._fileMap && !this.fileMapLoaded) {
            this.fileMapLoaded = !0;
            var e = this.qyCache;
            if (e) {
                e = e.qyKVData.getValueSync(this.fileMapKey);
                if (e) {
                    var i, t = this._fileMap = {};
                    for (i in e) t[i] = new QyFile(i, !0, this);
                }
            }
        }
    }
}

Object.assign(module.exports, {
    QyDir: QyDir
});