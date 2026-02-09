import {
    join as t
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
    sleep as g
} from "./QyUtils.js";

import {
    runQueries as m
} from "../scripts/flights2_queries.js";

logger.level = "info";

let s = "../GraphCourse_DemoData_ArangoDB-2", f = "./tmp/simulate2", d, p;

async function h(e) {
    return JSON.parse(await o(t(s, e)));
}

function u() {
    return d[c(d.length)];
}

function v(e) {
    var t, o = c(p.length), {
        Year: s,
        Month: r,
        Day: i
    } = p[o], a = p[c(p.length)], n = {};
    for (t in a) 1 == c(2) && (n[t] = a[t]);
    e.insert([ "flights", s, r, i, o ], n);
}

async function w(e, t) {
    for (;0 < t--; ) {
        switch (c(2)) {
          case 0:
            o = a = i = r = s = void 0;
            var o, s = e, r = u()._key, i = u(), a = {};
            for (o in i) 1 == c(2) && (a[o] = i[o]);
            s.insert([ "airports", r ], a);
            break;

          case 1:
            v(e);
        }
        await g(1);
    }
}

function y(e) {
    var t = e;
    console.time("insertAirports");
    var o, s = t.batch;
    for (o of d) s.insert("airports/" + o._key, o);
    s.run(), console.timeEnd("insertAirports");
    t = e;
    logger.log("insertFlights begin"), console.time("insertFlights");
    var r, i = t.batch;
    for (let e = 0; e < p.length; ++e) {
        var a = p[e], {
            Year: n,
            Month: l,
            Day: c
        } = a;
        i.insert(`flights/${n}/${l}/${c}/` + e, a);
    }
    i.run(), logger.log("insertFlights end"), console.timeEnd("insertFlights"), 
    console.time("createFlightsIndex");
    for (r of t.dir("flights").subdirList) for (var g of r.subdirList) for (var m of g.subdirList) i.createIndex(m, [ "_from", "_to" ]);
    i.run(), console.timeEnd("createFlightsIndex");
}

(async () => {
    console.time("total");
    let t = process.argv[2] || 1e3, o = process.argv[3] || 100, e;
    if ("true" == process.argv[4]) {
        try {
            await a(f, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await l(f) || (e = !0);
    process.argv[5] && (logger.level = process.argv[5]), console.time("loadData"), 
    [ d, p ] = await Promise.all([ h("airports.json"), h("flights.json") ]), await !console.timeEnd("loadData"), 
    console.log(`airports:${d.length}, flights:` + p.length);
    var s = new n(f, {
        fileLogLevel: "basic"
    }), r = (e && (await s.start(), y(s), await s.stop()), await s.start(), m(s), 
    `simulate ${t} ` + o), i = (console.time(r), console.time("simulateStop"), []);
    for (let e = 0; e < t; ++e) i.push(w(s, o));
    await Promise.all(i), console.timeEnd(r), logger.log(`Simulate ${t} for ${o} ended.`), 
    console.time("del%"), s.delDir("%"), console.timeEnd("del%"), y(s), await s.stop(), 
    console.timeEnd("simulateStop"), console.time("start"), await s.start(), console.timeEnd("start"), 
    m(s), await s.stop(), console.timeEnd("total"), global.gc && global.gc();
})();