let {
    open,
    rm
} = require("node:fs/promises"), assert = require("node:assert/strict"), QyDB = require("../src/QyDB.js").QyDB, folderOrFileExists = require("../src/QyUtils.js").folderOrFileExists, socPokecRelationshipsFilePath = (logger.level = "info", 
"D:/SampleData/soc_pokec/soc-pokec-relationships.txt"), socPokecProfileFilePath = "D:/SampleData/soc_pokec/soc-pokec-profiles.txt", dataFolder = "./tmp/soc_pokec", qyDB = new QyDB(dataFolder);

async function insertProfiles() {}

async function insertData() {
    console.time("readData");
    var e, a = {};
    for await (e of (await open(socPokecRelationshipsFilePath, "r")).readLines()) {
        var [ t, r ] = e.split("\t"), s = a[t];
        s ? s[r] = 1 : a[t] = {
            [r]: 1
        };
    }
    console.timeEnd("readData"), console.time("insertData");
    var o, i = qyDB.batch;
    let n = 0;
    for (o in a) {
        var l = a[o];
        i.insertP([ "relationships", o ], l), 3e4 < ++n && (await i.run(!0), n = 0);
    }
    await i.run(!0), console.timeEnd("insertData");
}

async function run() {
    process.argv[3] && (logger.level = process.argv[3]);
    let e;
    if ("true" == process.argv[2]) {
        try {
            await rm(dataFolder, {
                recursive: !0
            });
        } catch (e) {}
        e = !0;
    } else await folderOrFileExists(dataFolder) || (e = !0);
    console.time("run"), await qyDB.start(), e && await insertData(), await qyDB.stop(), 
    console.timeEnd("run");
}

run();