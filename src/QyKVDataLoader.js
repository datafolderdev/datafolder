import {
    readFile as u,
    readdir as x
} from "node:fs/promises";

import {
    join as o
} from "node:path";

import {
    folderOrFileExists as g
} from "./QyUtils.js";

import {
    readAclBuffer as M
} from "./QyAcl.js";

import {
    QySnapshots as e
} from "./QySnapshots.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class a {
    constructor(a, s) {
        s = {
            ...r("QyKVDataLoader"),
            ...s
        };
        var t = o(a, "snapshot");
        Object.assign(this, {
            kvFolder: a,
            options: s,
            aclFolder: o(a, "acl"),
            snapshotFolder: t,
            loadedMaxAclNum: 0,
            aclKeyValueMap: {},
            qySnapshots: new e(t, s)
        });
    }
    async load() {
        var a = this.qySnapshots, [ s ] = await Promise.all([ (async a => {
            if (a = a.aclFolder, await g(a)) return (await x(a)).filter(a => /^[1-9]/.test(a)).map(a => parseInt(a));
        })(this), a.loadSnapshotInfos() ]);
        let {
            maxSnapshotNum: t,
            snapshotMaxChangeId: o
        } = a;
        if (this.maxChangeId = o, s) {
            var e = this, r = s.filter(a => a > t), {
                aclKeyValueMap: l,
                qySnapshots: i,
                options: s
            } = (r.sort((a, s) => a - s), e), n = s.autoRepairAclFile, p = await Promise.all(r.map(async a => u(F(e, a))));
            for (let a = 0; a < r.length; ++a) {
                var d = r[a], m = F(e, d), m = await M(m, p[a], n, e.maxChangeId);
                if (0 < m.length) {
                    for (var [ h, c ] of m) i.applyCmdObj(c, l), e.maxChangeId = h;
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

function F(a, s) {
    return o(a.aclFolder, s + "_acl.txt");
}

export {
    a as QyKVDataLoader
};