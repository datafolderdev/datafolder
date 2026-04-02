import {
    calHash as a,
    SpecialFilePaths as t
} from "./QyUtils.js";

let i = t.HiddenFolderName;

class e {
    name;
    parentDir;
    flagInt;
    constructor(t, e = !1, a) {
        this.name = t.toString(), this.parentDir = a, this.flagInt = 0, this._created = e, 
        a && (a.name == i || a.underHiddenFolder) && (this.flagInt |= 2);
    }
    get qyCache() {
        var t = this.parentDir;
        return t ? t.qyCache : this._qyCache;
    }
    get _created() {
        return r(this, 1);
    }
    set _created(t) {
        n(this, 1, t);
    }
    get subdirMapLoaded() {
        return r(this, 4);
    }
    set subdirMapLoaded(t) {
        n(this, 4, t);
    }
    get fileMapLoaded() {
        return r(this, 8);
    }
    set fileMapLoaded(t) {
        n(this, 8, t);
    }
    get fileContentLoaded() {
        return r(this, 16);
    }
    set fileContentLoaded(t) {
        n(this, 16, t);
    }
    get visited() {
        return r(this, 32);
    }
    set visited(t) {
        n(this, 32, t);
    }
    get nameNum() {
        var t = this._nameNum;
        return null != t ? t : (t = +this.name, this._nameNum = isNaN(t) ? this.name : t);
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
        return r(this, 2);
    }
    get parentList() {
        if (null == this._parentList) {
            var e = this._parentList = [];
            let t = this.parentDir;
            if (null != t) {
                for (;t.parentDir; ) e.push(t), t = t.parentDir;
                e.reverse();
            }
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

function r(t, e) {
    return 0 != (t.flagInt & e);
}

function n(t, e, a) {
    a ? t.flagInt |= e : t.flagInt &= ~e;
}

export {
    e as QyItem
};