import {
    extname as t
} from "node:path";

import {
    pipeline as e
} from "node:stream";

import {
    promisify as r
} from "node:util";

import {
    createGzip as s,
    createUnzip as a
} from "node:zlib";

import {
    createReadStream as n,
    createWriteStream as d
} from "node:fs";

import m from "node:fs/promises";

import {
    logger as p
} from "./QyLogger.js";

import {
    isNotNullObj as i,
    folderOrFileExists as l,
    ensureParentDir as f
} from "./QyUtils.js";

import {
    runOnceWithWorker as c
} from "./QyWorker.js";

let g = r(e), o = ".gz", h = "QyCompressor_Worker.ts";

function w(e, r, o) {
    return i(r) && (o = r, r = void 0), r = r || e + ".gz", o = o || {}, e.endsWith(".gz") ? (p.log(e + " already ends with .gz."), 
    !1) : r.endsWith(".gz") ? c(h, {
        operation: "compress",
        srcFilePath: e,
        destFilePath: r,
        options: o
    }).promise : (p.log(r + " doesn't end with .gz."), !1);
}

function z(e, r, o) {
    return e.endsWith(".gz") ? (i(r) && (o = r, r = void 0), r = r || e.replace(new RegExp(".gz$"), ""), 
    o = o || {}, ".gz" == t(r) ? (p.log(r + " already ends with .gz."), !1) : c(h, {
        operation: "decompress",
        srcFilePath: e,
        destFilePath: r,
        options: o
    }).promise) : (p.log(e + " doesn't end with .gz."), !1);
}

async function u({
    operation: e,
    srcFilePath: r,
    destFilePath: o,
    options: t
}) {
    var {
        removeSrcAfterSuccess: t,
        override: i
    } = t;
    if (!await l(r)) throw new Error(r + " doesn't exist.");
    if (!i && await l(o)) throw new Error(o + " already exists.");
    if (await f(o), await g(n(r), ("compress" == e ? s : a)(), d(o)), p.info(e + `ed ${r} to ${o}.`), 
    t) try {
        await m.unlink(r), p.info("Unlinked " + r);
    } catch (e) {
        p.error(`Failed to unlink ${r}:`, e);
    }
}

export {
    o as Zip_File_Extension,
    w as compressFile,
    z as decompressFile,
    u as runOperation
};