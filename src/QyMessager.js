let path = require("node:path"), {
    Worker,
    setEnvironmentData
} = require("node:worker_threads"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, logger = require("./QyLogger.js").logger, setPromise = require("./QyUtils.js").setPromise, QyQueue = require("./QyQueue.js").QyQueue;

class QyMessager {
    constructor(e, r, t, s, o = [], i = []) {
        s = {
            ...getDefaultOptions("QyMessager"),
            ...s
        }, Object.assign(this, {
            parent: e,
            workerTypeFileName: r,
            initArgMap: t,
            options: s,
            receiverQueueMap: {}
        });
        for (let r of o) this[r] || (this[r] = (...e) => this.callWorker(r, e));
        for (let r of i) this[r] || (this[r] = (...e) => this.castWorker(r, e));
    }
    start(...e) {
        return this.started = !0, setEnvironmentData("logLevel", logger.level), 
        this._startWorker(), this.callWorker("start", e);
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
        let i = s[e];
        i = i || (s[e] = new QyQueue(o));
        t = setPromise({});
        return i.push(t), t.promise;
    }
    _startWorker() {
        if (!this.worker) {
            let {
                workerTypeFileName: s,
                initArgMap: e,
                receiverQueueMap: o
            } = this;
            var r = {
                workerTypeFileName: s,
                initArgMap: e
            };
            let i = this.worker = new Worker(path.join(__dirname, "QyMessager_Run.js"), {
                workerData: r
            });
            i.on("error", e => {
                logger.error(`Worker ${s} error:`, e);
            }), i.on("message", e => {
                var {
                    opName: r,
                    ack: t,
                    result: s
                } = e;
                r ? (e = e.args || [], (this.parent || this)[r](...e)) : o[t]?.shift().resolve(s);
            }), i.on("exit", e => {
                for (var r in i.removeAllListeners(), 0 != e ? logger.warn(`Worker ${s} stopped with exitCode ` + e) : logger.info(`Worker ${s} stopped.`), 
                o) for (var t = o[r]; !t.isEmpty; ) t.shift()?.resolve();
                this.worker = void 0;
            });
        }
    }
}

Object.assign(module.exports, {
    QyMessager: QyMessager
});