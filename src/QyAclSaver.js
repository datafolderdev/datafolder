let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyAclSaver extends QyMessager {
    constructor(e, s) {
        super(e, "QyAclSaver_Worker.js", s = {
            ...getDefaultOptions("QyAclSaver"),
            ...s
        }, s, [ "callSave" ], [ "switch", "castSave" ]);
    }
}

Object.assign(module.exports, {
    QyAclSaver: QyAclSaver
});