let path = require("node:path"), {
    Worker,
    setEnvironmentData
} = require("node:worker_threads"), logger = require("./QyLogger.js").logger, setPromise = require("./QyUtils.js").setPromise;

function runOnceWithWorker(e, r) {
    setEnvironmentData("logLevel", logger.level);
    var o = r.operation;
    let t = e + " " + o, {
        promise: i,
        resolve: n
    } = (logger.info("Starting worker " + t), setPromise({}));
    path.isAbsolute(e) || (e = path.join(__dirname, e));
    o = new Worker(e, {
        workerData: r
    });
    let s;
    return o.on("message", e => {
        s = !0, n(e);
    }), o.on("error", e => {
        s = !0, n(e);
    }), o.on("exit", e => {
        s ? logger.info(`Worker ${t} exited.`) : (logger.log(`Worker ${t} stopped with exitCode ` + e), 
        n());
    }), {
        worker: o,
        promise: i
    };
}

Object.assign(module.exports, {
    runOnceWithWorker: runOnceWithWorker
});