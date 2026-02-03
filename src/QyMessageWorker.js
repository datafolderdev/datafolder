let parentPort = require("node:worker_threads").parentPort, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, logger = require("./QyLogger.js").logger, QyOpRunner = require("./QyOpRunner.js").QyOpRunner;

class QyMessageWorker extends QyOpRunner {
    constructor(e, r, s) {
        super(e = {
            ...getDefaultOptions("QyMessageWorker"),
            ...e
        }, r, s), parentPort.on("message", async e => {
            var {
                opName: r,
                _cast: s
            } = e;
            if (r) {
                var t = e.args || [];
                try {
                    var a = await this[r](...t);
                    s || parentPort.postMessage({
                        ack: r,
                        result: a
                    }), "stop" == r && process.exit();
                } catch (e) {
                    logger.error(`Running ${r} failed:`, e), s || parentPort.postMessage({
                        ack: r,
                        exception: e
                    });
                }
            } else logger.warn("Msg ignored:", e);
        });
    }
    castParent(e, ...r) {
        parentPort.postMessage({
            opName: e,
            args: r,
            _cast: !0
        });
    }
}

Object.assign(module.exports, {
    QyMessageWorker: QyMessageWorker
});