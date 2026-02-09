import {
    QyMessager as o
} from "./QyMessager.js";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

class s extends o {
    constructor(o, s, t) {
        super(o, "QySnapshotCompactor_Worker.js", {
            kvFolder: s,
            options: t = {
                ...a("QySnapshotCompactor"),
                ...t
            }
        }, t, [], [ "compactSnapshots", "saveSnapshotInfos" ]);
    }
}

export {
    s as QySnapshotCompactor
};