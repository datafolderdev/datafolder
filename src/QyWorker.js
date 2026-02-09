import {
    isAbsolute as a,
    join as m
} from "node:path";

import {
    Worker as l,
    setEnvironmentData as p
} from "node:worker_threads";

import {
    logger as g
} from "./QyLogger.js";

import {
    setPromise as k,
    __dirname as d
} from "./QyUtils.js";

function e(e, r) {
    p("logLevel", g.level);
    var o = r.operation;
    let t = e + " " + o, {
        promise: s,
        resolve: i
    } = (g.info("Starting worker " + t), k({}));
    a(e) || (e = m(d, e));
    o = new l(e, {
        workerData: r
    });
    let n;
    return o.on("message", e => {
        n = !0, i(e);
    }), o.on("error", e => {
        n = !0, i(e);
    }), o.on("exit", e => {
        n ? g.info(`Worker ${t} exited.`) : (g.log(`Worker ${t} stopped with exitCode ` + e), 
        i());
    }), {
        worker: o,
        promise: s
    };
}

export {
    e as runOnceWithWorker
};