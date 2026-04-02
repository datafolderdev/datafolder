import {
    join as m
} from "node:path";

import {
    rm as c,
    rename as r,
    readdir as h
} from "node:fs/promises";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as e
} from "./QyMessageWorker.js";

import {
    folderOrFileExists as d,
    ensureDir as F
} from "./QyUtils.js";

import {
    compressFile as t,
    Zip_File_Extension as i
} from "./QyCompressor.js";

import {
    logger as f
} from "./QyLogger.js";

import {
    getInfoFileName as l
} from "./QySnapshots.js";

export default class extends e {
    kvFolder;
    snapshotFolder;
    snapshotInfoFolder;
    aclFolder;
    historyAclFolder;
    historySnapshotFolder;
    constructor({
        kvFolder: e,
        options: s
    }) {
        super(s = {
            ...a("QyKVDataCleaner_Worker"),
            ...s
        }, [], [ "cleanAclFiles", "cleanPMFiles", "cleanVLFiles", "removeSnapshotsFiles" ]);
        var s = m(e, "history"), o = m(e, "snapshot");
        Object.assign(this, {
            kvFolder: e,
            snapshotFolder: o,
            snapshotInfoFolder: m(o, "info"),
            aclFolder: m(e, "acl"),
            historyAclFolder: m(s, "acl"),
            historySnapshotFolder: m(s, "snapshot")
        });
    }
    _op_start() {}
    _op_stop() {}
    async _op_cleanAclFiles(e) {
        var s = this, o = e, e = s.aclFolder;
        if (await d(e)) {
            var a, r = [];
            for (a of (await h(e)).filter(e => /^[1-9]/.test(e))) parseInt(a) <= o && r.push((async (e, s) => {
                var {
                    aclFolder: o,
                    historyAclFolder: a
                } = e;
                return await F(a), y(e, s, o, a);
            })(s, a));
            0 < r.length && await Promise.allSettled(r);
        }
    }
    async _op_cleanPMFiles(e) {
        await Promise.allSettled(e.map(([ e, s ]) => {
            return o = this, a = e, r = s, Promise.all([ "pM", "prefixPM" ].map(e => n(o, a, r, e)));
            var o, a, r;
        }));
    }
    async _op_cleanVLFiles(e, s) {
        await n(this, e, s, "vL");
    }
    async _op_removeSnapshotsFiles(e) {
        let {
            snapshotFolder: o,
            snapshotInfoFolder: a
        } = this;
        await Promise.all(e.map(async ([ s, e ]) => {
            await c(m(a, l(s, e))), await Promise.all([ "pM", "prefixPM", "vL" ].map(e => n(this, s, 1 / 0, e))), 
            await c(m(o, "" + s), {
                recursive: !0
            });
        }));
    }
}

function y(e, s, o, a) {
    o = m(o, s), a = m(a, s);
    return e.options.compressRedundantFile ? t(o, a + i, {
        override: !0,
        removeSrcAfterSuccess: !0
    }) : (f.info(`rename ${o} to ` + a), r(o, a));
}

async function n(s, o, a, r) {
    var {
        snapshotFolder: e,
        historySnapshotFolder: t
    } = s, i = m(e, "" + o);
    if (await d(i)) {
        let e;
        var l, n = [];
        for (l of await h(i)) {
            var p = new RegExp("^([0-9]+)_" + r).exec(l);
            p && (p = parseInt(p[1])) < a && (1 == p ? (e || (e = m(t, "" + o), 
            await F(e)), n.push(y(s, l, i, e))) : (p = m(i, l), f.info("Removing " + p), 
            n.push(c(p))));
        }
        0 < n.length && await Promise.allSettled(n);
    }
}