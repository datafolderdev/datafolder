import {
    join as c
} from "node:path";

import {
    rm as m,
    rename as r,
    readdir as d
} from "node:fs/promises";

import {
    getDefaultOptions as o
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as e
} from "./QyMessageWorker.js";

import {
    folderOrFileExists as f,
    ensureDir as h
} from "./QyUtils.js";

import {
    compressFile as t,
    Zip_File_Extension as i
} from "./QyCompressor.js";

class s extends e {
    constructor({
        kvFolder: e,
        options: s
    }) {
        super(s = {
            ...o("QyKVDataCleaner_Worker"),
            ...s
        }, [ "start", "stop" ], [ "cleanAclFiles", "cleanPMFiles", "cleanVLFiles", "removeSnapshotsFiles" ]);
        var s = c(e, "history"), a = c(e, "snapshot");
        Object.assign(this, {
            kvFolder: e,
            snapshotFolder: a,
            snapshotInfoFolder: c(a, "info"),
            aclFolder: c(e, "acl"),
            historyAclFolder: c(s, "acl"),
            historySnapshotFolder: c(s, "snapshot")
        });
    }
    _op_start() {}
    _op_stop() {}
    async _op_cleanAclFiles(e) {
        var s = this, a = e, e = s.aclFolder;
        if (await f(e)) {
            var o, r = [];
            for (o of (await d(e)).filter(e => /^[1-9]/.test(e))) parseInt(o) <= a && r.push((async (e, s) => {
                var {
                    aclFolder: a,
                    historyAclFolder: o
                } = e;
                return await h(o), F(e, s, a, o);
            })(s, o));
            0 < r.length && await Promise.allSettled(r);
        }
    }
    async _op_cleanPMFiles(e) {
        await Promise.allSettled(e.map(([ e, s ]) => {
            return a = this, o = e, r = s, Promise.all([ "pM", "prefixPM" ].map(e => l(a, o, r, e)));
            var a, o, r;
        }));
    }
    async _op_cleanVLFiles(e, s) {
        await l(this, e, s, "vL");
    }
    async _op_removeSnapshotsFiles(e) {
        let {
            snapshotFolder: s,
            snapshotInfoFolder: a
        } = this;
        await Promise.all(e.map(async e => {
            await m(c(a, e + ".json")), await m(c(s, "" + e), {
                recursive: !0
            });
        }));
    }
}

function F(e, s, a, o) {
    a = c(a, s), o = c(o, s);
    return e.options.compressRedundantFile ? t(a, o + i, {
        override: !0,
        removeSrcAfterSuccess: !0
    }) : (logger.info(`rename ${a} to ` + o), r(a, o));
}

async function l(s, a, o, r) {
    var {
        snapshotFolder: e,
        historySnapshotFolder: t
    } = s, i = c(e, "" + a);
    if (await f(i)) {
        let e;
        var l, n = [];
        for (l of await d(i)) {
            var p = new RegExp("^([0-9]+)_" + r).exec(l);
            p && (p = parseInt(p[1])) < o && (1 == p ? (e || (e = c(t, "" + a), 
            await h(e)), n.push(F(s, l, i, e))) : (p = c(i, l), logger.info("Removing " + p), 
            n.push(m(p))));
        }
        0 < n.length && await Promise.allSettled(n);
    }
}

export default s;