let {
    readdir,
    rm,
    writeFile,
    rename
} = require("node:fs/promises"), path = require("node:path"), ensureDir = require("./QyUtils.js").ensureDir;

async function dumpStructure(e, r) {
    let t = {};
    for (var i of r.subdirList) {
        let e = i.name;
        for (;r.getFile(e); ) e += "_d";
        e = cleanName(e), t[e] = {
            x: i,
            count: 0
        };
    }
    await ensureDir(e);
    var a, n = [], u = [];
    let o = {};
    for (a of await readdir(e, {
        withFileTypes: !0
    })) {
        var s = a.name;
        a.isFile() ? n.push(s) : (u.push(s), o[s] = 1);
    }
    var l, p, m, c, h, f = [];
    for (l of u) t[l] || ((p = d((p = l) + "_d") || d(p.replace(/_d$/, ""))) ? (f.push(rename(path.join(e, l), path.join(e, p))), 
    t[p].count = 1) : f.push(rm(path.join(e, l), {
        recursive: !0
    })));
    for (m of n) r.getFile(m) || f.push(rm(path.join(e, m)));
    await Promise.all(f), f.length = 0;
    for (c of r.fileList) f.push(writeFile(path.join(e, cleanName(c.name)), c.contentAsText, {
        flush: !0
    }));
    for (h in await Promise.all(f), f.length = 0, t) f.push(dumpStructure(path.join(e, h), t[h].x));
    function d(e) {
        return e && 0 == t[e]?.count && !o[e] ? e : void 0;
    }
    await Promise.all(f);
}

function cleanName(e) {
    return e.replace(/"/g, "");
}

Object.assign(module.exports, {
    dumpStructure: dumpStructure
});