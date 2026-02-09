import {
    join as o
} from "node:path";

import {
    readdir as n,
    readFile as i
} from "node:fs/promises";

import {
    QyDB as e
} from "./QyDB.js";

logger.level = "info";

let s = "D:\\exp\\HackerBook\\static-shards_json", w = new e({
    fileLogLevel: "basic",
    maxInMemSnapshotCount: 1,
    snapshotMaxChangeCount: 2e3,
    unloadMemInterval: 2e4
}), C = 100;

function l(e, t) {
    var a, r = {}, o = {};
    for (a of e) {
        var {
            parent_id: n,
            child_id: i
        } = a;
        let e = o[i], t = (e = e || (o[i] = {}), o[n]), r = (t = t || (o[n] = {})).children;
        (r = r || (t.children = {}))[i] = e;
    }
    var s, l, c, m = {};
    let d = 0, f = 0;
    for (s of t) {
        var {
            id: h,
            time: p,
            parent: g
        } = s;
        if (null == g) {
            p = (e => [ (e = new Date(1e3 * e)).getUTCFullYear(), e.getUTCMonth() + 1, e.getUTCDate() ])(p);
            r[h] = p;
            let e = o[h];
            e ? e.item = s : e = o[h] = {
                item: s
            }, m[h] = e, ++d;
        } else {
            p = o[g];
            if (p) {
                let e = p.children, t = (e = e || (p.children = {}))[h];
                t ? t.item = s : t = e[h] = {
                    item: s
                }, ++f;
            } else logger.warn(h + `'s parent ${g} not exist.`);
        }
    }
    let v = 0;
    for (l in m) {
        var u = r[l];
        w.batch.insert([ "hackernews", ...u, l ], m[l]), ++v >= C && (w.batch.run(), 
        v = 0);
    }
    for (c in 0 < v && w.batch.run(), m) !function e(t) {
        delete t.item;
        let r = t.children;
        for (var a in r) e(r[a]);
    }(m[c]);
}

(async () => {
    if (process.argv[2] && (logger.level = process.argv[2]), console.time("run"), 
    console.time("start"), await w.start(), console.timeEnd("start"), !w.dir("hackernews")) {
        var e;
        for (e of (await n(s)).map(e => /([0-9]+).json/.exec(e)[1]).sort((e, t) => e - t)) {
            var t = `shard_${e}.json`, {
                edges: r,
                items: a
            } = JSON.parse(await i(o(s, t)));
            logger.warn(t), l(r, a);
        }
        await 0;
    }
    console.time("stop"), await w.stop(), console.timeEnd("stop"), console.timeEnd("run");
})();