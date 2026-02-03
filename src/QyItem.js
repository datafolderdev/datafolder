let {
    calHash,
    SpecialFilePaths
} = require("./QyUtils.js"), HiddenFolderName = SpecialFilePaths.HiddenFolderName, Flag_Created = 1, Flag_UnderHiddenFolder = 2, Flag_SubdirMapLoaded = 4, Flag_FileMapLoaded = 8, Flag_FileContentLoaded = 16, Flag_Visited = 32;

class QyItem {
    constructor(e, t, a) {
        e = e.toString(), Object.assign(this, {
            name: e,
            parentDir: a,
            flagInt: 0
        }), this._created = t, a && (a.name == HiddenFolderName || a.underHiddenFolder) && (this.flagInt |= Flag_UnderHiddenFolder);
    }
    _getFlag(e) {
        return 0 != (this.flagInt & e);
    }
    _setFlag(e, t) {
        t ? this.flagInt |= e : this.flagInt &= ~e;
    }
    get qyCache() {
        var e = this.parentDir;
        return e ? e.qyCache : this._qyCache;
    }
    get _created() {
        return this._getFlag(Flag_Created);
    }
    set _created(e) {
        this._setFlag(Flag_Created, e);
    }
    get subdirMapLoaded() {
        return this._getFlag(Flag_SubdirMapLoaded);
    }
    set subdirMapLoaded(e) {
        return this._setFlag(Flag_SubdirMapLoaded, e);
    }
    get fileMapLoaded() {
        return this._getFlag(Flag_FileMapLoaded);
    }
    set fileMapLoaded(e) {
        this._setFlag(Flag_FileMapLoaded, e);
    }
    get fileContentLoaded() {
        return this._getFlag(Flag_FileContentLoaded);
    }
    set fileContentLoaded(e) {
        this._setFlag(Flag_FileContentLoaded, e);
    }
    get visited() {
        return this._getFlag(Flag_Visited);
    }
    set visited(e) {
        this._setFlag(Flag_Visited, e);
    }
    get nameNum() {
        var e;
        return this._nameNum || (e = +this.name, this._nameNum = isNaN(e) ? this.name : e);
    }
    cmp({
        nameNum: e
    }) {
        var t = this.nameNum;
        return t < e ? -1 : e < t ? 1 : 0;
    }
    get fullPath() {
        var e, t;
        return null == this._fullPath && ({
            parentDir: e,
            name: t
        } = this, this._fullPath = e ? e.fullPath + "/" + t : t), this._fullPath;
    }
    get fullPathHash() {
        var e, t;
        return null == this._fullPathHash && ({
            parentDir: e,
            name: t
        } = this, this._fullPathHash = calHash(e ? e.fullPathHash + t : t)), this._fullPathHash;
    }
    get isItem() {
        return !0;
    }
    get underHiddenFolder() {
        return this.flagInt & Flag_UnderHiddenFolder;
    }
    get parentList() {
        if (null == this._parentList) {
            var t = this._parentList = [];
            let e = this.parentDir;
            for (;e.parentDir; ) t.push(e), e = e.parentDir;
            t.reverse();
        }
        return this._parentList;
    }
    get parentNamePath() {
        return null == this._parentNameList && (this._parentNameList = this.parentList.map(e => e.name)), 
        this._parentNameList;
    }
    get namePath() {
        return null == this._namePath && (this._namePath = [ ...this.parentNamePath, this.name ]), 
        this._namePath;
    }
}

Object.assign(module.exports, {
    QyItem: QyItem
});