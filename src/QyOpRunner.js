let EventEmitter = require("node:events"), setPromise = require("./QyUtils.js").setPromise, logger = require("./QyLogger.js").logger, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyQueue = require("./QyQueue.js").QyQueue;

class QyOpRunner extends EventEmitter {
    constructor(e, s = [], t = []) {
        super(), e = {
            ...getDefaultOptions("QyOpRunner"),
            ...e
        }, Object.assign(this, {
            options: e,
            running: !1,
            opQueue: new QyQueue(e)
        }), this._setupOpNames(s, !0), this._setupOpNames(t);
    }
    _setupOpNames(e, i) {
        for (let t of e) {
            let s = "_op_" + t;
            this[t] || (this[t] = i ? (...e) => this.pushAndRunWithPromise({
                opName: t,
                opFunName: s,
                args: e
            }) : (...e) => this.pushAndRun({
                opName: t,
                opFunName: s,
                args: e
            })), this[s] || (this[s] = () => logger.error(`Class method ${s} not implemented.`));
        }
    }
    get firstOp() {
        return this.opQueue.first;
    }
    get lastOp() {
        return this.opQueue.last;
    }
    finish() {
        return this.lastOp?.promise || this.runningOp?.promise;
    }
    pushAndRunWithPromise(e) {
        return setPromise(e), this.pushAndRun(e), e.promise;
    }
    pushAndRun(...e) {
        var s = this.opQueue, t = this.lastOp;
        "_op_stop" === t?.opFunName ? (s.pop(), s.push(...e, t)) : s.push(...e), 
        this.run();
    }
    async run() {
        if (!this.running) {
            this.running = !0;
            for (var e = this.opQueue; !e.isEmpty; ) {
                var s = e.shift(), {
                    opFunName: t,
                    eventName: i,
                    resolve: n,
                    args: r
                } = s;
                if (t) {
                    this.runningOp = s;
                    try {
                        var u = await (r ? this[t](...r) : this[t]());
                        n && n(u), i && this.emit(i, u);
                    } catch (e) {
                        logger.error(`Run ${t} failed:`, e), i && this.emit(i, e);
                    }
                    this.runningOp = void 0;
                } else n && n(), i && this.emit(i);
            }
            this.running = !1;
        }
    }
}

Object.assign(module.exports, {
    QyOpRunner: QyOpRunner
});