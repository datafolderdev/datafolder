import {
    join as r
} from "node:path";

import {
    ensureDir as e
} from "./QyUtils.js";

import {
    getDefaultOptions as i
} from "./QyDefaultOptions.js";

import {
    QyOpRunner as t
} from "./QyOpRunner.js";

import {
    QyLogFileSaver as s
} from "./QyLogFileSaver.js";

import {
    logger as o
} from "./QyLogger.js";

class a extends t {
    qyLogFileSaver;
    logFileFolder;
    dateDirPath;
    timeoutRef;
    constructor(t, e) {
        (e = {
            ...i("QyFileLogger"),
            ...e
        }).append = !e.clearLogAtStart, super(e, [], [ "startFileConsole", "switchFileConsole" ]), 
        Object.assign(this, {
            logFileFolder: t,
            qyLogFileSaver: new s(this, e)
        });
    }
    save(t, e) {
        return this.qyLogFileSaver.save(t, e);
    }
    getDateDirPath() {
        return this.dateDirPath;
    }
    async _op_start() {
        var t = new Date(), t = (this.timeoutRef = setTimeout(this.switch.bind(this), h(t)), 
        this.dateDirPath = n(this, t));
        this.qyLogFileSaver.start(r(t, "change.txt")), await this.startFileConsole(t);
    }
    switch() {
        var t = new Date(), t = (this.timeoutRef = setTimeout(this.switch.bind(this), h(t)), 
        n(this, t));
        return this.dateDirPath != t && (this.dateDirPath = t, this.qyLogFileSaver.switch(r(t, "change.txt")), 
        this.switchFileConsole(t)), this;
    }
    async _op_startFileConsole(t) {
        await e(t), o.setFileConsoleDateDirPath(t, this.options.clearLogAtStart);
    }
    async _op_stop() {
        this.timeoutRef && (clearTimeout(this.timeoutRef), this.timeoutRef = void 0), 
        o.closeFileConsole(), await this.qyLogFileSaver.stop();
    }
    async _op_switchFileConsole(t) {
        await e(t), o.setFileConsoleDateDirPath(t, this.options.clearLogAtStart);
    }
}

function n(t, e) {
    var i = e.getUTCFullYear(), s = e.getUTCMonth() + 1, o = e.getUTCDate(), e = e.getUTCHours();
    return r(t.logFileFolder, i.toString(), l(s), l(o), l(e));
}

function l(t) {
    return t.toString().padStart(2, "0");
}

function h(t) {
    return 1e3 * (60 * (60 - t.getUTCMinutes()) - t.getUTCSeconds());
}

export {
    a as QyFileLogger
};