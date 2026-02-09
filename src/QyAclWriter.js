import {
    QyBinWriter as r
} from "./QyBinWriter.js";

import {
    QyAclCmdGenerator as e
} from "./QyAcl.js";

import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

class t extends r {
    constructor(r, t) {
        super({
            ...s("QyAclWriter"),
            ...r
        }, t), this.qyAclCmdGenerator = new e();
    }
    _getBinData(r, t) {
        var e, s = this.qyAclCmdGenerator;
        for (e of r) s.pushCmdArgAsListObj(e);
        return s.toAclBuffer(t);
    }
}

export {
    t as QyAclWriter
};