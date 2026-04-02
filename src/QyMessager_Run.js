var t = this && this.__rewriteRelativeImportExtension || function(e, i) {
    return "string" == typeof e && /^\.\.?\//.test(e) ? e.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(e, r, t, o, a) {
        return r ? i ? ".jsx" : ".js" : !t || o && a ? t + o + "." + a.toLowerCase() + "js" : e;
    }) : e;
};

import {
    join as o
} from "node:path";

import {
    getEnvironmentData as a,
    workerData as i
} from "node:worker_threads";

import {
    logger as s,
    ThreadMark as n
} from "./QyLogger.js";

import {
    __dirname as m
} from "./QyUtils.js";

(async () => {
    s.level = a("logLevel");
    var {
        workerTypeFileName: e,
        initArgMap: r
    } = i;
    new (await import(t("file://" + o(m, e)))).default(r), s.log("" + n + e);
})();