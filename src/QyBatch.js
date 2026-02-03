let util = require("node:util"), {
    mergeContentAndGenDelta,
    objToDelMarks
} = require("./QyFileContentUtils.js"), {
    pathSplit,
    propNameSplit,
    isString,
    SpecialOperators,
    getSuffix,
    SpecialFilePaths,
    toSingleName,
    isSimpleType
} = require("./QyUtils.js"), QyAclCmdGenerator = require("./QyAcl.js").QyAclCmdGenerator, calDifferenceList = require("./QyIndex.js").calDifferenceList, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyCD = require("./QyCD.js").QyCD, getPrefixPropPaths = require("./QyIndexPropTree.js").getPrefixPropPaths, isArray = Array.isArray, $del = SpecialOperators.$del, IndexPropPathsFileName = SpecialFilePaths.IndexPropPathsFileName, File_Log_Level_Map = {
    none: 0,
    basic: 1,
    delta: 2,
    all: 3
};

class QyBatch extends QyCD {
    constructor(e, t) {
        super(e), t = {
            ...getDefaultOptions("QyBatch"),
            ...t
        };
        e = File_Log_Level_Map[t.fileLogLevel.toLowerCase()];
        Object.assign(this, {
            options: t,
            fileLogLevel: e ?? 1,
            qyAclCmdGenerator: new QyAclCmdGenerator(),
            qyCmdObjHistory: new QyCmdObjHistory(t.maxHistoryCmdObjCount),
            actionQueue: [],
            changeList: [],
            syncList: []
        });
    }
    createDir(e, t = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.createDirP(e, t);
    }
    createDirP(e, t = this.currentDir) {
        return this._pushAction("createDir", this.qyCache.getOrCreateDir(e, t));
    }
    delDir(e, t = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.delDirP(e, t);
    }
    delDirP(e, t = this.currentDir) {
        return this._pushAction("delDir", this.qyCache.getOrCreateDir(e, t));
    }
    createFile(e, t = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.createFileP(e, t);
    }
    createFileP(e, t = this.currentDir) {
        return this._pushAction("createFile", this.qyCache.getOrCreateFile(e, t));
    }
    delFile(e, t = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.delFileP(e, t);
    }
    delFileP(e, t = this.currentDir) {
        return this._pushAction("delFile", this.qyCache.getOrCreateFile(e, t));
    }
    createIndex(e, t, i = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.createIndexP(e, t, i);
    }
    createIndexP(e, t, i = this.currentDir) {
        return isArray(t) || (t = [ t ]), this._pushAction("createIndex", this.qyCache.getOrCreateDir(e, i), {
            indexPropPathList: t
        });
    }
    delIndex(e, t, i = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.delIndexP(e, t, i);
    }
    delIndexP(e, t, i = this.currentDir) {
        return this._pushAction("delIndex", this.qyCache.getOrCreateDir(e, i), {
            indexPropPath: t
        });
    }
    insert(e, t, i = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.insertP(e, t, i);
    }
    insertP(e, t, i = this.currentDir) {
        return this._pushAction("insert", this.qyCache.getOrCreateFile(e, i), {
            content: isSimpleType(t) ? t : structuredClone(t)
        });
    }
    remove(e, t, i = this.currentDir) {
        return this.insert(e, objToDelMarks(t), i);
    }
    removeP(e, t, i = this.currentDir) {
        return this.insertP(e, objToDelMarks(t), i);
    }
    replace(e, t, i = this.currentDir) {
        return this.insert(e, {
            $rpl: t
        }, i);
    }
    replaceP(e, t, i = this.currentDir) {
        return this.insertP(e, {
            $rpl: t
        }, i);
    }
    delContent(e, t = this.currentDir) {
        return isString(e) && (e = pathSplit(e)), this.delContentP(e, t);
    }
    delContentP(e, t = this.currentDir) {
        return this._pushAction("delContent", this.qyCache.getOrCreateFile(e, t));
    }
    insertTrigger(e, t, i, r) {
        return isString(t) && (t = pathSplit(t)), i = (i = isString(i) ? [ i ] : i).map(e => isString(e) ? propNameSplit(e) : e), 
        this._pushAction("insertTrigger", this.qyCache.getOrCreateTriggerFile(e), {
            fileNamePath: t,
            propNamePathList: i,
            modCode: r
        });
    }
    removeTrigger(e) {
        return this._pushAction("removeTrigger", this.qyCache.getOrCreateTriggerFile(e));
    }
    insertRpc(e, t) {
        return this._pushAction("insertRpc", this.qyCache.getOrCreateRpcFile(e), {
            modCode: t
        });
    }
    removeRpc(e) {
        return this._pushAction("removeRpc", this.qyCache.getOrCreateRpcFile(e));
    }
    run(e) {
        var {
            actionQueue: t,
            fileLogLevel: i,
            qyCache: r
        } = this;
        if (0 == t.length) return 0;
        var n, a = this.changeId = r.increaseChangeId();
        for (n of t) this["_action_" + n.actionName](n);
        t.length = 0, this.resetCurrentDir();
        var {
            changeList: t,
            qyAclCmdGenerator: s,
            qyCmdObjHistory: o,
            syncList: h
        } = this, l = t.length;
        if (0 == l) return r.decreaseChangeId(), 0;
        var c = getSuffix(l), s = s.takeCmdArgAsListObj();
        let d;
        0 < i && (i = t.map(({
            logStr: e
        }) => e).join("\n"), d = new Date().toISOString() + `: ${l} change${c}:
${i}
`);
        var u, p, l = r.save(a, s, d, this._updateSyncList(), e), c = (h.length = 0, 
        o.push(s), t.filter(({
            item: e,
            delta: t
        }) => t && 0 < e.triggerNodes?.length));
        t.length = 0;
        for ({
            item: u,
            delta: p
        } of c) for (var m of u.triggerNodes) m.checkTrigger(u, p);
        return e ? l : a;
    }
    getTopHistoryCmdObj() {
        return this.qyCmdObjHistory.top();
    }
    _updateIndex(e, t, i, r) {
        var {
            underHiddenFolder: e,
            name: n,
            parentDir: a
        } = e;
        if (!e) {
            var s = this.qyCache.getIndexDir(a);
            if (s) {
                e = s.getFile(IndexPropPathsFileName);
                if (e) for (var o of e.qyIndexPropTree.getAllIndexPropPaths()) this._createLinksInIndexPropDir(s.searchOrCreateSubdir(o), o, n, t, i, r);
            }
        }
    }
    _createLinksInIndexPropDir(e, t, i, r, n, a) {
        e = calDifferenceList(e, t, i, r, n, a);
        if (e) {
            var s, o, h, {
                toAddFileList: t,
                toDelFileList: i
            } = e;
            for (s of t) this._action_createFile({
                item: s
            });
            for (o of i) this._action_delFile({
                item: o
            });
            for (h of i) {
                let e = h.parentDir;
                for (;e.created && !e.isHiddenFolder && e.isEmpty; ) this._action_delDir({
                    item: e
                }), e = e.parentDir;
            }
        }
    }
    _action_insertTrigger(e) {
        e.actionName = "insertTrigger";
        var t, {
            item: e,
            fileNamePath: i,
            propNamePathList: r,
            modCode: n
        } = e, {
            name: a,
            fileContent: s
        } = e, e = this._action_insert({
            item: e,
            content: {
                fileNamePath: i,
                propNamePathList: r,
                modCode: n
            }
        });
        return e && (t = this.qyCache, s && !util.isDeepStrictEqual(s.fileNamePath, i) && t.removeTriggerFromTree(a, s.fileNamePath), 
        t.insertTriggerToTree(a, i, r, n)), e;
    }
    _action_removeTrigger(e) {
        e.actionName = "removeTrigger";
        var e = e.item, {
            fileContent: t,
            name: i
        } = e;
        return !!this._action_delFile({
            item: e
        }) && (this.qyCache.removeTriggerFromTree(i, t.fileNamePath), !0);
    }
    _action_insertRpc(e) {
        e.actionName = "insertRpc";
        var {
            item: e,
            modCode: t
        } = e, i = this._action_insert({
            item: e,
            content: {
                modCode: t
            }
        });
        return i && this.qyCache.insertRpc(e.name, t), i;
    }
    _action_removeRpc(e) {
        e.actionName = "removeRpc";
        e = e.item;
        return !!this._action_delFile({
            item: e
        }) && (this.qyCache.removeRpc(e.name), !0);
    }
    _action_createIndex(e) {
        e.actionName = "createIndex";
        var t, {
            item: e,
            indexPropPathList: i
        } = e, r = this.qyCache.getOrCreateIndexDir(e), n = r.getOrCreateFile(IndexPropPathsFileName), {
            fileContent: a,
            qyIndexPropTree: s
        } = (n.created || this._action_createFile({
            item: n
        }), n), o = [], h = {};
        for (t of i) {
            var l = toSingleName(t);
            a && a[l] || (o.push(t), h[l] = 1, s.insert(t));
        }
        0 != o.length && (logger.log(`Creating index ${JSON.stringify(o)} for ` + e.fullPath), 
        this._action_insert({
            item: n,
            content: h
        }), this._addNewIndexPropPaths(e, r, getPrefixPropPaths(o)));
    }
    _action_delIndex(e) {
        e.actionName = "delIndex";
        var t, i, {
            item: e,
            indexPropPath: r
        } = e, e = this.qyCache.getIndexDir(e);
        e && ((i = e.getFile(IndexPropPathsFileName)) ? (t = i.qyIndexPropTree, 
        this._action_insert({
            item: i,
            content: {
                [toSingleName(r)]: $del
            }
        }), t.remove(r).hasPrefix || (i = e.getSubdir(r)) && this._action_delDir({
            item: i
        })) : this._action_delDir({
            item: e
        }));
    }
    _action_delFile(e, t) {
        e.actionName = "delFile";
        var i = e.item;
        if (!i.created) return !1;
        null != i.fileContent && this._action_delContent({
            item: i
        });
        var {
            parentDir: r,
            name: n
        } = i;
        return i.created = !1, this._pushChange(e), t || this._pushCmd(r, "R", r.fileMapKey, n), 
        !0;
    }
    _action_delDir(e) {
        e.actionName = "delDir";
        var t = e.item;
        if (!t.created) return !1;
        let {
            parentDir: i,
            name: r,
            subdirMap: n,
            fileMap: a,
            subdirMapKey: s,
            fileMapKey: o
        } = t;
        if (a) {
            this._pushCmd(t, "D", o);
            for (var h of t.fileList) this._action_delFile({
                item: h
            }, !0);
        }
        if (n) {
            this._pushCmd(t, "D", s);
            for (var l of t.allSubdirs()) {
                let {
                    subdirMap: e,
                    fileMap: t,
                    subdirMapKey: i,
                    fileMapKey: r
                } = l;
                if (e && this._pushCmd(l, "D", i), t) {
                    this._pushCmd(l, "D", r);
                    for (var c of l.fileList) this._action_delFile({
                        item: c
                    }, !0);
                }
                this._pushChange({
                    actionName: "delDir",
                    item: l
                }), l.created = !1;
            }
        }
        return !!i && (t.created = !1, this._pushChange(e), this._pushCmd(i, "R", i.subdirMapKey, r), 
        !0);
    }
    _action_delContent(e) {
        e.actionName = "delContent";
        var t = e.item, i = t.fileContent;
        return null != i && (t.setContent(void 0), Object.assign(e, {
            content: i,
            delta: {
                oldValue: i,
                newValue: $del
            }
        }), this._pushChange(e), this._pushCmd(t, "D", t.fileContentKey), this._updateIndex(t, i), 
        !0);
    }
    _action_insert(e) {
        e.actionName = "insert";
        var {
            item: t,
            content: i
        } = e;
        if (null == i) return logger.warn(`Saving undefined to ${t.fullPath}. Not making any change.`), 
        !1;
        t.created || this._action_createFile({
            item: t
        });
        var r, n, i = mergeContentAndGenDelta(t.fileContent, i), {
            merged: a,
            delta: s
        } = i;
        return !!s && ({
            oldValue: s,
            newValue: r
        } = s, !!r) && (n = t.fileContentKey, null == a ? this._pushCmd(t, "D", n) : this._pushCmd(t, "M", n, r), 
        Object.assign(e, i), this._pushChange(e), t.setContent(a), this._updateIndex(t, s, r, a), 
        !0);
    }
    _action_createFile(e) {
        e.actionName = "createFile";
        var t, i = e.item;
        return !i.created && (t = i.parentDir, this._action_createDir({
            item: t
        }), Object.assign(i, {
            created: !0,
            fileContentLoaded: !0
        }), this._pushChange(e), this._pushCmd(t, "A", t.fileMapKey, i.name), !0);
    }
    _action_createDir(e) {
        e.actionName = "createDir";
        let t = e.item;
        if (t.created) return !1;
        for (var i = []; !t.created; ) i.push(t), t = t.parentDir;
        for (let e of i.reverse()) {
            Object.assign(e, {
                created: !0,
                subdirMapLoaded: !0,
                fileMapLoaded: !0
            }), this._pushChange({
                actionName: "createDir",
                item: e
            });
            var r = e.parentDir;
            this._pushCmd(r, "A", r.subdirMapKey, e.name);
        }
        return !0;
    }
    _addNewIndexPropPaths(e, t, i) {
        let r;
        for (var n of i) {
            var a = t.searchOrCreateSubdir(n);
            if (!a.created) {
                this._action_createDir({
                    item: a
                });
                for (var s of r = r || e.fileList) {
                    var {
                        fileContent: s,
                        name: o
                    } = s;
                    null != s && this._createLinksInIndexPropDir(a, n, o, void 0, s);
                }
            }
        }
    }
    _pushChange(e) {
        var {
            changeList: t,
            fileLogLevel: i
        } = this;
        0 < i && (e.logStr = this._toLogStr(e, i)), t.push(e);
    }
    _toLogStr(e, t) {
        var {
            actionName: e,
            item: i,
            content: r,
            merged: n,
            delta: a
        } = e, i = e + ` "${i.fullPath ?? i}"`;
        if ("delContent" === e) {
            if (3 == t) return i + " " + JSON.stringify(r);
        } else if ("insert" === e && 2 <= t) return {
            oldValue: r,
            newValue: e
        } = a, a = `${null == r ? "" : "delta:"} ${JSON.stringify(r)} -> ` + JSON.stringify(e), 
        2 == t ? i + " " + a : i + ` ${a}. ` + (null != r ? "new: " + JSON.stringify(n) : "");
        return i;
    }
    _pushAction(e, t, i) {
        return this.actionQueue.push({
            actionName: e,
            item: t,
            ...i
        }), this;
    }
    _pushCmd(e, t, i, r) {
        var {
            qyAclCmdGenerator: n,
            qyCache: a,
            syncList: s,
            changeId: o
        } = this;
        n.pushCmd(t, i, r), i.startsWith("d") ? e.dChangeId = o : i.startsWith("f") ? e.fChangeId = o : e.cChangeId = o, 
        a && a.qyKVData.removeKey(i) && s.push(i, e);
    }
    _updateSyncList() {
        var t = this.syncList, i = t.length;
        for (let e = 0; e < i; e += 2) {
            var r, n = e + 1, a = t[e], s = t[n];
            a.startsWith("d") ? (r = s.subdirNameList, t[n] = 0 < r.length ? r : void 0) : a.startsWith("f") ? (r = s.fileNameList, 
            t[n] = 0 < r.length ? r : void 0) : t[n] = s.fileContent;
        }
        if (0 < i) return t;
    }
}

class QyCmdObjHistory {
    nextPos = 0;
    actionQueue = [];
    constructor(e) {
        this.maxLength = e;
    }
    push(e) {
        this.actionQueue[this.nextPos] = e, this.nextPos = this._getNextPos(this.nextPos);
    }
    top() {
        return this.actionQueue[this._getPrevPos(this.nextPos)];
    }
    _getNextPos(e) {
        return e + 1 < this.maxLength ? e + 1 : 0;
    }
    _getPrevPos(e) {
        return 0 < e ? e - 1 : this.maxLength - 1;
    }
}

Object.assign(module.exports, {
    QyBatch: QyBatch
});