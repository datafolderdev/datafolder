import {
    resolve as a,
    join as o
} from "node:path";

import {
    getEnvironmentData as t,
    workerData as i
} from "node:worker_threads";

import {
    logger as m
} from "./QyLogger.js";

import {
    __dirname as s
} from "./QyUtils.js";

(async () => {
    m.level = t("logLevel");
    var {
        workerTypeFileName: e,
        initArgMap: r
    } = i;
    new (await import("file://" + a(o(s, e)))).default(r);
})();