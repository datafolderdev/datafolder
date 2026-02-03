let path = require("node:path"), pipeline = require("node:stream").pipeline, promisify = require("node:util").promisify, {
    createGzip,
    createUnzip
} = require("node:zlib"), {
    createReadStream,
    createWriteStream
} = require("node:fs"), fsPromises = require("node:fs/promises"), logger = require("./QyLogger.js").logger, {
    isNotNullObj,
    folderOrFileExists,
    ensureParentDir
} = require("./QyUtils.js"), runOnceWithWorker = require("./QyWorker.js").runOnceWithWorker, pipe = promisify(pipeline), Zip_File_Extension = ".gz", compressorWorkerJsFileName = "QyCompressor_Worker.js";

function compressFile(e, i, r) {
    return isNotNullObj(i) && (r = i, i = void 0), i = i || e + Zip_File_Extension, 
    r = r || {}, e.endsWith(Zip_File_Extension) ? (logger.log(`${e} already ends with ${Zip_File_Extension}.`), 
    !1) : i.endsWith(Zip_File_Extension) ? runOnceWithWorker(compressorWorkerJsFileName, {
        operation: "compress",
        srcFilePath: e,
        destFilePath: i,
        options: r
    }).promise : (logger.log(`${i} doesn't end with ${Zip_File_Extension}.`), !1);
}

function decompressFile(e, i, r) {
    return e.endsWith(Zip_File_Extension) ? (isNotNullObj(i) && (r = i, i = void 0), 
    i = i || e.replace(new RegExp(Zip_File_Extension + "$"), ""), r = r || {}, path.extname(i) == Zip_File_Extension ? (logger.log(`${i} already ends with ${Zip_File_Extension}.`), 
    !1) : runOnceWithWorker(compressorWorkerJsFileName, {
        operation: "decompress",
        srcFilePath: e,
        destFilePath: i,
        options: r
    }).promise) : (logger.log(`${e} doesn't end with ${Zip_File_Extension}.`), !1);
}

async function runOperation({
    operation: e,
    srcFilePath: i,
    destFilePath: r,
    options: o
}) {
    var {
        removeSrcAfterSuccess: o,
        override: s
    } = o;
    if (!await folderOrFileExists(i)) throw new Error(i + " doesn't exist.");
    if (!s && await folderOrFileExists(r)) throw new Error(r + " already exists.");
    if (await ensureParentDir(r), await pipe(createReadStream(i), ("compress" == e ? createGzip : createUnzip)(), createWriteStream(r)), 
    logger.info(e + `ed ${i} to ${r}.`), o) try {
        await fsPromises.unlink(i), logger.info("Unlinked " + i);
    } catch (e) {
        logger.error(`Failed to unlink ${i}:`, e);
    }
}

Object.assign(module.exports, {
    Zip_File_Extension: Zip_File_Extension,
    compressFile: compressFile,
    decompressFile: decompressFile,
    runOperation: runOperation
});