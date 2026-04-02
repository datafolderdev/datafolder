import {
    QyBinWriter as r
} from "./QyBinWriter.js";

import {
    QyAclCmdGenerator as e
} from "./QyAcl.js";

import {
    getDefaultOptions as o
} from "./QyDefaultOptions.js";

class t extends r {
    qyAclCmdGenerator;
    constructor(r, t = void 0) {
        super({
            ...o("QyAclWriter"),
            ...r
        }, t), this.qyAclCmdGenerator = new e();
    }
    getBinData(r, t) {
        var e, o = this.qyAclCmdGenerator;
        for (e of r) o.pushCmdArgAsListObj(e);
        return o.toAclBuffer(t);
    }
}

export {
    t as QyAclWriter
};