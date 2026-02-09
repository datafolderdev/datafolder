import {
    isString as e,
    pathSplit as s
} from "./QyUtils.js";

class r {
    constructor(r) {
        this.qyCache = r;
    }
    cd(r, i = this.currentDir) {
        return e(r) && (r = s(r)), this.cdP(r, i);
    }
    cdP(r, i = this.currentDir) {
        return this.currentDir = this.qyCache.getOrCreateDir(r, i), this;
    }
    dir(r, i = this.currentDir) {
        return e(r) && (r = s(r)), this.dirP(r, i);
    }
    dirP(r, i = this.currentDir) {
        return this.qyCache.getDir(r, i);
    }
    indexDir(r, i, t = this.currentDir) {
        return e(r) && (r = s(r)), e(i) && (i = s(i)), this.indexDirP(r, i, t);
    }
    indexDirP(r, i, t = this.currentDir) {
        var e = this.qyCache, r = e.getDir(r, t);
        if (r) {
            t = e.getIndexDir(r);
            if (t) return i && 0 != i.length ? e.getDir(i, t) : t;
        }
    }
    file(r, i = this.currentDir) {
        return e(r) && (r = s(r)), this.fileP(r, i);
    }
    fileP(r, i = this.currentDir) {
        return this.qyCache.getFile(r, i);
    }
    triggerFile(r) {
        return this.qyCache.getTriggerFile(r);
    }
    view(r, i, t = this.currentDir) {
        return e(r) && (r = s(r)), this.viewP(r, i, t);
    }
    viewP(r, i, t = this.currentDir) {
        return this.qyCache.getFile(r, t)?.view(i);
    }
    queryFiles(r, i, t, e, s = this.currentDir) {
        return this.qyCache.queryFiles(r, i, t, e, s);
    }
    queryFilesMulti(r, i, t, e = this.currentDir) {
        return this.qyCache.queryFilesMulti(r, i, t, e);
    }
    resetCurrentDir() {
        this.currentDir = void 0;
    }
}

export {
    r as QyCD
};