let path = require("node:path"), fsPromises = require("node:fs/promises"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, {
    folderOrFileExists,
    ensureDir
} = require("./QyUtils.js"), qyCompressor = require("./QyCompressor.js");

class QyKVDataCleaner_Worker extends QyMessageWorker {
    constructor({
        kvFolder: e,
        options: s
    }) {
        super(s = {
            ...getDefaultOptions("QyKVDataCleaner_Worker"),
            ...s
        }, [ "start", "stop" ], [ "cleanAclFiles", "cleanPMFiles", "cleanVLFiles", "removeSnapshotsFiles" ]);
        var s = path.join(e, "history"), a = path.join(e, "snapshot");
        Object.assign(this, {
            kvFolder: e,
            snapshotFolder: a,
            snapshotInfoFolder: path.join(a, "info"),
            aclFolder: path.join(e, "acl"),
            historyAclFolder: path.join(s, "acl"),
            historySnapshotFolder: path.join(s, "snapshot")
        });
    }
    _op_start() {}
    _op_stop() {}
    async _op_cleanAclFiles(e) {
        await this._cleanOutdatedAclFiles(e);
    }
    async _op_cleanPMFiles(e) {
        await Promise.allSettled(e.map(([ e, s ]) => this._cleanOutdatedPMFiles(e, s)));
    }
    async _op_cleanVLFiles(e, s) {
        await this._cleanOutdatedVLFiles(e, s);
    }
    async _op_removeSnapshotsFiles(e) {
        let {
            snapshotFolder: s,
            snapshotInfoFolder: a
        } = this;
        await Promise.all(e.map(async e => {
            await fsPromises.rm(path.join(a, e + ".json")), await fsPromises.rm(path.join(s, "" + e), {
                recursive: !0
            });
        }));
    }
    async _cleanOutdatedAclFiles(e) {
        var s = this.aclFolder;
        if (await folderOrFileExists(s)) {
            var a, t = [];
            for (a of (await fsPromises.readdir(s)).filter(e => /^[1-9]/.test(e))) parseInt(a) <= e && t.push(this._cleanOutdatedAclFile(a));
            0 < t.length && await Promise.allSettled(t);
        }
    }
    _cleanOutdatedPMFiles(s, a) {
        return Promise.all([ "pM", "prefixPM" ].map(e => this._cleanOutdatedSnapshotFiles(s, a, e)));
    }
    _cleanOutdatedVLFiles(e, s) {
        return this._cleanOutdatedSnapshotFiles(e, s, "vL");
    }
    async _cleanOutdatedSnapshotFiles(s, a, t) {
        var {
            snapshotFolder: e,
            historySnapshotFolder: r
        } = this, i = path.join(e, "" + s);
        if (await folderOrFileExists(i)) {
            let e;
            var o, l = [];
            for (o of await fsPromises.readdir(i)) {
                var n = new RegExp("^([0-9]+)_" + t).exec(o);
                n && (n = parseInt(n[1])) < a && (1 == n ? (e || (e = path.join(r, "" + s), 
                await ensureDir(e)), l.push(this._cleanOutdatedFile(o, i, e))) : (n = path.join(i, o), 
                logger.info("Removing " + n), l.push(fsPromises.rm(n))));
            }
            0 < l.length && await Promise.allSettled(l);
        }
    }
    async _cleanOutdatedAclFile(e) {
        var {
            aclFolder: s,
            historyAclFolder: a
        } = this;
        return await ensureDir(a), this._cleanOutdatedFile(e, s, a);
    }
    _cleanOutdatedFile(e, s, a) {
        s = path.join(s, e), a = path.join(a, e);
        return this.options.compressRedundantFile ? qyCompressor.compressFile(s, a + qyCompressor.Zip_File_Extension, {
            override: !0,
            removeSrcAfterSuccess: !0
        }) : (logger.info(`rename ${s} to ` + a), fsPromises.rename(s, a));
    }
}

module.exports = QyKVDataCleaner_Worker;