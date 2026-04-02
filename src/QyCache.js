import {
    join as v
} from "node:path";

import r from "node:events";

import {
    QyDir as o
} from "./QyDir.js";

import {
    QyFileLogger as a
} from "./QyFileLogger.js";

import {
    QyKVData as s
} from "./QyKVData.js";

import {
    QyTriggerNode as f,
    updateTriggerNodes as g
} from "./QyTrigger.js";

import {
    isString as C,
    lockExclusiveFilePath as q,
    unlockExclusiveFilePath as i
} from "./QyUtils.js";

import {
    dumpStructure as R
} from "./QyStructure.js";

import {
    getIndexPropPaths as n,
    parseNamePathAndQuery as l
} from "./QyIndex.js";

import {
    getDefaultOptions as d
} from "./QyDefaultOptions.js";

import {
    ensureDir as x,
    SpecialFilePaths as e
} from "./QyUtils.js";

import {
    QueryCounter as p
} from "./QyUnionNode.js";

import {
    QyKVDataLoader as Q
} from "./QyKVDataLoader.js";

import {
    requireFromModCode as u
} from "./QyMod.js";

import {
    logger as S
} from "./QyLogger.js";

let {
    IndexDirPath: L,
    TriggerDirPath: P,
    RpcDirPath: O
} = e;

class t extends r {
    rootFolder;
    options;
    qyDB;
    kvFolder;
    rpcFolder;
    rootDir;
    triggerRootDir;
    rpcRootDir;
    indexRootDir;
    exclusiveFilePath;
    qyKVData;
    qyFileLogger;
    rpcFunMap = {};
    constructor(r, e, t) {
        super(), e = {
            ...d("QyCache"),
            ...e
        };
        var i = v(r, "qykv");
        Object.assign(this, {
            rootFolder: r,
            options: e,
            qyDB: t,
            kvFolder: i,
            rpcFolder: v(r, "rpc"),
            rootDir: new o("", !0, void 0, this),
            exclusiveFilePath: v(r, ".opened"),
            qyKVData: new s(i, e, this),
            qyFileLogger: new a(v(r, "qylog"), e)
        });
    }
    async start() {
        var {
            rootFolder: r,
            kvFolder: e,
            options: t,
            qyKVData: i,
            qyFileLogger: o,
            exclusiveFilePath: a,
            rootDir: s
        } = this;
        S.log(`Starting at ${r}...`);
        try {
            await x(e), o.start();
            var [ {
                maxChangeId: g,
                loadedMaxAclNum: n,
                qySnapshots: l,
                aclKeyValueMap: d
            } ] = await Promise.all([ ((r, e) => (r = new Q(r, e)).load())(e, t), q(a) ]);
            i.start(g, n, l, d);
        } catch (r) {
            throw o.stop(), r;
        }
        t.preloadFoldersAtStart && !function r(e) {
            let {
                subdirList: t,
                fileMap: i
            } = e;
            for (var o of t) r(o);
        }(s), this.indexRootDir = s.searchOrCreateSubdir(L);
        var p = this, e = p.rootDir;
        e.triggerNodes = [ new f() ], p.triggerRootDir = e.searchOrCreateSubdir(P);
        for (u of p.triggerRootDir.fileList) {
            var {
                name: u,
                fileContent: h
            } = u, {
                fileNamePath: h,
                propNamePathList: c,
                modCode: D
            } = h;
            p.insertTriggerToTree(u, h, c, D);
        }
        var y = this;
        y.rpcRootDir = y.rootDir.searchOrCreateSubdir(O);
        for (F of y.rpcRootDir.fileList) {
            var {
                name: F,
                fileContent: m
            } = F;
            C(m) && y.insertRpc(F, m);
        }
        return t.dumpStructureAtStart && await R(v(r, "qystruct"), s), S.log("Started."), 
        this;
    }
    async stop() {
        S.log("Stopping...");
        var {
            qyKVData: r,
            qyFileLogger: e,
            exclusiveFilePath: t
        } = this;
        return await r.stop(), S.log("qyFileLogger stopped."), await e.stop(), i(t), 
        Object.assign(this, {
            rootDir: void 0,
            indexRootDir: void 0,
            qyKVData: void 0,
            rpcFunMap: void 0,
            qyDB: void 0,
            qyFileLogger: void 0,
            triggerRootDir: void 0,
            rpcRootDir: void 0
        }), S.log("Stopped."), this;
    }
    increaseChangeId() {
        return this.qyKVData.increaseChangeId();
    }
    decreaseChangeId() {
        this.qyKVData.decreaseChangeId();
    }
    save(r, e, t, i, o) {
        var {
            qyKVData: a,
            qyFileLogger: s
        } = this;
        return t && s.save(r, t), a.save(r, e, i, o);
    }
    getFile(r, e = this.rootDir) {
        return r.isFile ? r : C(r) ? e.getFile(r) : e.searchFile(r);
    }
    getDir(r, e = this.rootDir) {
        return r.isDir ? r : C(r) ? e.getSubdir(r) : e.searchSubdir(r);
    }
    getOrCreateFile(r, e = this.rootDir) {
        return r.isFile ? r : C(r) ? e.getOrCreateFile(r) : e.searchOrCreateFile(r);
    }
    getOrCreateDir(r, e = this.rootDir) {
        return r.isDir ? r : C(r) ? e.getOrCreateSubdir(r) : e.searchOrCreateSubdir(r);
    }
    getIndexDir(r) {
        return this.indexRootDir?.getSubdir(r.fullPathHash);
    }
    getOrCreateIndexDir(r) {
        return this.indexRootDir?.getOrCreateSubdir(r.fullPathHash);
    }
    getTriggerFile(r) {
        return this.triggerRootDir.getFile(r);
    }
    getOrCreateTriggerFile(r) {
        return this.triggerRootDir.getOrCreateFile(r);
    }
    get triggerFileList() {
        return this.triggerRootDir.fileList;
    }
    getRpcFile(r) {
        return this.rpcRootDir.getFile(r);
    }
    getOrCreateRpcFile(r) {
        return this.rpcRootDir.getOrCreateFile(r);
    }
    get rpcFileList() {
        return this.rpcRootDir.fileList;
    }
    insertTriggerToTree(r, e, t, i) {
        var {
            rootDir: o,
            qyDB: a
        } = this, i = u("trigger", r, i, a);
        o.triggerNodes[0].insertTrigger(r, e, t, i), g(o, e);
    }
    removeTriggerFromTree(r, e) {
        var t = this.rootDir;
        t.triggerNodes[0].removeTrigger(r, e) && g(t, e);
    }
    insertRpc(r, e) {
        var {
            rpcFunMap: t,
            qyDB: i
        } = this, e = u("rpc", r, e, i);
        e && (t[r] = e);
    }
    removeRpc(r) {
        delete this.rpcFunMap[r];
    }
    queryFiles(r, e, t, i, o = this.rootDir) {
        var a = [], t = (C(e) && !t && (t = 1), new p(t, i)), i = this.options.queryAutoCreateIndex;
        return h(r, e, a, t, o, i), a;
    }
    queryFilesMulti(r, e, t, i = this.rootDir) {
        var o, a, s = [], g = new p(e, t), n = this.options.queryAutoCreateIndex;
        for ([ o, a ] of r) h(o, a, s, g, i, n);
        return s;
    }
    async callRpc(e, r, t) {
        var i, o = this.rpcFunMap[e];
        if (!o) return S.warn(i = `RPC ${e} not implemented.`), new Error(i);
        try {
            return await o(r, t);
        } catch (r) {
            return S.error(`Calling RPC ${e} failed:`, r), r;
        }
    }
}

function h(r, e, t, i, o, a) {
    e && (a = a ? n(e) : void 0, l(r, o, a, e, t, i));
}

export {
    t as QyCache
};