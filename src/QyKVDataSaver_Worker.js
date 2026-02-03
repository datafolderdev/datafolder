let path = require("node:path"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyAclSaver = require("./QyAclSaver.js").QyAclSaver, QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, QySnapshotSaver = require("./QySnapshotSaver.js").QySnapshotSaver, delCmdKey = require("./QyAcl.js").delCmdKey;

class QyKVDataSaver_Worker extends QyMessageWorker {
    constructor({
        kvFolder: e,
        options: a
    }) {
        super(a = {
            ...getDefaultOptions("QyKVDataSaver_Worker"),
            ...a
        }), Object.assign(this, {
            kvFolder: e,
            aclFolder: path.join(e, "acl"),
            qyAclSaver: new QyAclSaver(this, a),
            qySnapshotSaver: new QySnapshotSaver(this, e, a)
        });
    }
    start(e, a, s, t) {
        var {
            qyAclSaver: r,
            qySnapshotSaver: n
        } = this;
        Object.assign(this, {
            maxChangeId: e,
            snapshotMaxChangeId: e,
            currentAclNum: (s || a) + 1
        }), r.start(this._getAclFilePath()), n.start(e, s, t);
    }
    async stop() {
        var {
            qyAclSaver: e,
            options: a,
            qySnapshotSaver: s,
            currentAclNum: t,
            maxChangeId: r,
            snapshotMaxChangeId: n
        } = this;
        this.isStopping = !0, await e.stop(), a.saveSnapshotAtStop && n < r && (this.isSavingSnapshot && await new Promise(e => this.saveSnapshotResolve = e), 
        logger.log(`Saving snapshot ${t} at stop.`), s.saveSnapshot(t)), await s.stop();
    }
    callSave(e, a, s) {
        return this._save(e, a, s, !0);
    }
    castSave(e, a, s) {
        return this._save(e, a, s);
    }
    releaseSnapshot(e) {
        this.qySnapshotSaver.releaseSnapshot(e);
    }
    _save(e, a, s, t) {
        var {
            qyAclSaver: r,
            qySnapshotSaver: n,
            options: o,
            snapshotMaxChangeId: h,
            currentAclNum: i,
            isSavingSnapshot: S
        } = this;
        let l;
        return t ? l = r.callSave(e, a) : r.castSave(e, a), this._removeSyncedKeys(a, s), 
        n.castSave(e, a, s), this.maxChangeId = e, !S && e - h >= o.snapshotMaxChangeCount && (++this.currentAclNum, 
        r.switch(this._getAclFilePath()), n.saveSnapshot(i), Object.assign(this, {
            snapshotMaxChangeId: e,
            isSavingSnapshot: !0
        })), l;
    }
    _removeSyncedKeys(a, s) {
        if (s) {
            var t = s.length;
            for (let e = 0; e < t; e += 2) delCmdKey(a, s[e]);
        }
    }
    _getAclFilePath() {
        return path.join(this.aclFolder, this.currentAclNum + "_acl.txt");
    }
    onSnapshotSavedChangeId(e, a) {
        this.isSavingSnapshot = !1, this.saveSnapshotResolve ? this.saveSnapshotResolve() : this.isStopping || this.castParent("onSnapshotSavedChangeId", e, a);
    }
}

module.exports = QyKVDataSaver_Worker;