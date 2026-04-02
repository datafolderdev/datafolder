import {
    QyMessager as s
} from "./QyMessager.js";

import {
    getDefaultOptions as o
} from "./QyDefaultOptions.js";

class e extends s {
    constructor(s, e, a) {
        super(s, "QySnapshotSaver_Worker", {
            kvFolder: e,
            options: a = {
                ...o("QySnapshotSaver"),
                ...a
            }
        }, a, [], [ "saveSnapshot", "castSave", "releaseSnapshot" ]);
    }
}

export {
    e as QySnapshotSaver
};