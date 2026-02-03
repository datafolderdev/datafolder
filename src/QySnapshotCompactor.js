let QyMessager = require("./QyMessager.js").QyMessager, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QySnapshotCompactor extends QyMessager {
    constructor(s, o, t) {
        super(s, "QySnapshotCompactor_Worker.js", {
            kvFolder: o,
            options: t = {
                ...getDefaultOptions("QySnapshotCompactor"),
                ...t
            }
        }, t, [], [ "compactSnapshots", "saveSnapshotInfos" ]);
    }
}

Object.assign(module.exports, {
    QySnapshotCompactor: QySnapshotCompactor
});