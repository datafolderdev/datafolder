import {
    join as e
} from "node:path";

import {
    QyFetch as r
} from "./QyFetch.js";

import {
    QyBatch as i
} from "./QyBatch.js";

import {
    QyCache as a
} from "./QyCache.js";

import {
    getDefaultOptions as n
} from "./QyDefaultOptions.js";

import {
    QyCD as t
} from "./QyCD.js";

import {
    isNotNullObj as s,
    __dirname as m
} from "./QyUtils.js";

let d = e(m, "../data/sampleDataFolder");

class h extends t {
    constructor(e = d, t) {
        s(e) && (t = e, e = d), super(), Object.assign(this, {
            rootFolder: e,
            options: {
                ...n("QyDB"),
                ...t
            }
        });
    }
    async start(e) {
        var t;
        return this.qyCache || (e = {
            ...this.options,
            ...e
        }, t = new a(this.rootFolder, e, this), Object.assign(this, {
            qyCache: t,
            fetch: new r(t),
            batch: new i(t, e),
            _immediate: new i(t, e)
        }), await t.start()), this;
    }
    async stop() {
        var {
            qyCache: e,
            fetch: t,
            batch: r,
            _immediate: i
        } = this;
        e && (await e.stop(), t.qyCache = void 0, r.qyCache = void 0, i.qyCache = void 0, 
        Object.assign(this, {
            qyCache: void 0,
            fetch: void 0,
            batch: void 0,
            _immediate: void 0
        }));
    }
    createDir(e) {
        return this._immediate.createDir(e).run(), this.dir(e);
    }
    createDirP(e) {
        return this._immediate.createDirP(e).run(), this.dirP(e);
    }
    createFile(e) {
        return this._immediate.createFile(e).run(), this.file(e);
    }
    createFileP(e) {
        return this._immediate.createFileP(e).run(), this.fileP(e);
    }
    createIndex(e, t) {
        return this._immediate.createIndex(e, t).run();
    }
    createIndexP(e, t) {
        return this._immediate.createIndexP(e, t).run();
    }
    delIndex(e, t) {
        return this._immediate.delIndex(e, t).run();
    }
    delIndexP(e, t) {
        return this._immediate.delIndexP(e, t).run();
    }
    insert(e, t) {
        return this._immediate.insert(e, t).run();
    }
    insertP(e, t) {
        return this._immediate.insertP(e, t).run();
    }
    remove(e, t) {
        return this._immediate.remove(e, t).run();
    }
    removeP(e, t) {
        return this._immediate.removeP(e, t).run();
    }
    replace(e, t) {
        return this._immediate.replace(e, t).run();
    }
    replaceP(e, t) {
        return this._immediate.replaceP(e, t).run();
    }
    delDir(e) {
        return this._immediate.delDir(e).run();
    }
    delDirP(e) {
        return this._immediate.delDirP(e).run();
    }
    delFile(e) {
        return this._immediate.delFile(e).run();
    }
    delFileP(e) {
        return this._immediate.delFileP(e).run();
    }
    delContent(e) {
        return this._immediate.delContent(e).run();
    }
    delContentP(e) {
        return this._immediate.delContentP(e).run();
    }
    insertTrigger(e, t, r, i) {
        return this._immediate.insertTrigger(e, t, r, i).run();
    }
    removeTrigger(e) {
        return this._immediate.removeTrigger(e).run();
    }
    insertRpc(e, t) {
        return this._immediate.insertRpc(e, t).run();
    }
    removeRpc(e) {
        return this._immediate.removeRpc(e).run();
    }
    on(e, t) {
        return this.qyCache.on(e, t);
    }
    callRpc(e, t, r) {
        return this.qyCache.callRpc(e, t, r);
    }
    fileListToTree(e, t) {
        var r, i = t, a = {};
        for (r of e) {
            var n, s = r.parentList;
            let t = a;
            for (n of s) {
                var {
                    name: m,
                    fullPathHash: d
                } = n;
                let e = t.subdirMap;
                e = e || (t.subdirMap = {}), t = (t = e[m]) || (e[m] = {
                    fullPathHash: d
                });
            }
            let e = t.fileMap;
            (e = e || (t.fileMap = {}))[r.name] = {
                fileContent: r.view(i, !0),
                fileContentKey: r.fileContentKey
            };
        }
        return {
            tree: a,
            count: e.length
        };
    }
}

export {
    h as QyDB
};