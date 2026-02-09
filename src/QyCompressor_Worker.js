import {
    parentPort as e,
    getEnvironmentData as r,
    workerData as o
} from "node:worker_threads";

import {
    logger as a
} from "./QyLogger.js";

import {
    runOperation as s
} from "./QyCompressor.js";

a.level = r("logLevel"), (async () => {
    try {
        await s(o), e.postMessage(!0);
    } catch (r) {
        e.postMessage(r);
    }
})();