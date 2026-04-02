import {
    QyMessager as s
} from "./QyMessager.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class e extends s {
    constructor(s, e) {
        super(s, "QyAclSaver_Worker", e = {
            ...r("QyAclSaver"),
            ...e
        }, e, [ "callSave" ], [ "switch", "castSave" ]);
    }
}

export {
    e as QyAclSaver
};