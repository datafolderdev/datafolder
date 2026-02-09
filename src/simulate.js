import {
    join as t
} from "node:path";

import {
    readFile as s,
    rm as i
} from "node:fs/promises";

import {
    QyDB as a
} from "./QyDB.js";

import {
    folderOrFileExists as n,
    randomInt as u,
    sleep as w
} from "./QyUtils.js";

import {
    runQueries as l
} from "../scripts/airbnb2_queries.js";

logger.level = "info";

let r = "../airbnb", c = "./tmp/simulate", m, p, f, v, d, g;

async function y(e) {
    return JSON.parse(await s(t(r, e)));
}

function b(e) {
    console.time("insertData");
    var t, s, r, o = e.batch;
    for (t of v) o.insert([ "hosts", t ], m[t]);
    for (s of d) {
        var i = p[s], {
            property_type: a,
            room_type: n,
            bed_type: l
        } = i;
        o.insert([ "airbnb", a, n, l, s ], i);
    }
    for (r of g) {
        var c = f[r];
        o.insert([ "reviews", c.listing_id, r ], c);
    }
    o.run(), console.timeEnd("insertData");
}

function h() {
    return m[v[u(v.length)]];
}

function _() {
    return p[d[u(d.length)]];
}

function j() {
    return f[g[u(g.length)]];
}

async function D(e, t) {
    for (;0 < t--; ) {
        switch (u(3)) {
          case 0:
            s = a = i = o = r = void 0;
            var s, r = e, o = h(), i = h(), a = {};
            for (s in i) 1 == u(2) && (a[s] = i[s]);
            r.insert([ "hosts", o.host_id ], a);
            break;

          case 1:
            n = f = p = m = c = l = o = r = void 0;
            var n, r = e, o = _(), l = _(), c = {};
            for (n in l) 1 == u(2) && (c[n] = l[n]);
            var {
                property_type: o,
                room_type: m,
                bed_type: p,
                _id: f
            } = o;
            r.insert([ "airbnb", o, m, p, f ], c);
            break;

          case 2:
            v = g = d = p = m = void 0;
            var v, m = e, p = j(), d = j(), g = {};
            for (v in d) 1 == u(2) && (g[v] = d[v]);
            m.insert([ "reviews", p.listing_id, p._id ], g);
        }
        await w(u(1e3) / 1e3);
    }
}

(async () => {
    console.time("total");
    let t = process.argv[2] || 1e3, s = process.argv[3] || 100, e;
    if ("true" == process.argv[4]) {
        try {
            await i(c, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await n(c) || (e = !0);
    process.argv[5] && (logger.level = process.argv[5]), console.time("loadData"), 
    [ m, p, f ] = await Promise.all([ y("hosts.json"), y("listings.json"), y("reviews.json") ]), 
    v = Object.keys(m), d = Object.keys(p), g = Object.keys(f), await !console.timeEnd("loadData"), 
    console.log(`hosts:${v.length}, listings:${d.length}, reviews:` + g.length);
    var r = new a(c, {
        fileLogLevel: "basic"
    }), o = (e && (await r.start(), b(r), await r.stop()), console.time("simulate " + s), 
    await r.start(), l(r), []);
    for (let e = 0; e < t; ++e) o.push(D(r, s));
    await Promise.all(o), b(r), await r.stop(), console.timeEnd("simulate " + s), 
    console.time("start"), await r.start(), console.timeEnd("start"), l(r), await r.stop(), 
    console.timeEnd("total");
})();