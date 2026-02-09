import {
    QyMessager as s
} from "./QyMessager.js";

import {
    getDefaultOptions as a
} from "./QyDefaultOptions.js";

class e extends s {
    constructor(s, e) {
        super(s, "QyAclSaver_Worker.js", e = {
            ...a("QyAclSaver"),
            ...e
        }, e, [ "callSave" ], [ "switch", "castSave" ]);
    }
}

export {
    e as QyAclSaver
};