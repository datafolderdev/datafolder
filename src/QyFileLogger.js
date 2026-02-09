import {
    join as a
} from "node:path";

import {
    setFileConsoleDateDirPath as e,
    closeFileConsole as t
} from "./QyLogger.js";

import {
    ensureDir as i
} from "./QyUtils.js";

import {
    getDefaultOptions as s
} from "./QyDefaultOptions.js";

import {
    QyOpRunner as o
} from "./QyOpRunner.js";

import {
    QyLogFileSaver as r
} from "./QyLogFileSaver.js";

class n extends o {
    constructor(t, e) {
        (e = {
            ...s("QyFileLogger"),
            ...e
        }).append = !e.clearLogAtStart, super(e, [ "stop" ], [ "startFileConsole", "switchFileConsole" ]), 
        Object.assign(this, {
            logFileFolder: t,
            qyLogFileSaver: new r(this, e)
        });
    }
    save(t, e) {
        return this.qyLogFileSaver.save(t, e);
    }
    getDateDirPath() {
        return this.dateDirPath;
    }
    async start() {
        var t = new Date(), t = (this.timeoutRef = setTimeout(this.switch.bind(this), g(t)), 
        this.dateDirPath = h(this, t));
        this.qyLogFileSaver.start(a(t, "change.txt")), await this.startFileConsole(t);
    }
    switch() {
        var t = new Date(), t = (this.timeoutRef = setTimeout(this.switch.bind(this), g(t)), 
        h(this, t));
        return this.dateDirPath != t && (this.dateDirPath = t, this.qyLogFileSaver.switch(a(t, "change.txt")), 
        this.switchFileConsole(t)), this;
    }
    async _op_startFileConsole(t) {
        await i(t), e(t, this.options.clearLogAtStart);
    }
    async _op_stop() {
        clearTimeout(this.timeoutRef), this.timeoutRef = void 0, t(), await this.qyLogFileSaver.stop();
    }
    async _op_switchFileConsole(t) {
        await i(t), e(t, this.options.clearLogAtStart);
    }
}

function h(t, e) {
    var i = e.getUTCFullYear(), s = e.getUTCMonth() + 1, o = e.getUTCDate(), e = e.getUTCHours();
    return a(t.logFileFolder, i.toString(), l(s), l(o), l(e));
}

function l(t) {
    return t.toString().padStart(2, "0");
}

function g(t) {
    return 1e3 * (60 * (60 - t.getUTCMinutes()) - t.getUTCSeconds());
}

export {
    n as QyFileLogger
};