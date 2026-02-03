let crypto = require("node:crypto"), path = require("node:path"), process = require("node:process"), fsPromises = require("node:fs/promises"), fs = require("node:fs"), timers = require("node:timers/promises"), SpecialOperators = Object.fromEntries([ "$del", "$link", "$rpl", "$spec", "$raw", "$all", "$clone", "$ext", "$or", "$and", "$gt", "$lt", "$gte", "$lte" ].map(e => [ e, e ])), HiddenFolderName = "%", SpecialFilePaths = {
    HiddenFolderName: HiddenFolderName,
    TriggerDirPath: [ HiddenFolderName, "trigger" ],
    RpcDirPath: [ HiddenFolderName, "rpc" ],
    IndexDirPath: [ HiddenFolderName, "index" ],
    IndexPropPathsFileName: "propPaths"
};

function isMatchName(e) {
    return e.startsWith("{") && e.endsWith("}");
}

function getMatchParam(e) {
    return isMatchName(e) && e.substring(1, e.length - 1);
}

function getSizeStr(e) {
    return 1e12 < e ? Math.round(100 * e / 1e12) / 100 + "TB" : 1e9 < e ? Math.round(100 * e / 1e9) / 100 + "GB" : 1e6 < e ? Math.round(100 * e / 1e6) / 100 + "MB" : 1e3 < e ? Math.round(100 * e / 1e3) / 100 + "KB" : e;
}

let Hash_Length = 10;

function calHash(e, t = Hash_Length) {
    return crypto.createHash("sha256").update(e, "utf8").digest("base64url").slice(0, t);
}

let Hash_Key_Length = Hash_Length + 1;

function getSubdirMapKey(e) {
    return "d" + e;
}

function getFileMapKey(e) {
    return "f" + e;
}

function getContentKey(e) {
    return "c" + e;
}

function getRandomStr(e = 8) {
    return crypto.randomBytes(e).toString("hex");
}

function arrayLast(e) {
    return e[e.length - 1];
}

function isEmptyObj(e) {
    if (null != e) for (var t in e) if (null != e[t]) return !1;
    return !0;
}

function isNotNullObj(e) {
    return null != e && "object" == typeof e && !(e instanceof Date);
}

function isString(e) {
    return "string" == typeof e;
}

function isNumber(e) {
    return "number" == typeof e;
}

function isBoolean(e) {
    return "boolean" == typeof e;
}

function isFunction(e) {
    return "function" == typeof e;
}

function isSimpleType(e) {
    var t = typeof e;
    return "string" == t || "number" == t || "boolean" == t || e instanceof Date;
}

function trimArrayTail(e) {
    let t = e.length;
    for (;null == e[t - 1] && 0 < t; ) --t;
    return e.length = t, e;
}

function setPromise(r) {
    return r.promise || (r.promise = new Promise((e, t) => Object.assign(r, {
        resolve: e,
        reject: t
    }))), r;
}

function toBuffer(e) {
    return Buffer.isBuffer(e) ? e : Buffer.from(e);
}

function getSuffix(e) {
    return 1 < e ? "s" : "";
}

function ensureDir(e) {
    return fsPromises.mkdir(e, {
        recursive: !0
    });
}

function ensureParentDir(e) {
    return ensureDir(path.dirname(e));
}

async function getSize(e) {
    try {
        return (await fsPromises.stat(e)).size;
    } catch (e) {
        return !1;
    }
}

async function folderOrFileExists(e) {
    return !1 !== await getSize(e);
}

function sleep(e, t) {
    return timers.setTimeout(1e3 * e, !0, {
        signal: t
    });
}

let exclusiveFilePathMap = void 0;

function unlockPathMap() {
    for (var e of Object.keys(exclusiveFilePathMap)) unlockExclusiveFilePath(e);
}

async function lockExclusiveFilePath(t) {
    try {
        await ensureParentDir(t);
        var e = new Date().toISOString() + ": " + process.argv.join(" ");
        await fsPromises.writeFile(t, e, {
            flag: "wx",
            flush: !0
        }), logger.info("Locked " + t), exclusiveFilePathMap ? exclusiveFilePathMap[t] = 1 : (exclusiveFilePathMap = {
            [t]: 1
        }, process.on("exit", unlockPathMap), process.on("SIGINT", unlockPathMap));
    } catch (e) {
        throw "EEXIST" == e.code && logger.error(`Already started by ${(await fsPromises.readFile(t)).toString()}:`, e), 
        e;
    }
}

function unlockExclusiveFilePath(e) {
    try {
        fs.unlinkSync(e), logger.info("Unlocked " + e);
    } catch (e) {}
}

function fromSingleName(e) {
    return e.startsWith("[") && e.endsWith("]") ? JSON.parse(e) : e;
}

function toSingleName(e) {
    return Array.isArray(e) ? 1 == e.length ? e[0] : JSON.stringify(e) : e;
}

function pathSplit(e) {
    e = e.split("/");
    return e[0] || (e[0] = "/"), e;
}

function propNameSplit(e) {
    return e.split(".");
}

function propNameJoin(e) {
    return e.join(".");
}

function randomInt(e, t = 0) {
    return Math.floor(Math.random() * (e - t)) + t;
}

function listToMap(e) {
    var t, r = {};
    for (t of e) r[t] = 1;
    return r;
}

async function readBufferAsync(t, r, n, i) {
    var a = Buffer.allocUnsafe(i);
    for (let e = 0; e < i; ) {
        var o = (await r.read(a, e, i - e, n + e)).bytesRead;
        if (0 == o) return void logger.error(`read ${t} at ${n + e} returning 0 byte`);
        e += o;
    }
    return a;
}

function memoryPercent() {
    var e = process.availableMemory();
    return Math.round(e / (process.memoryUsage.rss() + e) * 100);
}

function generatorToList(e) {
    var t, r = [];
    for (t of e) r.push(t);
    return r;
}

Object.assign(module.exports, {
    SpecialOperators: SpecialOperators,
    calHash: calHash,
    Hash_Length: Hash_Length,
    Hash_Key_Length: Hash_Key_Length,
    pathSplit: pathSplit,
    isMatchName: isMatchName,
    getMatchParam: getMatchParam,
    isNumber: isNumber,
    isString: isString,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isNotNullObj: isNotNullObj,
    isSimpleType: isSimpleType,
    isEmptyObj: isEmptyObj,
    getSubdirMapKey: getSubdirMapKey,
    getFileMapKey: getFileMapKey,
    getContentKey: getContentKey,
    arrayLast: arrayLast,
    getRandomStr: getRandomStr,
    getSizeStr: getSizeStr,
    setPromise: setPromise,
    trimArrayTail: trimArrayTail,
    toBuffer: toBuffer,
    getSuffix: getSuffix,
    sleep: sleep,
    ensureDir: ensureDir,
    ensureParentDir: ensureParentDir,
    getSize: getSize,
    lockExclusiveFilePath: lockExclusiveFilePath,
    unlockExclusiveFilePath: unlockExclusiveFilePath,
    folderOrFileExists: folderOrFileExists,
    SpecialFilePaths: SpecialFilePaths,
    fromSingleName: fromSingleName,
    toSingleName: toSingleName,
    randomInt: randomInt,
    propNameSplit: propNameSplit,
    propNameJoin: propNameJoin,
    listToMap: listToMap,
    readBufferAsync: readBufferAsync,
    memoryPercent: memoryPercent,
    generatorToList: generatorToList
});