import {
    extname as i
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
    createWriteStream as p
} from "node:fs";

import m from "node:fs/promises";

import {
    logger as d
} from "./QyLogger.js";

import {
    isNotNullObj as t,
    folderOrFileExists as l,
    ensureParentDir as c
} from "./QyUtils.js";

import {
    runOnceWithWorker as f
} from "./QyWorker.js";

let h = r(e), g = ".gz", w = "QyCompressor_Worker.js";

function o(e, r, o) {
    return t(r) && (o = r, r = void 0), r = r || e + g, o = o || {}, e.endsWith(g) ? (d.log(e + " already ends with .gz."), 
    !1) : r.endsWith(g) ? f(w, {
        operation: "compress",
        srcFilePath: e,
        destFilePath: r,
        options: o
    }).promise : (d.log(r + " doesn't end with .gz."), !1);
}

function u(e, r, o) {
    return e.endsWith(g) ? (t(r) && (o = r, r = void 0), r = r || e.replace(new RegExp(g + "$"), ""), 
    o = o || {}, i(r) == g ? (d.log(r + " already ends with .gz."), !1) : f(w, {
        operation: "decompress",
        srcFilePath: e,
        destFilePath: r,
        options: o
    }).promise) : (d.log(e + " doesn't end with .gz."), !1);
}

async function F({
    operation: e,
    srcFilePath: r,
    destFilePath: o,
    options: i
}) {
    var {
        removeSrcAfterSuccess: i,
        override: t
    } = i;
    if (!await l(r)) throw new Error(r + " doesn't exist.");
    if (!t && await l(o)) throw new Error(o + " already exists.");
    if (await c(o), await h(n(r), ("compress" == e ? s : a)(), p(o)), d.info(e + `ed ${r} to ${o}.`), 
    i) try {
        await m.unlink(r), d.info("Unlinked " + r);
    } catch (e) {
        d.error(`Failed to unlink ${r}:`, e);
    }
}

export {
    g as Zip_File_Extension,
    o as compressFile,
    u as decompressFile,
    F as runOperation
};