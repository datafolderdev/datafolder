import {
    QyMessager as a
} from "./QyMessager.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class e extends a {
    constructor(a, e, s) {
        super(a, "QyKVDataSaver_Worker.js", {
            kvFolder: e,
            options: s = {
                ...r("QyKVDataSaver"),
                ...s
            }
        }, s, [ "callSave" ], [ "castSave", "releaseSnapshot" ]);
    }
}

export {
    e as QyKVDataSaver
};