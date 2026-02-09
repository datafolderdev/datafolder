import {
    readdir as w,
    rm as v,
    writeFile as g,
    rename as F
} from "node:fs/promises";

import {
    join as x
} from "node:path";

import {
    ensureDir as y
} from "./QyUtils.js";

async function P(e, r) {
    let t = {};
    for (var i of r.subdirList) {
        let e = i.name;
        for (;r.getFile(e); ) e += "_d";
        e = _(e), t[e] = {
            x: i,
            count: 0
        };
    }
    await y(e);
    var o, a = [], s = [];
    let n = {};
    for (o of await w(e, {
        withFileTypes: !0
    })) {
        var u = o.name;
        o.isFile() ? a.push(u) : (s.push(u), n[u] = 1);
    }
    var f, l, p, m, c, h = [];
    for (f of s) t[f] || ((l = d((l = f) + "_d") || d(l.replace(/_d$/, ""))) ? (h.push(F(x(e, f), x(e, l))), 
    t[l].count = 1) : h.push(v(x(e, f), {
        recursive: !0
    })));
    for (p of a) r.getFile(p) || h.push(v(x(e, p)));
    await Promise.all(h), h.length = 0;
    for (m of r.fileList) h.push(g(x(e, _(m.name)), m.contentAsText, {
        flush: !0
    }));
    for (c in await Promise.all(h), h.length = 0, t) h.push(P(x(e, c), t[c].x));
    function d(e) {
        return e && 0 == t[e]?.count && !n[e] ? e : void 0;
    }
    await Promise.all(h);
}

function _(e) {
    return e.replace(/"/g, "");
}

export {
    P as dumpStructure
};