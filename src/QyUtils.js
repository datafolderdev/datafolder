import n from "node:crypto";

import t from "node:path";

import e from "node:process";

import l from "node:fs/promises";

import o from "node:fs";

import i from "node:timers/promises";

import {
    fileURLToPath as r
} from "node:url";

import {
    logger as u
} from "../src/QyLogger.js";

var a = t.dirname(r(import.meta.url)), f = Object.fromEntries([ "$del", "$link", "$rpl", "$spec", "$raw", "$all", "$clone", "$ext", "$or", "$and", "$gt", "$lt", "$gte", "$lte" ].map(r => [ r, r ])), c = "%", c = {
    HiddenFolderName: c,
    TriggerDirPath: [ c, "trigger" ],
    RpcDirPath: [ c, "rpc" ],
    IndexDirPath: [ c, "index" ],
    IndexPropPathsFileName: "propPaths"
};

function s(r) {
    return r.startsWith("{") && r.endsWith("}");
}

function d(r) {
    return s(r) && r.substring(1, r.length - 1);
}

function m(r) {
    return 1e12 < r ? Math.round(100 * r / 1e12) / 100 + "TB" : 1e9 < r ? Math.round(100 * r / 1e9) / 100 + "GB" : 1e6 < r ? Math.round(100 * r / 1e6) / 100 + "MB" : 1e3 < r ? Math.round(100 * r / 1e3) / 100 + "KB" : r.toString();
}

function p(r, t = 10) {
    return n.createHash("sha256").update(r, "utf8").digest("base64url").slice(0, t);
}

var h = 11;

function g(r) {
    return "d" + r;
}

function y(r) {
    return "f" + r;
}

function v(r) {
    return "c" + r;
}

function b(r = 8) {
    return n.randomBytes(r).toString("hex");
}

function $(r) {
    return r[r.length - 1];
}

function w(r) {
    if (null != r) for (var t in r) if (null != r[t]) return !1;
    return !0;
}

function P(r) {
    return null != r && "object" == typeof r && !(r instanceof Date);
}

function S(r) {
    return "string" == typeof r;
}

function j(r) {
    return "number" == typeof r;
}

function x(r) {
    return "boolean" == typeof r;
}

function B(r) {
    return "function" == typeof r;
}

function M(r) {
    var t = typeof r;
    return "string" == t || "number" == t || "boolean" == t || r instanceof Date;
}

function O(r) {
    let t = r.length;
    for (;null == r[t - 1] && 0 < t; ) --t;
    return r.length = t, r;
}

function T(n) {
    return n.promise || (n.promise = new Promise((r, t) => Object.assign(n, {
        resolve: r,
        reject: t
    }))), n;
}

function k(r) {
    return Buffer.isBuffer(r) ? r : Buffer.from(r);
}

function A(r) {
    return 1 < r ? "s" : "";
}

function D(r) {
    return l.mkdir(r, {
        recursive: !0
    });
}

function F(r) {
    return D(t.dirname(r));
}

async function I(r) {
    try {
        return (await l.stat(r)).size;
    } catch (r) {
        return !1;
    }
}

async function W(r) {
    return !1 !== await I(r);
}

function E(r, t = void 0) {
    r *= 1e3;
    return t ? i.setTimeout(r, !0, {
        signal: t
    }) : i.setTimeout(r);
}

let N;

async function L(t) {
    try {
        await F(t);
        var r = new Date().toISOString() + ": " + e.argv.join(" ");
        function n() {
            for (var r of Object.keys(N)) U(r);
        }
        await l.writeFile(t, r, {
            flag: "wx",
            flush: !0
        }), u.info("Locked " + t), N ? N[t] = 1 : (N = {
            [t]: 1
        }, e.on("exit", n), e.on("SIGINT", n));
    } catch (r) {
        throw "EEXIST" == r.code && u.error(`Already started by ${(await l.readFile(t)).toString()}:`, r), 
        r;
    }
}

function U(r) {
    try {
        o.unlinkSync(r), u.info("Unlocked " + r);
    } catch (r) {}
}

function R(r) {
    return r.startsWith("[") && r.endsWith("]") ? JSON.parse(r) : r;
}

function G(r) {
    return Array.isArray(r) ? 1 == r.length ? r[0] : JSON.stringify(r) : r;
}

function H(r) {
    r = r.split("/");
    return r[0] || (r[0] = "/"), r;
}

function J(r) {
    return r.split(".");
}

function Q(r) {
    return r.join(".");
}

function z(r, t = 0) {
    return Math.floor(Math.random() * (r - t)) + t;
}

function K(r) {
    var t, n = {};
    for (t of r) n[t] = 1;
    return n;
}

async function X(t, n, e, o) {
    var i = Buffer.allocUnsafe(o);
    for (let r = 0; r < o; ) {
        var a = (await n.read(i, r, o - r, e + r)).bytesRead;
        if (0 == a) return void u.error(`read ${t} at ${e + r} returning 0 byte`);
        r += a;
    }
    return i;
}

function q() {
    var r = e.availableMemory();
    return Math.round(r / (e.memoryUsage.rss() + r) * 100);
}

async function* C(e, t = 3) {
    var n = e.length, o = (n < t && (t = n), new Array(n));
    for (let r = 0; r < t; ++r) {
        var i = o[r] = {};
        s(r, i);
    }
    for (let r = 0; r < n; ++r) {
        var a = o[r % t], {
            filePath: u,
            bin: f
        } = (a.bin || await a.promise, a), c = r + t;
        c < n && s(c, a), yield {
            filePath: u,
            bin: f
        };
    }
    async function s(r, t) {
        var r = e[r], n = l.readFile(r);
        Object.assign(t, {
            filePath: r,
            promise: n,
            bin: void 0
        }), t.bin = await n;
    }
}

export * as default from "./QyUtils.js";

export {
    a as __dirname,
    f as SpecialOperators,
    c as SpecialFilePaths,
    s as isMatchName,
    d as getMatchParam,
    m as getSizeStr,
    p as calHash,
    h as Hash_Key_Length,
    g as getSubdirMapKey,
    y as getFileMapKey,
    v as getContentKey,
    b as getRandomStr,
    $ as arrayLast,
    w as isEmptyObj,
    P as isNotNullObj,
    S as isString,
    j as isNumber,
    x as isBoolean,
    B as isFunction,
    M as isSimpleType,
    O as trimArrayTail,
    T as setPromise,
    k as toBuffer,
    A as getSuffix,
    D as ensureDir,
    F as ensureParentDir,
    I as getSize,
    W as folderOrFileExists,
    E as sleep,
    L as lockExclusiveFilePath,
    U as unlockExclusiveFilePath,
    R as fromSingleName,
    G as toSingleName,
    H as pathSplit,
    J as propNameSplit,
    Q as propNameJoin,
    z as randomInt,
    K as listToMap,
    X as readBufferAsync,
    q as memoryPercent,
    C as loadFileList
};