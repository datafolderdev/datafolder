import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

import {
    QySaver as e
} from "./QySaver.js";

class r extends e {
    constructor(e, r) {
        super(e, {
            ...s("QyJsonSaver"),
            ...r
        });
    }
    processAfterLoad(e, r) {
        return JSON.parse(super.processAfterLoad(e, r));
    }
    processBeforeSave(e, r) {
        return super.processBeforeSave(JSON.stringify(e), r);
    }
}

export {
    r as QyJsonSaver
};