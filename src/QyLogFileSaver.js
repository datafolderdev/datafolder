import {
    QyMessager as e
} from "./QyMessager.js";

import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

class s extends e {
    constructor(e, s) {
        super(e, "QyLogFileSaver_Worker.js", s = {
            ...r("QyLogFileSaver"),
            ...s
        }, s, [ "switch" ], [ "save" ]);
    }
}

export {
    s as QyLogFileSaver
};