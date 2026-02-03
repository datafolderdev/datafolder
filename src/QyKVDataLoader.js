let fsPromises = require("node:fs/promises"), path = require("node:path"), folderOrFileExists = require("./QyUtils.js").folderOrFileExists, readAclBuffer = require("./QyAcl.js").readAclBuffer, QySnapshots = require("./QySnapshots.js").QySnapshots, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyKVDataLoader {
    constructor(a, e) {
        e = {
            ...getDefaultOptions("QyKVDataLoader"),
            ...e
        };
        var s = path.join(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            options: e,
            aclFolder: path.join(a, "acl"),
            snapshotFolder: s,
            loadedMaxAclNum: 0,
            aclKeyValueMap: {},
            qySnapshots: new QySnapshots(s, e)
        });
    }
    async load() {
        var a = this.qySnapshots, [ e ] = await Promise.all([ this._listAclFiles(), a.loadSnapshotInfos() ]);
        let {
            maxSnapshotNum: s,
            snapshotMaxChangeId: t
        } = a;
        this.maxChangeId = t, e && await this._loadAclFiles(e.filter(a => a > s));
        var {
            maxChangeId: e,
            loadedMaxAclNum: l,
            aclKeyValueMap: i
        } = this;
        return {
            maxChangeId: e,
            loadedMaxAclNum: l,
            qySnapshots: a,
            aclKeyValueMap: i
        };
    }
    async _loadAclFiles(e) {
        e.sort((a, e) => a - e);
        var {
            aclKeyValueMap: s,
            qySnapshots: t,
            options: a
        } = this, l = a.autoRepairAclFile, i = await Promise.all(e.map(async a => fsPromises.readFile(this._getAclFilePath(a))));
        for (let a = 0; a < e.length; ++a) {
            var r = e[a], o = this._getAclFilePath(r), o = await readAclBuffer(o, i[a], l, this.maxChangeId);
            if (0 < o.length) {
                for (var [ n, h ] of o) t.applyCmdObj(h, s), this.maxChangeId = n;
                this.loadedMaxAclNum = r;
            }
        }
    }
    async _listAclFiles() {
        var a = this.aclFolder;
        if (await folderOrFileExists(a)) return (await fsPromises.readdir(a)).filter(a => /^[1-9]/.test(a)).map(a => parseInt(a));
    }
    _getAclFilePath(a) {
        return path.join(this.aclFolder, a + "_acl.txt");
    }
}

Object.assign(module.exports, {
    QyKVDataLoader: QyKVDataLoader
});