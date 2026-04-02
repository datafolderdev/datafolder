import {
    join as t,
    extname as e
} from "node:path";

import {
    Worker as p,
    setEnvironmentData as s
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

let k = e(import.meta.filename);

class r {
    started;
    worker;
    receiverQueueMap;
    options;
    constructor(e, r, t, s, o = [], a = []) {
        s = {
            ...i("QyMessager"),
            ...s
        }, r += k, Object.assign(this, {
            parent: e,
            workerTypeFileName: r,
            initArgMap: t,
            options: s,
            receiverQueueMap: {}
        });
        for (let r of o) this[r] || (this[r] = (...e) => this.callWorker(r, e));
        for (let r of a) this[r] || (this[r] = (...e) => this.castWorker(r, e));
    }
    start(...e) {
        this.started = !0, s("logLevel", n.level);
        var i = this;
        if (!i.worker) {
            let {
                workerTypeFileName: s,
                initArgMap: e,
                receiverQueueMap: o
            } = i;
            var r = {
                workerTypeFileName: s,
                initArgMap: e
            };
            let a = i.worker = new p(t(m, "QyMessager_Run" + k), {
                workerData: r
            });
            a.on("error", e => {
                n.error(`Worker ${s} error:`, e);
            }), a.on("message", e => {
                var {
                    opName: r,
                    ack: t,
                    result: s
                } = e;
                r ? "%o_" == r ? n.handleOutMsg(e) : "%e_" == r ? n.handleErrMsg(e) : (e = e.args || [], 
                (i.parent || i)[r](...e)) : o[t]?.shift().resolve(s);
            }), a.on("exit", e => {
                for (var r in a.removeAllListeners(), 0 != e ? n.warn(`Worker ${s} stopped with exitCode ` + e) : n.info(`Worker ${s} stopped.`), 
                o) for (var t = o[r]; !t.isEmpty; ) t.shift()?.resolve();
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
            worker: t,
            receiverQueueMap: s,
            options: o
        } = this;
        t.postMessage({
            opName: e,
            args: r
        });
        let a = s[e];
        a = a || (s[e] = new h(o));
        t = l({});
        return a.push(t), t.promise;
    }
}

export {
    r as QyMessager
};