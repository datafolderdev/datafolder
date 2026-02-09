import m from "node:module";

import {
    logger as a
} from "./QyLogger.js";

function o(r, e, i, o) {
    if (i) try {
        var t = r + "_" + e, d = `_${t}_qydb`, l = (globalThis[d] = o, new m(e));
        return l._compile(`(function(qyDB){${i}})(${d});`, t + ".js"), delete globalThis[d], 
        l.exports;
    } catch (o) {
        a.error("requireFromModCode failed:", r, e, i, o);
    }
}

export {
    o as requireFromModCode
};