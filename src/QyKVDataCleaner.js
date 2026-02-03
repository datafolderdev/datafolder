let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QyKVDataCleaner extends QyMessager {
    constructor(e, s, a) {
        super(e, "QyKVDataCleaner_Worker.js", {
            kvFolder: s,
            options: a = {
                ...getDefaultOptions("QyKVDataCleaner"),
                ...a
            }
        }, a, [], [ "cleanAclFiles", "cleanPMFiles", "cleanVLFiles", "removeSnapshotsFiles" ]);
    }
}

Object.assign(module.exports, {
    QyKVDataCleaner: QyKVDataCleaner
});