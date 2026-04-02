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
    logger as l
} from "./QyLogger.js";

import {
    runQueries as c
} from "../scripts/airbnb2_queries.js";

l.level = "info";

let r = "../airbnb", m = "./tmp/simulate", p, f, v, d, g, y;

async function b(e) {
    return JSON.parse(await s(t(r, e)));
}

function h(e) {
    console.time("insertData");
    var t, s, r, o = e.batch;
    for (t of d) o.insert([ "hosts", t ], p[t]);
    for (s of g) {
        var i = f[s], {
            property_type: a,
            room_type: n,
            bed_type: l
        } = i;
        o.insert([ "airbnb", a, n, l, s ], i);
    }
    for (r of y) {
        var c = v[r];
        o.insert([ "reviews", c.listing_id, r ], c);
    }
    o.run(), console.timeEnd("insertData");
}

function _() {
    return p[d[u(d.length)]];
}

function j() {
    return f[g[u(g.length)]];
}

function D() {
    return v[y[u(y.length)]];
}

async function E(e, t) {
    for (;0 < t--; ) {
        switch (u(3)) {
          case 0:
            s = a = i = o = r = void 0;
            var s, r = e, o = _(), i = _(), a = {};
            for (s in i) 1 == u(2) && (a[s] = i[s]);
            r.insert([ "hosts", o.host_id ], a);
            break;

          case 1:
            n = f = p = m = c = l = o = r = void 0;
            var n, r = e, o = j(), l = j(), c = {};
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
            var v, m = e, p = D(), d = D(), g = {};
            for (v in d) 1 == u(2) && (g[v] = d[v]);
            m.insert([ "reviews", p.listing_id, p._id ], g);
        }
        await w(u(1e3) / 1e3);
    }
}

(async () => {
    console.time("total");
    let t = +(process.argv[2] || 1e3), s = +(process.argv[3] || 100), e;
    if ("true" == process.argv[4]) {
        try {
            await i(m, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await n(m) || (e = !0);
    process.argv[5] && (l.level = process.argv[5]), console.time("loadData"), [ p, f, v ] = await Promise.all([ b("hosts.json"), b("listings.json"), b("reviews.json") ]), 
    d = Object.keys(p), g = Object.keys(f), y = Object.keys(v), await !console.timeEnd("loadData"), 
    console.log(`hosts:${d.length}, listings:${g.length}, reviews:` + y.length);
    var r = new a(m, {
        fileLogLevel: "basic"
    }), o = (e && (await r.start(), h(r), await r.stop()), console.time("simulate " + s), 
    await r.start(), c(r), []);
    for (let e = 0; e < t; ++e) o.push(E(r, s));
    await Promise.all(o), h(r), await r.stop(), console.timeEnd("simulate " + s), 
    console.time("start"), await r.start(), console.timeEnd("start"), c(r), await r.stop(), 
    console.timeEnd("total");
})();