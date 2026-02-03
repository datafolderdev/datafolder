let Module = require("node:module"), logger = require("./QyLogger.js").logger;

function requireFromModCode(o, r, d, e) {
    if (d) try {
        var l = o + "_" + r, i = `_${l}_qydb`, u = (globalThis[i] = e, new Module(r));
        return u._compile(`(function(qyDB){${d}})(${i});`, l + ".js"), delete globalThis[i], 
        u.exports;
    } catch (e) {
        logger.error("requireFromModCode failed:", o, r, d, e);
    }
}

Object.assign(module.exports, {
    requireFromModCode: requireFromModCode
});