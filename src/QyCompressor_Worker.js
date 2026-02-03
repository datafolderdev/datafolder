let {
    parentPort,
    getEnvironmentData,
    workerData
} = require("node:worker_threads"), logger = require("./QyLogger.js").logger, runOperation = require("./QyCompressor.js").runOperation;

logger.level = getEnvironmentData("logLevel"), (async () => {
    try {
        await runOperation(workerData), parentPort.postMessage(!0);
    } catch (e) {
        parentPort.postMessage(e);
    }
})();