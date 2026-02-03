let QyMessageWorker = require("./QyMessageWorker.js").QyMessageWorker, QyAclWriter = require("./QyAclWriter.js").QyAclWriter;

class QyAclSaver_Worker extends QyMessageWorker {
    constructor(r) {
        super(r), Object.assign(this, {
            options: r,
            qyAclWriter: new QyAclWriter({
                append: !0
            })
        });
    }
    async start(r) {
        await this.qyAclWriter.start(r);
    }
    async stop() {
        await this.qyAclWriter.stop();
    }
    switch(r) {
        this.qyAclWriter.switch(r);
    }
    async callSave(r, e) {
        await this.qyAclWriter.save(r, e, !0);
    }
    castSave(r, e) {
        this.qyAclWriter.save(r, e);
    }
}

module.exports = QyAclSaver_Worker;