import {
    join as n,
    basename as i
} from "node:path";

import {
    readdir as s
} from "node:fs/promises";

import {
    QyDB as e
} from "./QyDB.js";

import {
    loadFileList as l
} from "./QyUtils.js";

import {
    logger as u
} from "./QyLogger.js";

u.level = "info";

let m = "D:\\exp\\HackerBook\\static-shards_json", j = new e("C:\\tmp\\hackernews", {
    fileLogLevel: "none",
    maxInMemSnapshotCount: 1,
    snapshotMaxChangeCount: 2e3,
    unloadMemInterval: 2e4,
    noAcl: !0
}), C = 100;

function c(e, t) {
    var o, a = {}, r = {};
    for (o of e) {
        var {
            parent_id: n,
            child_id: i
        } = o;
        let e = r[i], t = (e = e || (r[i] = {}), r[n]), a = (t = t || (r[n] = {})).children;
        (a = a || (t.children = {}))[i] = e;
    }
    var s, l, m, c = {};
    let d = 0, f = 0;
    for (s of t) {
        var {
            id: p,
            time: h,
            parent: v
        } = s;
        if (null == v) {
            h = (e => [ (e = new Date(1e3 * e)).getUTCFullYear(), e.getUTCMonth() + 1, e.getUTCDate() ])(h);
            a[p] = h;
            let e = r[p];
            e ? e.item = s : e = r[p] = {
                item: s
            }, c[p] = e, ++d;
        } else {
            h = r[v];
            if (h) {
                let e = h.children, t = (e = e || (h.children = {}))[p];
                t ? t.item = s : t = e[p] = {
                    item: s
                }, ++f;
            } else u.warn(p + `'s parent ${v} not exist.`);
        }
    }
    let g = 0;
    for (l in c) {
        var w = a[l];
        j.batch.insert([ "hackernews", ...w, l ], c[l]), ++g >= C && (j.batch.run(), 
        g = 0);
    }
    for (m in 0 < g && j.batch.run(), c) !function e(t) {
        delete t.item;
        let a = t.children;
        for (var o in a) e(a[o]);
    }(c[m]);
}

(async () => {
    if (process.argv[2] && (u.level = process.argv[2]), console.time("run"), console.time("start"), 
    await j.start(), console.timeEnd("start"), !j.dir("hackernews")) {
        var e, t, a = (await s(m)).map(e => /([0-9]+).json/.exec(e)[1]).sort((e, t) => e - t).map(e => n(m, `shard_${e}.json`));
        for await ({
            filePath: e,
            bin: t
        } of l(a)) {
            var {
                edges: o,
                items: r
            } = JSON.parse(t);
            u.warn(i(e)), c(o, r);
        }
        await 0;
    }
    console.time("stop"), await j.stop(), console.timeEnd("stop"), console.timeEnd("run");
})();