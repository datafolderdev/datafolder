import {
    isDeepStrictEqual as o
} from "node:util";

import {
    mergeContentAndGenDelta as c,
    objToDelMarks as i
} from "./QyFileContentUtils.js";

import {
    pathSplit as n,
    propNameSplit as a,
    isString as s,
    SpecialOperators as e,
    getSuffix as g,
    SpecialFilePaths as t,
    toSingleName as C,
    isSimpleType as l
} from "./QyUtils.js";

import {
    QyAclCmdGenerator as r
} from "./QyAcl.js";

import {
    calDifferenceList as h
} from "./QyIndex.js";

import {
    getDefaultOptions as d
} from "./QyDefaultOptions.js";

import {
    QyCD as m
} from "./QyCD.js";

import {
    getPrefixPropPaths as y
} from "./QyIndexPropTree.js";

import {
    logger as D
} from "./QyLogger.js";

let u = Array.isArray, f = e.$del, v = t.IndexPropPathsFileName, p = {
    none: 0,
    basic: 1,
    delta: 2,
    all: 3
};

class _ extends m {
    fileLogLevel;
    actionQueue;
    changeId;
    changeList;
    syncList;
    qyAclCmdGenerator;
    qyCmdObjHistory;
    constructor(e, t) {
        super(e), t = {
            ...d("QyBatch"),
            ...t
        };
        e = p[t.fileLogLevel.toLowerCase()];
        Object.assign(this, {
            options: t,
            fileLogLevel: e ?? 1,
            qyAclCmdGenerator: new r(),
            qyCmdObjHistory: new O(t.maxHistoryCmdObjCount),
            actionQueue: [],
            changeList: [],
            syncList: []
        });
    }
    createDir(e, t = this.currentDir) {
        return s(e) && (e = n(e)), this.createDirP(e, t);
    }
    createDirP(e, t = this.currentDir) {
        return P(this, "createDir", this.qyCache?.getOrCreateDir(e, t));
    }
    delDir(e, t = this.currentDir) {
        return s(e) && (e = n(e)), this.delDirP(e, t);
    }
    delDirP(e, t = this.currentDir) {
        return P(this, "delDir", this.qyCache.getOrCreateDir(e, t));
    }
    createFile(e, t = this.currentDir) {
        return s(e) && (e = n(e)), this.createFileP(e, t);
    }
    createFileP(e, t = this.currentDir) {
        return P(this, "createFile", this.qyCache.getOrCreateFile(e, t));
    }
    delFile(e, t = this.currentDir) {
        return s(e) && (e = n(e)), this.delFileP(e, t);
    }
    delFileP(e, t = this.currentDir) {
        return P(this, "delFile", this.qyCache.getOrCreateFile(e, t));
    }
    createIndex(e, t, r = this.currentDir) {
        return s(e) && (e = n(e)), this.createIndexP(e, t, r);
    }
    createIndexP(e, t, r = this.currentDir) {
        return u(t) || (t = [ t ]), P(this, "createIndex", this.qyCache?.getOrCreateDir(e, r), {
            indexPropPathList: t
        });
    }
    delIndex(e, t, r = this.currentDir) {
        return s(e) && (e = n(e)), this.delIndexP(e, t, r);
    }
    delIndexP(e, t, r = this.currentDir) {
        return P(this, "delIndex", this.qyCache.getOrCreateDir(e, r), {
            indexPropPath: t
        });
    }
    insert(e, t, r = this.currentDir) {
        return s(e) && (e = n(e)), this.insertP(e, t, r);
    }
    insertP(e, t, r = this.currentDir) {
        return P(this, "insert", this.qyCache.getOrCreateFile(e, r), {
            content: l(t) ? t : structuredClone(t)
        });
    }
    remove(e, t, r = this.currentDir) {
        return this.insert(e, i(t), r);
    }
    removeP(e, t, r = this.currentDir) {
        return this.insertP(e, i(t), r);
    }
    replace(e, t, r = this.currentDir) {
        return this.insert(e, {
            $rpl: t
        }, r);
    }
    replaceP(e, t, r = this.currentDir) {
        return this.insertP(e, {
            $rpl: t
        }, r);
    }
    delContent(e, t = this.currentDir) {
        return s(e) && (e = n(e)), this.delContentP(e, t);
    }
    delContentP(e, t = this.currentDir) {
        return P(this, "delContent", this.qyCache.getOrCreateFile(e, t));
    }
    insertTrigger(e, t, r, i) {
        return s(t) && (t = n(t)), r = (r = s(r) ? [ r ] : r).map(e => s(e) ? a(e) : e), 
        P(this, "insertTrigger", this.qyCache.getOrCreateTriggerFile(e), {
            fileNamePath: t,
            propNamePathList: r,
            modCode: i
        });
    }
    removeTrigger(e) {
        return P(this, "removeTrigger", this.qyCache.getOrCreateTriggerFile(e));
    }
    insertRpc(e, t) {
        return P(this, "insertRpc", this.qyCache.getOrCreateRpcFile(e), {
            modCode: t
        });
    }
    removeRpc(e) {
        return P(this, "removeRpc", this.qyCache.getOrCreateRpcFile(e));
    }
    run(e = !1) {
        var {
            actionQueue: t,
            fileLogLevel: r,
            qyCache: i
        } = this;
        if (0 == t.length) return 0;
        var n, a = this.changeId = i.increaseChangeId();
        for (n of t) this["_action_" + n.actionName](n);
        t.length = 0, this.resetCurrentDir();
        var {
            changeList: t,
            qyAclCmdGenerator: s,
            qyCmdObjHistory: o,
            syncList: c
        } = this, l = t.length;
        if (0 == l) return i.decreaseChangeId(), 0;
        var h = g(l), s = s.takeCmdArgAsListObj();
        let d;
        0 < r && (r = t.map(({
            logStr: e
        }) => e).join("\n"), d = new Date().toISOString() + `: ${l} change${h}:
${r}
`);
        var m, u, l = i.save(a, s, d, (e => {
            var t = e.syncList, r = t.length;
            for (let e = 0; e < r; e += 2) {
                var i, n = e + 1, a = t[e], s = t[n];
                a.startsWith("d") ? (i = s.subdirNameList, t[n] = 0 < i.length ? i : void 0) : a.startsWith("f") ? (i = s.fileNameList, 
                t[n] = 0 < i.length ? i : void 0) : t[n] = s.fileContent;
            }
            if (0 < r) return t;
        })(this), e), h = (c.length = 0, o.push(s), t.filter(({
            item: e,
            delta: t
        }) => t && 0 < e.triggerNodes?.length));
        t.length = 0;
        for ({
            item: m,
            delta: u
        } of h) for (var f of m.triggerNodes) f.checkTrigger(m, u);
        return e ? l : a;
    }
    getTopHistoryCmdObj() {
        return this.qyCmdObjHistory.top();
    }
    _action_insertTrigger(e) {
        e.actionName = "insertTrigger";
        var t, {
            item: e,
            fileNamePath: r,
            propNamePathList: i,
            modCode: n
        } = e, {
            name: a,
            fileContent: s
        } = e, e = this._action_insert({
            item: e,
            content: {
                fileNamePath: r,
                propNamePathList: i,
                modCode: n
            }
        });
        return e && (t = this.qyCache, s && !o(s.fileNamePath, r) && t.removeTriggerFromTree(a, s.fileNamePath), 
        t.insertTriggerToTree(a, r, i, n)), e;
    }
    _action_removeTrigger(e) {
        e.actionName = "removeTrigger";
        var e = e.item, {
            fileContent: t,
            name: r
        } = e;
        return !!this._action_delFile({
            item: e
        }) && (this.qyCache.removeTriggerFromTree(r, t.fileNamePath), !0);
    }
    _action_insertRpc(e) {
        e.actionName = "insertRpc";
        var {
            item: e,
            modCode: t
        } = e, r = this._action_insert({
            item: e,
            content: t
        });
        return r && this.qyCache.insertRpc(e.name, t), r;
    }
    _action_removeRpc(e) {
        e.actionName = "removeRpc";
        e = e.item;
        return !!this._action_delFile({
            item: e
        }) && (this.qyCache.removeRpc(e.name), !0);
    }
    _action_createIndex(t) {
        t.actionName = "createIndex";
        var e, {
            item: t,
            indexPropPathList: r
        } = t, i = this.qyCache.getOrCreateIndexDir(t), n = i.getOrCreateFile(v), {
            fileContent: a,
            qyIndexPropTree: s
        } = (n.created || this._action_createFile({
            item: n
        }), n), o = [], c = {};
        for (e of r) {
            var l = C(e);
            a && a[l] || (o.push(e), c[l] = 1, s.insert(e));
        }
        if (0 != o.length) {
            D.log(`Creating index ${JSON.stringify(o)} for ` + t.fullPath), this._action_insert({
                item: n,
                content: c
            });
            {
                var h, d = this, m = t, u = i, r = y(o);
                let e;
                for (h of r) {
                    var f = u.searchOrCreateSubdir(h);
                    if (!f.created) {
                        d._action_createDir({
                            item: f
                        });
                        for (var g of e = e || m.fileList) {
                            var {
                                fileContent: g,
                                name: p
                            } = g;
                            null != g && N(d, f, h, p, void 0, g);
                        }
                    }
                }
            }
        }
    }
    _action_delIndex(e) {
        e.actionName = "delIndex";
        var t, r, {
            item: e,
            indexPropPath: i
        } = e, e = this.qyCache.getIndexDir(e);
        e && ((r = e.getFile(v)) ? (t = r.qyIndexPropTree, this._action_insert({
            item: r,
            content: {
                [C(i)]: f
            }
        }), t.remove(i).hasPrefix || (r = e.getSubdir(i)) && this._action_delDir({
            item: r
        })) : this._action_delDir({
            item: e
        }));
    }
    _action_delFile(e, t = !1) {
        e.actionName = "delFile";
        var r = e.item;
        if (!r.created) return !1;
        null != r.fileContent && this._action_delContent({
            item: r
        });
        var {
            parentDir: i,
            name: n
        } = r;
        return r.created = !1, x(this, e), t || L(this, i, "R", i.fileMapKey, n), 
        !0;
    }
    _action_delDir(e) {
        e.actionName = "delDir";
        var t = e.item;
        if (!t.created) return !1;
        let {
            parentDir: r,
            name: i,
            subdirMap: n,
            fileMap: a,
            subdirMapKey: s,
            fileMapKey: o
        } = t;
        if (a) {
            L(this, t, "D", o);
            for (var c of t.fileList) this._action_delFile({
                item: c
            }, !0);
        }
        if (n) {
            L(this, t, "D", s);
            for (var l of t.allSubdirs()) {
                let {
                    subdirMap: e,
                    fileMap: t,
                    subdirMapKey: r,
                    fileMapKey: i
                } = l;
                if (e && L(this, l, "D", r), t) {
                    L(this, l, "D", i);
                    for (var h of l.fileList) this._action_delFile({
                        item: h
                    }, !0);
                }
                x(this, {
                    actionName: "delDir",
                    item: l
                }), l.created = !1;
            }
        }
        return !!r && (t.created = !1, x(this, e), L(this, r, "R", r.subdirMapKey, i), 
        !0);
    }
    _action_delContent(e) {
        e.actionName = "delContent";
        var t = e.item, r = t.fileContent;
        return null != r && (t.setContent(void 0), Object.assign(e, {
            content: r,
            delta: {
                oldValue: r,
                newValue: f
            }
        }), x(this, e), L(this, t, "D", t.fileContentKey), F(this, t, r), !0);
    }
    _action_insert(e) {
        e.actionName = "insert";
        var {
            item: t,
            content: r
        } = e;
        if (null == r) return D.warn(`Saving undefined to ${t.fullPath}. Not making any change.`), 
        !1;
        t.created || this._action_createFile({
            item: t
        });
        var i, n, r = c(t.fileContent, r), {
            merged: a,
            delta: s
        } = r;
        return !!s && ({
            oldValue: s,
            newValue: i
        } = s, !!i) && (n = t.fileContentKey, null == a ? L(this, t, "D", n) : L(this, t, "M", n, i), 
        Object.assign(e, r), x(this, e), t.setContent(a), F(this, t, s, i, a), !0);
    }
    _action_createFile(e) {
        e.actionName = "createFile";
        var t, r = e.item;
        return !r.created && (t = r.parentDir, this._action_createDir({
            item: t
        }), Object.assign(r, {
            created: !0,
            fileContentLoaded: !0
        }), x(this, e), L(this, t, "A", t.fileMapKey, r.name), !0);
    }
    _action_createDir(e) {
        e.actionName = "createDir";
        let t = e.item;
        if (t.created) return !1;
        for (var r = []; !t.created; ) r.push(t), t = t.parentDir;
        for (let e of r.reverse()) {
            Object.assign(e, {
                created: !0,
                subdirMapLoaded: !0,
                fileMapLoaded: !0
            }), x(this, {
                actionName: "createDir",
                item: e
            });
            var i = e.parentDir;
            L(this, i, "A", i.subdirMapKey, e.name);
        }
        return !0;
    }
}

function P(e, t, r, i) {
    return e.actionQueue.push({
        actionName: t,
        item: r,
        ...i
    }), e;
}

function x(e, t) {
    var {
        changeList: e,
        fileLogLevel: r
    } = e;
    0 < r && (t.logStr = ((e, t) => {
        var {
            actionName: e,
            item: r,
            content: i,
            merged: n,
            delta: a
        } = e, r = e + ` "${r.fullPath ?? r}"`;
        if ("delContent" === e) {
            if (3 == t) return r + " " + JSON.stringify(i);
        } else if ("insert" === e && 2 <= t) return {
            oldValue: i,
            newValue: e
        } = a, a = `${null == i ? "" : "delta:"} ${JSON.stringify(i)} -> ` + JSON.stringify(e), 
        2 == t ? r + " " + a : r + ` ${a}. ` + (null != i ? "new: " + JSON.stringify(n) : "");
        return r;
    })(t, r)), e.push(t);
}

function L(e, t, r, i, n = void 0) {
    var {
        qyAclCmdGenerator: e,
        qyCache: a,
        syncList: s,
        changeId: o
    } = e;
    e.pushCmd(r, i, n), i.startsWith("d") ? t.dChangeId = o : i.startsWith("f") ? t.fChangeId = o : t.cChangeId = o, 
    a && a.qyKVData.removeKey(i) && s.push(i, t);
}

function F(e, t, r, i = void 0, n = void 0) {
    var {
        underHiddenFolder: t,
        name: a,
        parentDir: s
    } = t;
    if (!t) {
        var o = e.qyCache.getIndexDir(s);
        if (o) {
            t = o.getFile(v);
            if (t) for (var c of t.qyIndexPropTree.getAllIndexPropPaths()) N(e, o.searchOrCreateSubdir(c), c, a, r, i, n);
        }
    }
}

function N(t, e, r, i, n, a, s = void 0) {
    e = h(e, r, i, n, a, s);
    if (e) {
        var o, c, l, {
            toAddFileList: r,
            toDelFileList: i
        } = e;
        for (o of r) t._action_createFile({
            item: o
        });
        for (c of i) t._action_delFile({
            item: c
        });
        for (l of i) {
            let e = l.parentDir;
            for (;e.created && !e.isHiddenFolder && e.isEmpty; ) t._action_delDir({
                item: e
            }), e = e.parentDir;
        }
    }
}

class O {
    maxLength;
    actionQueue;
    nextPos;
    constructor(e) {
        Object.assign(this, {
            maxLength: e,
            nextPos: 0,
            actionQueue: []
        });
    }
    push(e) {
        var {
            maxLength: t,
            nextPos: r
        } = this;
        this.actionQueue[r] = e, this.nextPos = ((e, t) => (t += 1) < e ? t : 0)(t, r);
    }
    top() {
        var {
            actionQueue: e,
            maxLength: t,
            nextPos: r
        } = this;
        return e[e = t, (0 < (t = r) ? t : e) - 1];
    }
}

export {
    _ as QyBatch
};