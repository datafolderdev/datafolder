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
    let i = {};
    for (var o of r.subdirList) {
        let e = o.name;
        for (;r.getFile(e); ) e += "_d";
        e = _(e), i[e] = {
            x: o,
            count: 0
        };
    }
    await y(e);
    var t, a = [], s = [];
    let n = {};
    for (t of await w(e, {
        withFileTypes: !0
    })) {
        var f = t.name;
        t.isFile() ? a.push(f) : (s.push(f), n[f] = 1);
    }
    var l, u, p, m, h, c = [];
    for (l of s) i[l] || ((u = d((u = l) + "_d") || d(u.replace(/_d$/, ""))) ? (c.push(F(x(e, l), x(e, u))), 
    i[u].count = 1) : c.push(v(x(e, l), {
        recursive: !0
    })));
    for (p of a) r.getFile(p) || c.push(v(x(e, p)));
    await Promise.all(c), c.length = 0;
    for (m of r.fileList) c.push(g(x(e, _(m.name)), m.contentAsText, {
        flush: !0
    }));
    for (h in await Promise.all(c), c.length = 0, i) c.push(P(x(e, h), i[h].x));
    function d(e) {
        return e && 0 == i[e]?.count && !n[e] ? e : void 0;
    }
    await Promise.all(c);
}

function _(e) {
    return e.replace(/"/g, "");
}

export {
    P as dumpStructure
};