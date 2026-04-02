import {
    join as e
} from "node:path";

import {
    readFile as o,
    rm as a
} from "node:fs/promises";

import {
    QyDB as n
} from "./QyDB.js";

import {
    folderOrFileExists as l,
    randomInt as c,
    sleep as m
} from "./QyUtils.js";

import {
    logger as f
} from "./QyLogger.js";

import {
    runQueries as g
} from "../scripts/flights2_queries.js";

f.level = "info";

let s = "../GraphCourse_DemoData_ArangoDB-2", p = "C:\\tmp\\simulate2", d, h;

async function u(t) {
    return JSON.parse(await o(e(s, t)));
}

function v() {
    return d[c(d.length)];
}

function w(t) {
    var e, o = c(h.length), {
        Year: s,
        Month: r,
        Day: i
    } = h[o], a = h[c(h.length)], n = {};
    for (e in a) 1 == c(2) && (n[e] = a[e]);
    t.insert([ "flights", s, r, i, o ], n);
}

async function y(t, e) {
    for (;0 < e--; ) {
        switch (c(2)) {
          case 0:
            o = a = i = r = s = void 0;
            var o, s = t, r = v()._key, i = v(), a = {};
            for (o in i) 1 == c(2) && (a[o] = i[o]);
            s.insert([ "airports", r ], a);
            break;

          case 1:
            w(t);
        }
        await m(1);
    }
}

function b(t) {
    var e = t;
    console.time("insertAirports");
    var o, s = e.batch;
    for (o of d) s.insert("airports/" + o._key, o);
    s.run(), console.timeEnd("insertAirports");
    e = t;
    f.log("insertFlights begin"), console.time("insertFlights");
    var r, i = e.batch;
    for (let t = 0; t < h.length; ++t) {
        var a = h[t], {
            Year: n,
            Month: l,
            Day: c
        } = a;
        i.insert(`flights/${n}/${l}/${c}/` + t, a);
    }
    i.run(), f.log("insertFlights end"), console.timeEnd("insertFlights"), console.time("createFlightsIndex");
    for (r of e.dir("flights").subdirList) for (var m of r.subdirList) for (var g of m.subdirList) i.createIndex(g, [ "_from", "_to" ]);
    i.run(), console.timeEnd("createFlightsIndex");
}

(async () => {
    console.time("total");
    let e = +(process.argv[2] || 1e3), o = +(process.argv[3] || 100), t;
    if ("true" == process.argv[4]) {
        try {
            await a(p, {
                recursive: !0
            });
        } catch (t) {}
        t = !0;
    } else await l(p) || (t = !0);
    process.argv[5] && (f.level = process.argv[5]), console.time("loadData"), [ d, h ] = await Promise.all([ u("airports.json"), u("flights.json") ]), 
    await !console.timeEnd("loadData"), console.log(`airports:${d.length}, flights:` + h.length);
    var s = new n(p, {
        fileLogLevel: "basic",
        maxInMemSnapshotCount: 3
    }), r = (t && (await s.start(), b(s), await s.stop()), await s.start(), g(s), 
    `simulate ${e} ` + o), i = (console.time(r), console.time("simulateStop"), []);
    for (let t = 0; t < e; ++t) i.push(y(s, o));
    await Promise.all(i), console.timeEnd(r), f.log(`Simulate ${e} for ${o} ended.`), 
    console.time("del%"), s.delDir("%"), console.timeEnd("del%"), b(s), await s.stop(), 
    console.timeEnd("simulateStop"), console.time("start"), await s.start(), console.timeEnd("start"), 
    g(s), await s.stop(), console.timeEnd("total"), global.gc && global.gc();
})();