let QyBinWriter = require("./QyBinWriter.js").QyBinWriter, QyAclCmdGenerator = require("./QyAcl.js").QyAclCmdGenerator, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyAclWriter extends QyBinWriter {
    constructor(e, r) {
        super({
            ...getDefaultOptions("QyAclWriter"),
            ...e
        }, r), this.qyAclCmdGenerator = new QyAclCmdGenerator();
    }
    _getBinData(e, r) {
        var t, i = this.qyAclCmdGenerator;
        for (t of e) i.pushCmdArgAsListObj(t);
        return i.toAclBuffer(r);
    }
}

Object.assign(module.exports, {
    QyAclWriter: QyAclWriter
});