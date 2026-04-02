import {
    getDefaultOptions as r
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as t
} from "./QyMessageWorker.js";

import {
    QyBinWriter as s
} from "./QyBinWriter.js";

export default class extends t {
    qyBinWriter;
    constructor(t) {
        super(t = {
            ...r("QyLogFileSaver_Worker"),
            ...t
        }), Object.assign(this, {
            qyBinWriter: new s(t)
        });
    }
    async _op_start(t) {
        await this.qyBinWriter.start(t);
    }
    async _op_stop() {
        await this.qyBinWriter.stop();
    }
    async switch(t) {
        await this.qyBinWriter.switch(t);
    }
    save(t, r) {
        this.qyBinWriter.save(t, r);
    }
}