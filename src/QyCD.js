import {
    isString as i,
    pathSplit as s
} from "./QyUtils.js";

class r {
    qyCache;
    currentDir;
    constructor(r) {
        this.qyCache = r;
    }
    cd(r, e = this.currentDir) {
        return i(r) && (r = s(r)), this.cdP(r, e);
    }
    cdP(r, e = this.currentDir) {
        return this.currentDir = this.qyCache?.getOrCreateDir(r, e), this;
    }
    dir(r, e = this.currentDir) {
        return i(r) && (r = s(r)), this.dirP(r, e);
    }
    dirP(r, e = this.currentDir) {
        return this.qyCache?.getDir(r, e);
    }
    indexDir(r, e, t = this.currentDir) {
        return i(r) && (r = s(r)), i(e) && (e = s(e)), this.indexDirP(r, e, t);
    }
    indexDirP(r, e, t = this.currentDir) {
        var i = this.qyCache, r = i?.getDir(r, t);
        if (r) {
            t = i?.getIndexDir(r);
            if (t) return e && 0 != e.length ? i?.getDir(e, t) : t;
        }
    }
    file(r, e = this.currentDir) {
        return i(r) && (r = s(r)), this.fileP(r, e);
    }
    fileP(r, e = this.currentDir) {
        return this.qyCache?.getFile(r, e);
    }
    triggerFile(r) {
        return this.qyCache.getTriggerFile(r);
    }
    get triggerFileList() {
        return this.qyCache.triggerFileList;
    }
    rpcFile(r) {
        return this.qyCache.getRpcFile(r);
    }
    get rpcFileList() {
        return this.qyCache.rpcFileList;
    }
    view(r, e = void 0, t = this.currentDir) {
        return i(r) && (r = s(r)), this.viewP(r, e, t);
    }
    viewP(r, e, t = this.currentDir) {
        return this.qyCache.getFile(r, t)?.view(e);
    }
    queryFiles(r, e, t, i, s = this.currentDir) {
        return this.qyCache.queryFiles(r, e, t, i, s);
    }
    queryFilesMulti(r, e, t, i = this.currentDir) {
        return this.qyCache.queryFilesMulti(r, e, t, i);
    }
    queryTree(r, e, t, i, s, h = this.currentDir) {
        return n(this.qyCache.queryFiles(r, e, i, s, h), t);
    }
    queryTreeMulti(r, e, t, i, s = this.currentDir) {
        return n(this.qyCache.queryFilesMulti(r, t, i, s), e);
    }
    resetCurrentDir() {
        this.currentDir = void 0;
    }
    fileListToTree(r, e) {
        return n(r, e);
    }
}

function n(r, t) {
    var i, s = {};
    for (i of r) {
        var h, n = i.parentList;
        let e = s;
        for (h of n) {
            var {
                name: u,
                fullPathHash: c
            } = h;
            let r = e.subdirMap;
            r = r || (e.subdirMap = {}), e = (e = r[u]) || (r[u] = {
                fullPathHash: c
            });
        }
        let r = e.fileMap;
        (r = r || (e.fileMap = {}))[i.name] = {
            fileContent: i.view(t, !0),
            fileContentKey: i.fileContentKey
        };
    }
    return {
        tree: s,
        count: r.length
    };
}

export {
    r as QyCD
};