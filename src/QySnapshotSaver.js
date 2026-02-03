let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QySnapshotSaver extends QyMessager {
    constructor(e, s, a) {
        super(e, "QySnapshotSaver_Worker.js", {
            kvFolder: s,
            options: a = {
                ...getDefaultOptions("QySnapshotSaver"),
                ...a
            }
        }, a, [], [ "saveSnapshot", "castSave", "releaseSnapshot" ]);
    }
}

Object.assign(module.exports, {
    QySnapshotSaver: QySnapshotSaver
});