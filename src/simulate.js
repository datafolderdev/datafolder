let path = require("node:path"), fsPromises = require("node:fs/promises"), QyDB = require("./QyDB.js").QyDB, {
    folderOrFileExists,
    randomInt,
    sleep
} = require("./QyUtils.js"), runQueries = require("../scripts/airbnb2_queries.js").runQueries, airbnbDataFolder = (logger.level = "info", 
"../airbnb"), dataFolder = "./tmp/simulate", hosts, listings, reviews, hostIdList, listingIdList, reviewIdList;

async function loadJsonFile(t) {
    return JSON.parse(await fsPromises.readFile(path.join(airbnbDataFolder, t)));
}

async function loadData() {
    console.time("loadData"), [ hosts, listings, reviews ] = await Promise.all([ loadJsonFile("hosts.json"), loadJsonFile("listings.json"), loadJsonFile("reviews.json") ]), 
    hostIdList = Object.keys(hosts), listingIdList = Object.keys(listings), reviewIdList = Object.keys(reviews), 
    console.timeEnd("loadData");
}

function insertData(t) {
    console.time("insertData");
    var e, s, i, o = t.batch;
    for (e of hostIdList) o.insert([ "hosts", e ], hosts[e]);
    for (s of listingIdList) {
        var n = listings[s], {
            property_type: r,
            room_type: a,
            bed_type: l
        } = n;
        o.insert([ "airbnb", r, a, l, s ], n);
    }
    for (i of reviewIdList) {
        var d = reviews[i];
        o.insert([ "reviews", d.listing_id, i ], d);
    }
    o.run(), console.timeEnd("insertData");
}

function getRandomHost() {
    return hosts[hostIdList[randomInt(hostIdList.length)]];
}

function getRandomListing() {
    return listings[listingIdList[randomInt(listingIdList.length)]];
}

function getRandomReview() {
    return reviews[reviewIdList[randomInt(reviewIdList.length)]];
}

function modifyHost(t) {
    var e, s = getRandomHost(), i = getRandomHost(), o = {};
    for (e in i) 1 == randomInt(2) && (o[e] = i[e]);
    t.insert([ "hosts", s.host_id ], o);
}

function modifyListing(t) {
    var e, s = getRandomListing(), i = getRandomListing(), o = {};
    for (e in i) 1 == randomInt(2) && (o[e] = i[e]);
    var {
        property_type: s,
        room_type: n,
        bed_type: r,
        _id: a
    } = s;
    t.insert([ "airbnb", s, n, r, a ], o);
}

function modifyReview(t) {
    var e, s = getRandomReview(), i = getRandomReview(), o = {};
    for (e in i) 1 == randomInt(2) && (o[e] = i[e]);
    t.insert([ "reviews", s.listing_id, s._id ], o);
}

async function simulateOne(t, e) {
    for (;0 < e--; ) {
        switch (randomInt(3)) {
          case 0:
            modifyHost(t);
            break;

          case 1:
            modifyListing(t);
            break;

          case 2:
            modifyReview(t);
        }
        await sleep(randomInt(1e3) / 1e3);
    }
}

async function run() {
    console.time("total");
    var e = process.argv[2] || 1e3, s = process.argv[3] || 100;
    let t;
    if ("true" == process.argv[4]) {
        try {
            await fsPromises.rm(dataFolder, {
                recursive: !0
            });
        } catch (t) {}
        t = !0;
    } else await folderOrFileExists(dataFolder) || (t = !0);
    process.argv[5] && (logger.level = process.argv[5]), await loadData(), console.log(`hosts:${hostIdList.length}, listings:${listingIdList.length}, reviews:` + reviewIdList.length);
    var i = new QyDB(dataFolder, {
        fileLogLevel: "basic"
    }), o = (t && (await i.start(), insertData(i), await i.stop()), console.time("simulate " + s), 
    await i.start(), runQueries(i), []);
    for (let t = 0; t < e; ++t) o.push(simulateOne(i, s));
    await Promise.all(o), insertData(i), await i.stop(), console.timeEnd("simulate " + s), 
    console.time("start"), await i.start(), console.timeEnd("start"), runQueries(i), 
    await i.stop(), console.timeEnd("total");
}

run();