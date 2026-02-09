import {
    join as t
} from "node:path";

import {
    getDefaultOptions as e
} from "./QyDefaultOptions.js";

import {
    QyAclSaver as n
} from "./QyAclSaver.js";

import {
    QyMessageWorker as a
} from "./QyMessageWorker.js";

import {
    QySnapshotSaver as o
} from "./QySnapshotSaver.js";

import {
    delCmdKey as m
} from "./QyAcl.js";

class s extends a {
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
            qyAclSaver: new n(this, s),
            qySnapshotSaver: new o(this, a, s)
        });
    }
    start(a, s, t, e) {
        var {
            qyAclSaver: n,
            qySnapshotSaver: o
        } = this;
        Object.assign(this, {
            maxChangeId: a,
            snapshotMaxChangeId: a,
            currentAclNum: (t || s) + 1
        }), n.start(u(this)), o.start(a, t, e);
    }
    async stop() {
        var {
            qyAclSaver: a,
            options: s,
            qySnapshotSaver: t,
            currentAclNum: e,
            maxChangeId: n,
            snapshotMaxChangeId: o
        } = this;
        this.isStopping = !0, await a.stop(), s.saveSnapshotAtStop && o < n && (this.isSavingSnapshot && await new Promise(a => this.saveSnapshotResolve = a), 
        logger.log(`Saving snapshot ${e} at stop.`), t.saveSnapshot(e)), await t.stop();
    }
    callSave(a, s, t) {
        return r(this, a, s, t, !0);
    }
    castSave(a, s, t) {
        return r(this, a, s, t);
    }
    releaseSnapshot(a) {
        this.qySnapshotSaver.releaseSnapshot(a);
    }
    onSnapshotSavedChangeId(a, s) {
        this.isSavingSnapshot = !1, this.saveSnapshotResolve ? this.saveSnapshotResolve() : this.isStopping || this.castParent("onSnapshotSavedChangeId", a, s);
    }
}

function r(a, s, t, e, n) {
    var {
        qyAclSaver: o,
        qySnapshotSaver: r,
        options: h,
        snapshotMaxChangeId: i,
        currentAclNum: p,
        isSavingSnapshot: S
    } = a;
    let v;
    n ? v = o.callSave(s, t) : o.castSave(s, t);
    var l = t, c = e;
    if (c) {
        var g = c.length;
        for (let a = 0; a < g; a += 2) m(l, c[a]);
    }
    return r.castSave(s, t, e), a.maxChangeId = s, !S && s - i >= h.snapshotMaxChangeCount && (++a.currentAclNum, 
    o.switch(u(a)), r.saveSnapshot(p), Object.assign(a, {
        snapshotMaxChangeId: s,
        isSavingSnapshot: !0
    })), v;
}

function u(a) {
    return t(a.aclFolder, a.currentAclNum + "_acl.txt");
}

export default s;