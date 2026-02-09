import {
    open as c,
    rm as t
} from "node:fs/promises";

import "node:assert/strict";

import {
    QyDB as e
} from "../src/QyDB.js";

import {
    folderOrFileExists as p
} from "../src/QyUtils.js";

logger.level = "info";

let m = "D:/SampleData/soc_pokec/soc-pokec-relationships.txt";

let f = "./tmp/soc_pokec", w = new e(f);

(async () => {
    process.argv[3] && (logger.level = process.argv[3]);
    let e;
    if ("true" == process.argv[2]) {
        try {
            await t(f, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await p(f) || (e = !0);
    if (console.time("run"), await w.start(), e) {
        {
            console.time("readData");
            var a, r = await c(m, "r"), s = {};
            for await (o of r.readLines()) {
                var [ o, i ] = o.split("\t"), n = s[o];
                n ? n[i] = 1 : s[o] = {
                    [i]: 1
                };
            }
            console.timeEnd("readData"), console.time("insertData");
            let e = w.batch, t = 0;
            for (a in s) {
                var l = s[a];
                e.insertP([ "relationships", a ], l), 3e4 < ++t && (await e.run(!0), 
                t = 0);
            }
            await e.run(!0), console.timeEnd("insertData");
        }
        await 0;
    }
    await w.stop(), console.timeEnd("run");
})();