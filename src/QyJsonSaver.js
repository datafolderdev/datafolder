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
    processAfterLoad(e) {
        return JSON.parse(super.processAfterLoad(e));
    }
    processBeforeSave(e) {
        return super.processBeforeSave(JSON.stringify(e));
    }
}

export {
    r as QyJsonSaver
};