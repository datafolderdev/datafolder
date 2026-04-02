import {
    QyMessager as e
} from "./QyMessager.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class a extends e {
    constructor(e, a, s) {
        super(e, "QyKVDataSaver_Worker", {
            kvFolder: a,
            options: s = {
                ...r("QyKVDataSaver"),
                ...s
            }
        }, s, [ "callSave" ], [ "castSave", "releaseSnapshot" ]);
    }
}

export {
    a as QyKVDataSaver
};