let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyKVDataSaver extends QyMessager {
    constructor(e, a, s) {
        super(e, "QyKVDataSaver_Worker.js", {
            kvFolder: a,
            options: s = {
                ...getDefaultOptions("QyKVDataSaver"),
                ...s
            }
        }, s, [ "callSave" ], [ "castSave", "releaseSnapshot" ]);
    }
}

Object.assign(module.exports, {
    QyKVDataSaver: QyKVDataSaver
});