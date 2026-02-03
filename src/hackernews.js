let path = require("node:path"), fsPromises = require("node:fs/promises"), QyDB = require("./QyDB.js").QyDB, folderOrFileExists = require("./QyUtils.js").folderOrFileExists, shardRootFolder = (logger.level = "info", 
"D:\\exp\\HackerBook\\static-shards_json"), dataFolder = "./tmp/hackernews", qyDB = new QyDB(dataFolder, {
    fileLogLevel: "basic",
    maxInMemSnapshotCount: 1,
    snapshotMaxChangeCount: 2e3,
    unloadMemInterval: 2e4
}), batchSize = 100;

function insertShard(e, t) {
    var a, r = {}, o = {};
    for (a of e) {
        var {
            parent_id: n,
            child_id: s
        } = a;
        let e = o[s], t = (e = e || (o[s] = {}), o[n]), r = (t = t || (o[n] = {})).children;
        (r = r || (t.children = {}))[s] = e;
    }
    var i, l, c, d = {};
    let h = 0, f = 0;
    for (i of t) {
        var {
            id: m,
            time: u,
            parent: g
        } = i;
        if (null == g) {
            u = getDatePath(u);
            r[m] = u;
            let e = o[m];
            e ? e.item = i : e = o[m] = {
                item: i
            }, d[m] = e, ++h;
        } else {
            u = o[g];
            if (u) {
                let e = u.children, t = (e = e || (u.children = {}))[m];
                t ? t.item = i : t = e[m] = {
                    item: i
                }, ++f;
            } else logger.warn(m + `'s parent ${g} not exist.`);
        }
    }
    let p = 0;
    for (l in d) {
        var v = r[l];
        qyDB.batch.insert([ "hackernews", ...v, l ], d[l]), ++p >= batchSize && (qyDB.batch.run(), 
        p = 0);
    }
    for (c in 0 < p && qyDB.batch.run(), d) cleanContent(d[c]);
}

function cleanContent(e) {
    delete e.item;
    var t, r = e.children;
    for (t in r) cleanContent(r[t]);
}

function getDatePath(e) {
    e = new Date(1e3 * e);
    return [ e.getUTCFullYear(), e.getUTCMonth() + 1, e.getUTCDate() ];
}

async function insertShards() {
    var e;
    for (e of (await fsPromises.readdir(shardRootFolder)).map(e => /([0-9]+).json/.exec(e)[1]).sort((e, t) => e - t)) {
        var t = `shard_${e}.json`, {
            edges: r,
            items: a
        } = JSON.parse(await fsPromises.readFile(path.join(shardRootFolder, t)));
        logger.warn(t), insertShard(r, a);
    }
}

async function run() {
    console.time("accu"), process.argv[3] && (logger.level = process.argv[3]);
    let e = !0;
    if ("true" == process.argv[2]) {
        try {
            await fsPromises.rm(dataFolder, {
                recursive: !0
            });
        } catch (e) {
            logger.warn(e);
        }
        e = !0;
    } else await folderOrFileExists(dataFolder) || (e = !0);
    console.time("run"), console.time("start"), await qyDB.start(), console.timeEnd("start"), 
    e && await insertShards(), console.time("stop"), await qyDB.stop(), console.timeEnd("stop"), 
    console.timeEnd("run"), console.timeEnd("accu");
}

run();