import {
    join as s
} from "node:path";

import {
    Worker as p,
    setEnvironmentData as t
} from "node:worker_threads";

import {
    getDefaultOptions as i
} from "./QyDefaultOptions.js";

import {
    logger as n
} from "./QyLogger.js";

import {
    setPromise as l,
    __dirname as m
} from "./QyUtils.js";

import {
    QyQueue as h
} from "./QyQueue.js";

class e {
    constructor(e, r, s, t, o = [], a = []) {
        t = {
            ...i("QyMessager"),
            ...t
        }, Object.assign(this, {
            parent: e,
            workerTypeFileName: r,
            initArgMap: s,
            options: t,
            receiverQueueMap: {}
        });
        for (let r of o) this[r] || (this[r] = (...e) => this.callWorker(r, e));
        for (let r of a) this[r] || (this[r] = (...e) => this.castWorker(r, e));
    }
    start(...e) {
        this.started = !0, t("logLevel", n.level);
        var i = this;
        if (!i.worker) {
            let {
                workerTypeFileName: t,
                initArgMap: e,
                receiverQueueMap: o
            } = i;
            var r = {
                workerTypeFileName: t,
                initArgMap: e
            };
            let a = i.worker = new p(s(m, "QyMessager_Run.js"), {
                workerData: r
            });
            a.on("error", e => {
                n.error(`Worker ${t} error:`, e);
            }), a.on("message", e => {
                var {
                    opName: r,
                    ack: s,
                    result: t
                } = e;
                r ? (e = e.args || [], (i.parent || i)[r](...e)) : o[s]?.shift().resolve(t);
            }), a.on("exit", e => {
                for (var r in a.removeAllListeners(), 0 != e ? n.warn(`Worker ${t} stopped with exitCode ` + e) : n.info(`Worker ${t} stopped.`), 
                o) for (var s = o[r]; !s.isEmpty; ) s.shift()?.resolve();
                i.worker = void 0;
            });
        }
        return this.callWorker("start", e);
    }
    stop(...e) {
        if (this.started) return this.started = !1, this.callWorker("stop", e);
    }
    castWorker(e, r) {
        this.worker.postMessage({
            opName: e,
            args: r,
            _cast: !0
        });
    }
    callWorker(e, r) {
        var {
            worker: s,
            receiverQueueMap: t,
            options: o
        } = this;
        s.postMessage({
            opName: e,
            args: r
        });
        let a = t[e];
        a = a || (t[e] = new h(o));
        s = l({});
        return a.push(s), s.promise;
    }
}

export {
    e as QyMessager
};