import e from "node:crypto";

import t from "node:path";

import n from "node:process";

import a from "node:fs/promises";

import o from "node:fs";

import i from "node:timers/promises";

import {
    fileURLToPath as r
} from "node:url";

var s = t.dirname(r(import.meta.url)), u = Object.fromEntries([ "$del", "$link", "$rpl", "$spec", "$raw", "$all", "$clone", "$ext", "$or", "$and", "$gt", "$lt", "$gte", "$lte" ].map(r => [ r, r ])), f = "%", f = {
    HiddenFolderName: f,
    TriggerDirPath: [ f, "trigger" ],
    RpcDirPath: [ f, "rpc" ],
    IndexDirPath: [ f, "index" ],
    IndexPropPathsFileName: "propPaths"
};

function c(r) {
    return r.startsWith("{") && r.endsWith("}");
}

function l(r) {
    return c(r) && r.substring(1, r.length - 1);
}

function m(r) {
    return 1e12 < r ? Math.round(100 * r / 1e12) / 100 + "TB" : 1e9 < r ? Math.round(100 * r / 1e9) / 100 + "GB" : 1e6 < r ? Math.round(100 * r / 1e6) / 100 + "MB" : 1e3 < r ? Math.round(100 * r / 1e3) / 100 + "KB" : r;
}

let p = 10;

function d(r, t = 10) {
    return e.createHash("sha256").update(r, "utf8").digest("base64url").slice(0, t);
}

var g = 11;

function h(r) {
    return "d" + r;
}

function y(r) {
    return "f" + r;
}

function S(r) {
    return "c" + r;
}

function b(r = 8) {
    return e.randomBytes(r).toString("hex");
}

function v(r) {
    return r[r.length - 1];
}

function $(r) {
    if (null != r) for (var t in r) if (null != r[t]) return !1;
    return !0;
}

function P(r) {
    return null != r && "object" == typeof r && !(r instanceof Date);
}

function M(r) {
    return "string" == typeof r;
}

function x(r) {
    return "number" == typeof r;
}

function N(r) {
    return "boolean" == typeof r;
}

function w(r) {
    return "function" == typeof r;
}

function B(r) {
    var t = typeof r;
    return "string" == t || "number" == t || "boolean" == t || r instanceof Date;
}

function j(r) {
    let t = r.length;
    for (;null == r[t - 1] && 0 < t; ) --t;
    return r.length = t, r;
}

function F(e) {
    return e.promise || (e.promise = new Promise((r, t) => Object.assign(e, {
        resolve: r,
        reject: t
    }))), e;
}

function A(r) {
    return Buffer.isBuffer(r) ? r : Buffer.from(r);
}

function H(r) {
    return 1 < r ? "s" : "";
}

function O(r) {
    return a.mkdir(r, {
        recursive: !0
    });
}

function T(r) {
    return O(t.dirname(r));
}

async function k(r) {
    try {
        return (await a.stat(r)).size;
    } catch (r) {
        return !1;
    }
}

async function K(r) {
    return !1 !== await k(r);
}

function L(r, t) {
    return i.setTimeout(1e3 * r, !0, {
        signal: t
    });
}

let D = void 0;

function E() {
    for (var r of Object.keys(D)) I(r);
}

async function U(t) {
    try {
        await T(t);
        var r = new Date().toISOString() + ": " + n.argv.join(" ");
        await a.writeFile(t, r, {
            flag: "wx",
            flush: !0
        }), logger.info("Locked " + t), D ? D[t] = 1 : (D = {
            [t]: 1
        }, n.on("exit", E), n.on("SIGINT", E));
    } catch (r) {
        throw "EEXIST" == r.code && logger.error(`Already started by ${(await a.readFile(t)).toString()}:`, r), 
        r;
    }
}

function I(r) {
    try {
        o.unlinkSync(r), logger.info("Unlocked " + r);
    } catch (r) {}
}

function _(r) {
    return r.startsWith("[") && r.endsWith("]") ? JSON.parse(r) : r;
}

function R(r) {
    return Array.isArray(r) ? 1 == r.length ? r[0] : JSON.stringify(r) : r;
}

function W(r) {
    r = r.split("/");
    return r[0] || (r[0] = "/"), r;
}

function z(r) {
    return r.split(".");
}

function J(r) {
    return r.join(".");
}

function G(r, t = 0) {
    return Math.floor(Math.random() * (r - t)) + t;
}

function C(r) {
    var t, e = {};
    for (t of r) e[t] = 1;
    return e;
}

async function Q(t, e, n, a) {
    var o = Buffer.allocUnsafe(a);
    for (let r = 0; r < a; ) {
        var i = (await e.read(o, r, a - r, n + r)).bytesRead;
        if (0 == i) return void logger.error(`read ${t} at ${n + r} returning 0 byte`);
        r += i;
    }
    return o;
}

function X() {
    var r = n.availableMemory();
    return Math.round(r / (n.memoryUsage.rss() + r) * 100);
}

export * as default from "./QyUtils.js";

export {
    u as SpecialOperators,
    d as calHash,
    p as Hash_Length,
    g as Hash_Key_Length,
    W as pathSplit,
    c as isMatchName,
    l as getMatchParam,
    x as isNumber,
    M as isString,
    N as isBoolean,
    w as isFunction,
    P as isNotNullObj,
    B as isSimpleType,
    $ as isEmptyObj,
    h as getSubdirMapKey,
    y as getFileMapKey,
    S as getContentKey,
    v as arrayLast,
    b as getRandomStr,
    m as getSizeStr,
    F as setPromise,
    j as trimArrayTail,
    A as toBuffer,
    H as getSuffix,
    L as sleep,
    O as ensureDir,
    T as ensureParentDir,
    k as getSize,
    U as lockExclusiveFilePath,
    I as unlockExclusiveFilePath,
    K as folderOrFileExists,
    f as SpecialFilePaths,
    _ as fromSingleName,
    R as toSingleName,
    G as randomInt,
    z as propNameSplit,
    J as propNameJoin,
    C as listToMap,
    Q as readBufferAsync,
    X as memoryPercent,
    s as __dirname
};