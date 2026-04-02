import {
    isAbsolute as n,
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
    setPromise as d,
    __dirname as f
} from "./QyUtils.js";

function e(e, o) {
    p("logLevel", g.level);
    var r = o.operation;
    let t = e + " " + r, {
        promise: s,
        resolve: i
    } = (g.info("Starting worker " + t), d({}));
    n(e) || (e = m(f, e));
    r = new l(e, {
        workerData: o
    });
    let a;
    return r.on("message", e => {
        a = !0, i(e);
    }), r.on("error", e => {
        a = !0, i(e);
    }), r.on("exit", e => {
        a ? g.info(`Worker ${t} exited.`) : (g.log(`Worker ${t} stopped with exitCode ` + e), 
        i());
    }), {
        worker: r,
        promise: s
    };
}

export {
    e as runOnceWithWorker
};