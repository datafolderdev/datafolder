import {
    parentPort as o
} from "node:worker_threads";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

import {
    logger as n
} from "./QyLogger.js";

import {
    QyOpRunner as s
} from "./QyOpRunner.js";

class e extends s {
    constructor(s, e = [], r = []) {
        super(s = {
            ...a("QyMessageWorker"),
            ...s
        }, e, r), o?.on("message", async s => {
            var {
                opName: e,
                _cast: r
            } = s;
            if (e) {
                var a = s.args || [];
                try {
                    var t = await this[e](...a);
                    r || o?.postMessage({
                        ack: e,
                        result: t
                    }), "stop" == e && process.exit();
                } catch (s) {
                    n.error(`Running ${e} failed:`, s), r || o?.postMessage({
                        ack: e,
                        exception: s
                    });
                }
            } else n.warn("Msg ignored:", s);
        });
    }
    castParent(s, ...e) {
        o?.postMessage({
            opName: s,
            args: e,
            _cast: !0
        });
    }
}

export {
    e as QyMessageWorker
};