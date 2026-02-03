let path = require("node:path"), fsPromises = require("node:fs/promises"), QyDB = require("./QyDB.js").QyDB, {
    folderOrFileExists,
    randomInt,
    sleep,
    memoryPercent
} = require("./QyUtils.js"), runQueries = require("../scripts/flights2_queries.js").runQueries, arangoJsonFolderPath = (logger.level = "info", 
"../GraphCourse_DemoData_ArangoDB-2"), dataFolder = "./tmp/simulate2", airportList, flightList;

async function loadFile(t) {
    return JSON.parse(await fsPromises.readFile(path.join(arangoJsonFolderPath, t)));
}

async function loadData() {
    console.time("loadData"), [ airportList, flightList ] = await Promise.all([ loadFile("airports.json"), loadFile("flights.json") ]), 
    console.timeEnd("loadData");
}

function getRandomAirport() {
    return airportList[randomInt(airportList.length)];
}

function getRandomFlight() {
    return flightList[randomInt(flightList.length)];
}

function modifyAirport(t) {
    var e, i = getRandomAirport()._key, r = getRandomAirport(), o = {};
    for (e in r) 1 == randomInt(2) && (o[e] = r[e]);
    t.insert([ "airports", i ], o);
}

function modifyFlight(t) {
    var e, i = randomInt(flightList.length), {
        Year: r,
        Month: o,
        Day: s
    } = flightList[i], a = getRandomFlight(), n = {};
    for (e in a) 1 == randomInt(2) && (n[e] = a[e]);
    t.insert([ "flights", r, o, s, i ], n);
}

async function simulateOne(t, e) {
    for (;0 < e--; ) {
        switch (randomInt(2)) {
          case 0:
            modifyAirport(t);
            break;

          case 1:
            modifyFlight(t);
        }
        await sleep(1);
    }
}

function insertAirports(t) {
    console.time("insertAirports");
    var e, i = t.batch;
    for (e of airportList) i.insert("airports/" + e._key, e);
    i.run(), console.timeEnd("insertAirports");
}

function insertFlights(t) {
    logger.log("insertFlights begin"), console.time("insertFlights");
    var e, i = t.batch;
    for (let t = 0; t < flightList.length; ++t) {
        var r = flightList[t], {
            Year: o,
            Month: s,
            Day: a
        } = r;
        i.insert(`flights/${o}/${s}/${a}/` + t, r);
    }
    i.run(), logger.log("insertFlights end"), console.timeEnd("insertFlights"), 
    console.time("createFlightsIndex");
    for (e of t.dir("flights").subdirList) for (var n of e.subdirList) for (var l of n.subdirList) i.createIndex(l, [ "_from", "_to" ]);
    i.run(), console.timeEnd("createFlightsIndex");
}

function insertData(t) {
    insertAirports(t), insertFlights(t);
}

async function run() {
    console.time("total");
    var e = process.argv[2] || 1e3, i = process.argv[3] || 100;
    let t;
    if ("true" == process.argv[4]) {
        try {
            await fsPromises.rm(dataFolder, {
                recursive: !0
            });
        } catch (t) {}
        t = !0;
    } else await folderOrFileExists(dataFolder) || (t = !0);
    process.argv[5] && (logger.level = process.argv[5]), await loadData(), console.log(`airports:${airportList.length}, flights:` + flightList.length);
    var r = new QyDB(dataFolder, {
        fileLogLevel: "basic"
    }), o = (t && (await r.start(), insertData(r), await r.stop()), await r.start(), 
    runQueries(r), `simulate ${e} ` + i), s = (console.time(o), console.time("simulateStop"), 
    []);
    for (let t = 0; t < e; ++t) s.push(simulateOne(r, i));
    await Promise.all(s), console.timeEnd(o), logger.log(`Simulate ${e} for ${i} ended.`), 
    console.time("del%"), r.delDir("%"), console.timeEnd("del%"), insertData(r), 
    await r.stop(), console.timeEnd("simulateStop"), console.time("start"), await r.start(), 
    console.timeEnd("start"), runQueries(r), await r.stop(), console.timeEnd("total"), 
    global.gc && global.gc();
}

run();