import {
    QyMessager as e
} from "./QyMessager.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class s extends e {
    constructor(e, s, a) {
        super(e, "QyKVDataCleaner_Worker", {
            kvFolder: s,
            options: a = {
                ...r("QyKVDataCleaner"),
                ...a
            }
        }, a, [], [ "cleanAclFiles", "cleanPMFiles", "cleanVLFiles", "removeSnapshotsFiles" ]);
    }
}

export {
    s as QyKVDataCleaner
};