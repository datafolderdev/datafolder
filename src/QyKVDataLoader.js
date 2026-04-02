import {
    readFile as u,
    readdir as x
} from "node:fs/promises";

import {
    join as t
} from "node:path";

import {
    folderOrFileExists as g
} from "./QyUtils.js";

import {
    readAclBuffer as F
} from "./QyAcl.js";

import {
    QySnapshots as e
} from "./QySnapshots.js";

import {
    getDefaultOptions as l
} from "./QyDefaultOptions.js";

class a {
    options;
    kvFolder;
    aclFolder;
    snapshotFolder;
    qySnapshots;
    loadedMaxAclNum = 0;
    aclKeyValueMap = {};
    maxChangeId = 0;
    constructor(a, s) {
        s = {
            ...l("QyKVDataLoader"),
            ...s
        };
        var o = t(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            options: s,
            aclFolder: t(a, "acl"),
            snapshotFolder: o,
            qySnapshots: new e(o, s)
        });
    }
    async load() {
        var a = this.qySnapshots, [ s ] = await Promise.all([ (async a => {
            if (a = a.aclFolder, await g(a)) return (await x(a)).filter(a => /^[1-9]/.test(a)).map(a => parseInt(a));
        })(this), a.loadSnapshotInfos() ]);
        let {
            maxSnapshotNum: o,
            snapshotMaxChangeId: t
        } = a;
        if (this.maxChangeId = t, s) {
            var e = this, l = s.filter(a => a > o), {
                aclKeyValueMap: r,
                qySnapshots: n,
                options: s
            } = (l.sort((a, s) => a - s), e), i = s.autoRepairAclFile, p = await Promise.all(l.map(async a => u(I(e, a))));
            for (let a = 0; a < l.length; ++a) {
                var d = l[a], m = I(e, d), m = await F(m, p[a], i, e.maxChangeId);
                if (0 < m.length) {
                    for (var [ h, c ] of m) n.applyCmdObj(c, r), e.maxChangeId = h;
                    e.loadedMaxAclNum = d;
                }
            }
            await 0;
        }
        var {
            maxChangeId: s,
            loadedMaxAclNum: f,
            aclKeyValueMap: y
        } = this;
        return {
            maxChangeId: s,
            loadedMaxAclNum: f,
            qySnapshots: a,
            aclKeyValueMap: y
        };
    }
}

function I(a, s) {
    return t(a.aclFolder, s + "_acl.txt");
}

export {
    a as QyKVDataLoader
};