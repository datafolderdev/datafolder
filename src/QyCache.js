let path = require("node:path"), EventEmitter = require("node:events"), QyDir = require("./QyDir.js").QyDir, QyFileLogger = require("./QyFileLogger.js").QyFileLogger, QyKVData = require("./QyKVData.js").QyKVData, {
    QyTriggerNode,
    updateTriggerNodes
} = require("./QyTrigger.js"), {
    isString,
    lockExclusiveFilePath,
    unlockExclusiveFilePath
} = require("./QyUtils.js"), dumpStructure = require("./QyStructure.js").dumpStructure, {
    getIndexPropPaths,
    parseNamePathAndQuery
} = require("./QyIndex.js"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, {
    ensureDir,
    SpecialFilePaths
} = require("./QyUtils.js"), QueryCounter = require("./QyUnionNode.js").QueryCounter, QyKVDataLoader = require("./QyKVDataLoader.js").QyKVDataLoader, requireFromModCode = require("./QyMod.js").requireFromModCode, {
    IndexDirPath,
    TriggerDirPath,
    RpcDirPath
} = SpecialFilePaths;

class QyCache extends EventEmitter {
    constructor(e, r, t) {
        super(), r = {
            ...getDefaultOptions("QyCache"),
            ...r
        };
        var i = path.join(e, "qykv");
        Object.assign(this, {
            qyDB: t,
            rootFolder: e,
            kvFolder: i,
            rpcFolder: path.join(e, "rpc"),
            options: r,
            rootDir: new QyDir("", !0, void 0, this),
            exclusiveFilePath: path.join(e, ".opened"),
            qyKVData: new QyKVData(i, r, this),
            qyFileLogger: new QyFileLogger(path.join(e, "qylog"), r),
            rpcFunMap: {}
        });
    }
    async start() {
        var {
            rootFolder: e,
            kvFolder: r,
            options: t,
            qyKVData: i,
            qyFileLogger: a,
            exclusiveFilePath: o,
            rootDir: s
        } = this;
        logger.log(`Starting at ${e}...`);
        try {
            await ensureDir(r), a.start();
            var [ {
                maxChangeId: g,
                loadedMaxAclNum: n,
                qySnapshots: l,
                aclKeyValueMap: u
            } ] = await Promise.all([ this._loadQyKVData(r, t), lockExclusiveFilePath(o) ]);
            await i.start(g, n, l, u);
        } catch (e) {
            throw a.stop(), e;
        }
        return t.preloadFoldersAtStart && this._preloadFolders(s), this.indexRootDir = s.searchOrCreateSubdir(IndexDirPath), 
        this._initTriggers(), this._initRpcs(), t.dumpStructureAtStart && await dumpStructure(path.join(e, "qystruct"), s), 
        logger.log("Started."), this;
    }
    async stop() {
        logger.log("Stopping...");
        var {
            qyKVData: e,
            qyFileLogger: r,
            exclusiveFilePath: t
        } = this;
        return await e.stop(), await r.stop(), unlockExclusiveFilePath(t), Object.assign(this, {
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
    save(e, r, t, i, a) {
        var {
            qyKVData: o,
            qyFileLogger: s
        } = this;
        return t && s.save(e, t), o.save(e, r, i, a);
    }
    getFile(e, r = this.rootDir) {
        return e.isFile ? e : isString(e) ? r.getFile(e) : r.searchFile(e);
    }
    getDir(e, r = this.rootDir) {
        return e.isDir ? e : isString(e) ? r.getSubdir(e) : r.searchSubdir(e);
    }
    getOrCreateFile(e, r = this.rootDir) {
        return e.isFile ? e : isString(e) ? r.getOrCreateFile(e) : r.searchOrCreateFile(e);
    }
    getOrCreateDir(e, r = this.rootDir) {
        return e.isDir ? e : isString(e) ? r.getOrCreateSubdir(e) : r.searchOrCreateSubdir(e);
    }
    getIndexDir(e) {
        return this.indexRootDir.getSubdir(e.fullPathHash);
    }
    getOrCreateIndexDir(e) {
        return this.indexRootDir.getOrCreateSubdir(e.fullPathHash);
    }
    getTriggerFile(e) {
        return this.triggerRootDir.getFile(e);
    }
    getOrCreateTriggerFile(e) {
        return this.triggerRootDir.getOrCreateFile(e);
    }
    getRpcFile(e) {
        return this.rpcRootDir.getFile(e);
    }
    getOrCreateRpcFile(e) {
        return this.rpcRootDir.getOrCreateFile(e);
    }
    insertTriggerToTree(e, r, t, i) {
        var {
            rootDir: a,
            qyDB: o
        } = this, i = requireFromModCode("trigger", e, i, o);
        a.triggerNodes[0].insertTrigger(e, r, t, i), updateTriggerNodes(a, r);
    }
    removeTriggerFromTree(e, r) {
        var t = this.rootDir;
        t.triggerNodes[0].removeTrigger(e, r) && updateTriggerNodes(t, r);
    }
    insertRpc(e, r) {
        var {
            rpcFunMap: t,
            qyDB: i
        } = this, r = requireFromModCode("rpc", e, r, i);
        r && (t[e] = r);
    }
    removeRpc(e) {
        delete this.rpcFunMap[e];
    }
    queryFiles(e, r, t, i, a = this.rootDir) {
        var o = [], t = (isString(r) && null == t && (t = 1), new QueryCounter(t, i));
        return this._queryFiles(e, r, o, t, a), o;
    }
    queryFilesMulti(e, r, t, i = this.rootDir) {
        var a, o, s = [], g = new QueryCounter(r, t);
        for ([ a, o ] of e) this._queryFiles(a, o, s, g, i);
        return s;
    }
    _queryFiles(e, r, t, i, a) {
        var o;
        r && (o = this.options.queryAutoCreateIndex, o = o ? getIndexPropPaths(r) : void 0, 
        parseNamePathAndQuery(e, a, o, r, t, i));
    }
    async callRpc(r, e, t) {
        var i, a = this.rpcFunMap[r];
        if (!a) return i = `RPC ${r} not implemented.`, logger.warn(i), new Error(i);
        try {
            return await a(e, t);
        } catch (e) {
            return logger.error(`Calling RPC ${r} failed:`, e), e;
        }
    }
    _preloadFolders(e) {
        var r, t = e.subdirMap;
        for (r in t) {
            var i = t[r];
            i.created && this._preloadFolders(i);
        }
        e._ensureFileMapLoaded();
    }
    _initTriggers() {
        var e, r = this.rootDir;
        r.triggerNodes = [ new QyTriggerNode() ], this.triggerRootDir = r.searchOrCreateSubdir(TriggerDirPath);
        for (e of this.triggerRootDir.fileList) {
            var {
                name: t,
                fileContent: i
            } = e, {
                fileNamePath: i,
                propNamePathList: a,
                modCode: o
            } = i;
            this.insertTriggerToTree(t, i, a, o);
        }
    }
    _initRpcs() {
        this.rpcRootDir = this.rootDir.searchOrCreateSubdir(RpcDirPath);
        for (var e of this.rpcRootDir.fileList) {
            var {
                name: e,
                fileContent: r
            } = e;
            r && (r = r.modCode, r) && this.insertRpc(e, r);
        }
    }
    _loadQyKVData(e, r) {
        return new QyKVDataLoader(e, r).load();
    }
}

Object.assign(module.exports, {
    QyCache: QyCache
});