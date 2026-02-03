let path = require("node:path"), {
    getEnvironmentData,
    workerData
} = require("node:worker_threads"), logger = require("./QyLogger.js").logger;

(async () => {
    logger.level = getEnvironmentData("logLevel");
    var {
        workerTypeFileName: e,
        initArgMap: r
    } = workerData;
    new (require(path.join(__dirname, e)))(r);
})();