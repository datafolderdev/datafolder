import {
    QyMessageWorker as t
} from "./QyMessageWorker.js";

import {
    QyAclWriter as s
} from "./QyAclWriter.js";

export default class extends t {
    qyAclWriter;
    constructor(t) {
        super(t), Object.assign(this, {
            options: t,
            qyAclWriter: new s({
                append: !0
            })
        });
    }
    async _op_start(t) {
        await this.qyAclWriter.start(t);
    }
    async _op_stop() {
        await this.qyAclWriter.stop();
    }
    switch(t) {
        this.qyAclWriter.switch(t);
    }
    async callSave(t, s) {
        await this.qyAclWriter.save(t, s, !0);
    }
    castSave(t, s) {
        this.qyAclWriter.save(t, s);
    }
}