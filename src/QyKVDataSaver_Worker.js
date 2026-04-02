import {
    join as t
} from "node:path";

import {
    getDefaultOptions as e
} from "./QyDefaultOptions.js";

import {
    QyAclSaver as o
} from "./QyAclSaver.js";

import {
    QyMessageWorker as a
} from "./QyMessageWorker.js";

import {
    QySnapshotSaver as n
} from "./QySnapshotSaver.js";

import {
    delCmdKey as m
} from "./QyAcl.js";

import {
    logger as r
} from "./QyLogger.js";

export default class extends a {
    kvFolder;
    aclFolder;
    qyAclSaver;
    qySnapshotSaver;
    isStopping;
    currentAclNum;
    maxChangeId;
    snapshotMaxChangeId;
    isSavingSnapshot;
    saveSnapshotResolve;
    constructor({
        kvFolder: a,
        options: s
    }) {
        super(s = {
            ...e("QyKVDataSaver_Worker"),
            ...s
        }), Object.assign(this, {
            kvFolder: a,
            aclFolder: t(a, "acl"),
            qyAclSaver: s.noAcl ? void 0 : new o(this, s),
            qySnapshotSaver: new n(this, a, s)
        });
    }
    _op_start(a, s, t, e) {
        var {
            qyAclSaver: o,
            qySnapshotSaver: n
        } = this;
        Object.assign(this, {
            maxChangeId: a,
            snapshotMaxChangeId: a,
            currentAclNum: (t || s) + 1
        }), o && o.start(d(this)), n.start(a, t, e);
    }
    async _op_stop() {
        var {
            qyAclSaver: a,
            options: s,
            qySnapshotSaver: t,
            currentAclNum: e,
            maxChangeId: o,
            snapshotMaxChangeId: n
        } = this;
        return this.isStopping = !0, a && await a.stop(), s.saveSnapshotAtStop && n < o && (this.isSavingSnapshot && await new Promise(a => this.saveSnapshotResolve = a), 
        r.log(`Saving snapshot ${e} at stop.`), t.saveSnapshot(e)), t.stop();
    }
    callSave(a, s, t) {
        return h(this, a, s, t, !0);
    }
    castSave(a, s, t) {
        return h(this, a, s, t);
    }
    releaseSnapshot(a) {
        this.qySnapshotSaver.releaseSnapshot(a);
    }
    onSnapshotSavedChangeId(a, s) {
        this.isSavingSnapshot = !1, this.saveSnapshotResolve ? this.saveSnapshotResolve() : this.isStopping || this.castParent("onSnapshotSavedChangeId", a, s);
    }
}

function h(a, s, t, e, o = !1) {
    var {
        qyAclSaver: n,
        qySnapshotSaver: r,
        options: h,
        snapshotMaxChangeId: i,
        currentAclNum: p,
        isSavingSnapshot: S
    } = a;
    let v;
    n && (o ? v = n.callSave(s, t) : n.castSave(s, t));
    var l = t, c = e;
    if (c) {
        var g = c.length;
        for (let a = 0; a < g; a += 2) m(l, c[a]);
    }
    return r.castSave(s, t, e), a.maxChangeId = s, !S && s - i >= h.snapshotMaxChangeCount && (++a.currentAclNum, 
    n && n.switch(d(a)), r.saveSnapshot(p), Object.assign(a, {
        snapshotMaxChangeId: s,
        isSavingSnapshot: !0
    })), v;
}

function d(a) {
    return t(a.aclFolder, a.currentAclNum + "_acl.txt");
}