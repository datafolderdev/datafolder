import {
    calHash as a,
    SpecialFilePaths as t
} from "./QyUtils.js";

let s = t.HiddenFolderName;

class e {
    constructor(t, e, a) {
        t = t.toString(), Object.assign(this, {
            name: t,
            parentDir: a,
            flagInt: 0
        }), this._created = e, a && (a.name == s || a.underHiddenFolder) && (this.flagInt |= 2);
    }
    _getFlag(t) {
        return 0 != (this.flagInt & t);
    }
    _setFlag(t, e) {
        e ? this.flagInt |= t : this.flagInt &= ~t;
    }
    get qyCache() {
        var t = this.parentDir;
        return t ? t.qyCache : this._qyCache;
    }
    get _created() {
        return this._getFlag(1);
    }
    set _created(t) {
        this._setFlag(1, t);
    }
    get subdirMapLoaded() {
        return this._getFlag(4);
    }
    set subdirMapLoaded(t) {
        return this._setFlag(4, t);
    }
    get fileMapLoaded() {
        return this._getFlag(8);
    }
    set fileMapLoaded(t) {
        this._setFlag(8, t);
    }
    get fileContentLoaded() {
        return this._getFlag(16);
    }
    set fileContentLoaded(t) {
        this._setFlag(16, t);
    }
    get visited() {
        return this._getFlag(32);
    }
    set visited(t) {
        this._setFlag(32, t);
    }
    get nameNum() {
        var t;
        return this._nameNum || (t = +this.name, this._nameNum = isNaN(t) ? this.name : t);
    }
    cmp({
        nameNum: t
    }) {
        var e = this.nameNum;
        return e < t ? -1 : t < e ? 1 : 0;
    }
    get fullPath() {
        var t, e;
        return null == this._fullPath && ({
            parentDir: t,
            name: e
        } = this, this._fullPath = t ? t.fullPath + "/" + e : e), this._fullPath;
    }
    get fullPathHash() {
        var t, e;
        return null == this._fullPathHash && ({
            parentDir: t,
            name: e
        } = this, this._fullPathHash = a(t ? t.fullPathHash + e : e)), this._fullPathHash;
    }
    get isItem() {
        return !0;
    }
    get underHiddenFolder() {
        return 2 & this.flagInt;
    }
    get parentList() {
        if (null == this._parentList) {
            var e = this._parentList = [];
            let t = this.parentDir;
            for (;t.parentDir; ) e.push(t), t = t.parentDir;
            e.reverse();
        }
        return this._parentList;
    }
    get parentNamePath() {
        return null == this._parentNameList && (this._parentNameList = this.parentList.map(t => t.name)), 
        this._parentNameList;
    }
    get namePath() {
        return null == this._namePath && (this._namePath = [ ...this.parentNamePath, this.name ]), 
        this._namePath;
    }
}

export {
    e as QyItem
};