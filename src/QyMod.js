import d from "node:module";

import {
    logger as s
} from "./QyLogger.js";

function o(e, r, l, o) {
    if (l) try {
        var t = e + "_" + r, g = `_${t}_qydb`, i = `_${t}_logger`, a = (globalThis[g] = o, 
        globalThis[i] = s, new d(r));
        return a._compile(`(function(dataFolder, logger){${l}})(${g},${i});`, t + ".ts"), 
        delete globalThis[g], delete globalThis[i], a.exports;
    } catch (o) {
        s.error("requireFromModCode failed:", e, r, l, o);
    }
}

export {
    o as requireFromModCode
};