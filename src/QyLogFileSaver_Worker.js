import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

import {
    QyMessageWorker as t
} from "./QyMessageWorker.js";

import {
    QyBinWriter as r
} from "./QyBinWriter.js";

class i extends t {
    constructor(t) {
        super(t = {
            ...s("QyLogFileSaver_Worker"),
            ...t
        }), Object.assign(this, {
            qyBinWriter: new r(t)
        });
    }
    async start(t) {
        await this.qyBinWriter.start(t);
    }
    async stop() {
        await this.qyBinWriter.stop();
    }
    async switch(t) {
        await this.qyBinWriter.switch(t);
    }
    save(t, s) {
        this.qyBinWriter.save(t, s);
    }
}

export default i;