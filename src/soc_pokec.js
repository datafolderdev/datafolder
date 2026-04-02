import {
    open as l,
    rm as t
} from "node:fs/promises";

import "node:assert/strict";

import {
    QyDB as e
} from "../src/QyDB.js";

import {
    folderOrFileExists as m
} from "../src/QyUtils.js";

import {
    logger as p
} from "./QyLogger.js";

import "node:assert";

p.level = "info";

let f = "D:/SampleData/soc_pokec/soc-pokec-relationships.txt";

let d = "./tmp/soc_pokec", w = new e(d);

(async () => {
    process.argv[3] && (p.level = process.argv[3]);
    let e;
    if ("true" == process.argv[2]) {
        try {
            await t(d, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await m(d) || (e = !0);
    if (console.time("run"), await w.start(), e) {
        {
            console.time("readData");
            var a, s = await l(f, "r"), r = {};
            for await (o of s.readLines()) {
                var [ o, i ] = o.split("\t"), n = r[o];
                n ? n[i] = 1 : r[o] = {
                    [i]: 1
                };
            }
            console.timeEnd("readData"), console.time("insertData");
            let e = w.batch, t = 0;
            for (a in r) {
                var c = r[a];
                e.insertP([ "relationships", a ], c), 3e4 < ++t && (await e.run(!0), 
                t = 0);
            }
            await e.run(!0), console.timeEnd("insertData"), s.close();
        }
        await 0;
    }
    await w.stop(), console.timeEnd("run");
})();