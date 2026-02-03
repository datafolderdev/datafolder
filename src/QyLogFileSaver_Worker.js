let getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, QyBinWriter = require("./QyBinWriter.js").QyBinWriter;

class QyLogFileSaver_Worker extends QyMessageWorker {
    constructor(e) {
        super(e = {
            ...getDefaultOptions("QyLogFileSaver_Worker"),
            ...e
        }), Object.assign(this, {
            qyBinWriter: new QyBinWriter(e)
        });
    }
    async start(e) {
        await this.qyBinWriter.start(e);
    }
    async stop() {
        await this.qyBinWriter.stop();
    }
    async switch(e) {
        await this.qyBinWriter.switch(e);
    }
    save(e, r) {
        this.qyBinWriter.save(e, r);
    }
}

module.exports = QyLogFileSaver_Worker;