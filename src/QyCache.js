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
    isString as n,
    lockExclusiveFilePath as C,
    unlockExclusiveFilePath as i
} from "./QyUtils.js";

import {
    dumpStructure as q
} from "./QyStructure.js";

import {
    getIndexPropPaths as l,
    parseNamePathAndQuery as d
} from "./QyIndex.js";

import {
    getDefaultOptions as u
} from "./QyDefaultOptions.js";

import {
    ensureDir as R,
    SpecialFilePaths as e
} from "./QyUtils.js";

import {
    QueryCounter as p
} from "./QyUnionNode.js";

import {
    QyKVDataLoader as Q
} from "./QyKVDataLoader.js";

import {
    requireFromModCode as h
} from "./QyMod.js";

let {
    IndexDirPath: S,
    TriggerDirPath: x,
    RpcDirPath: O
} = e;

class t extends r {
    constructor(r, e, t) {
        super(), e = {
            ...u("QyCache"),
            ...e
        };
        var i = v(r, "qykv");
        Object.assign(this, {
            qyDB: t,
            rootFolder: r,
            kvFolder: i,
            rpcFolder: v(r, "rpc"),
            options: e,
            rootDir: new o("", !0, void 0, this),
            exclusiveFilePath: v(r, ".opened"),
            qyKVData: new s(i, e, this),
            qyFileLogger: new a(v(r, "qylog"), e),
            rpcFunMap: {}
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
        logger.log(`Starting at ${r}...`);
        try {
            await R(e), o.start();
            var [ {
                maxChangeId: g,
                loadedMaxAclNum: n,
                qySnapshots: l,
                aclKeyValueMap: d
            } ] = await Promise.all([ ((r, e) => (r = new Q(r, e)).load())(e, t), C(a) ]);
            await i.start(g, n, l, d);
        } catch (r) {
            throw o.stop(), r;
        }
        t.preloadFoldersAtStart && !function r(e) {
            let {
                subdirList: t,
                fileMap: i
            } = e;
            for (var o of t) r(o);
        }(s), this.indexRootDir = s.searchOrCreateSubdir(S);
        var u = this, e = u.rootDir;
        e.triggerNodes = [ new f() ], u.triggerRootDir = e.searchOrCreateSubdir(x);
        for (p of u.triggerRootDir.fileList) {
            var {
                name: p,
                fileContent: h
            } = p, {
                fileNamePath: h,
                propNamePathList: c,
                modCode: D
            } = h;
            u.insertTriggerToTree(p, h, c, D);
        }
        var y = this;
        y.rpcRootDir = y.rootDir.searchOrCreateSubdir(O);
        for (m of y.rpcRootDir.fileList) {
            var {
                name: m,
                fileContent: F
            } = m;
            F && (F = F.modCode, F) && y.insertRpc(m, F);
        }
        return t.dumpStructureAtStart && await q(v(r, "qystruct"), s), logger.log("Started."), 
        this;
    }
    async stop() {
        logger.log("Stopping...");
        var {
            qyKVData: r,
            qyFileLogger: e,
            exclusiveFilePath: t
        } = this;
        return await r.stop(), await e.stop(), i(t), Object.assign(this, {
            rootDir: void 0,
            indexRootDir: void 0,
            qyKVData: void 0,
            rpcFunMap: void 0,
            qyDB: void 0,
            qyFileLogger: void 0,
            triggerRootDir: void 0,
            rpcRootDir: void 0
        }), logger.log("Stopped."), this;
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
        return r.isFile ? r : n(r) ? e.getFile(r) : e.searchFile(r);
    }
    getDir(r, e = this.rootDir) {
        return r.isDir ? r : n(r) ? e.getSubdir(r) : e.searchSubdir(r);
    }
    getOrCreateFile(r, e = this.rootDir) {
        return r.isFile ? r : n(r) ? e.getOrCreateFile(r) : e.searchOrCreateFile(r);
    }
    getOrCreateDir(r, e = this.rootDir) {
        return r.isDir ? r : n(r) ? e.getOrCreateSubdir(r) : e.searchOrCreateSubdir(r);
    }
    getIndexDir(r) {
        return this.indexRootDir.getSubdir(r.fullPathHash);
    }
    getOrCreateIndexDir(r) {
        return this.indexRootDir.getOrCreateSubdir(r.fullPathHash);
    }
    getTriggerFile(r) {
        return this.triggerRootDir.getFile(r);
    }
    getOrCreateTriggerFile(r) {
        return this.triggerRootDir.getOrCreateFile(r);
    }
    getRpcFile(r) {
        return this.rpcRootDir.getFile(r);
    }
    getOrCreateRpcFile(r) {
        return this.rpcRootDir.getOrCreateFile(r);
    }
    insertTriggerToTree(r, e, t, i) {
        var {
            rootDir: o,
            qyDB: a
        } = this, i = h("trigger", r, i, a);
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
        } = this, e = h("rpc", r, e, i);
        e && (t[r] = e);
    }
    removeRpc(r) {
        delete this.rpcFunMap[r];
    }
    queryFiles(r, e, t, i, o = this.rootDir) {
        var a = [], t = (n(e) && null == t && (t = 1), new p(t, i)), i = this.options.queryAutoCreateIndex;
        return c(r, e, a, t, o, i), a;
    }
    queryFilesMulti(r, e, t, i = this.rootDir) {
        var o, a, s = [], g = new p(e, t), n = this.options.queryAutoCreateIndex;
        for ([ o, a ] of r) c(o, a, s, g, i, n);
        return s;
    }
    async callRpc(e, r, t) {
        var i, o = this.rpcFunMap[e];
        if (!o) return i = `RPC ${e} not implemented.`, logger.warn(i), new Error(i);
        try {
            return await o(r, t);
        } catch (r) {
            return logger.error(`Calling RPC ${e} failed:`, r), r;
        }
    }
}

function c(r, e, t, i, o, a) {
    e && (a = a ? l(e) : void 0, d(r, o, a, e, t, i));
}

export {
    t as QyCache
};