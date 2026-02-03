let path = require("node:path"), {
    setFileConsoleDateDirPath,
    closeFileConsole
} = require("./QyLogger.js"), ensureDir = require("./QyUtils.js").ensureDir, getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, QyOpRunner = require("./QyOpRunner.js").QyOpRunner, QyLogFileSaver = require("./QyLogFileSaver.js").QyLogFileSaver;

class QyFileLogger extends QyOpRunner {
    constructor(e, t) {
        (t = {
            ...getDefaultOptions("QyFileLogger"),
            ...t
        }).append = !t.clearLogAtStart, super(t, [ "stop" ], [ "startFileConsole", "switchFileConsole" ]), 
        Object.assign(this, {
            logFileFolder: e,
            qyLogFileSaver: new QyLogFileSaver(this, t)
        });
    }
    save(e, t) {
        return this.qyLogFileSaver.save(e, t);
    }
    getDateDirPath() {
        return this.dateDirPath;
    }
    async start() {
        var e = new Date(), e = (this.timeoutRef = setTimeout(() => this.switch(), this._getRemainingMilliSeconds(e)), 
        this.dateDirPath = this._genDateDirPath(e));
        this.qyLogFileSaver.start(path.join(e, "change.txt")), await this.startFileConsole(e);
    }
    switch() {
        var e = new Date(), e = (this.timeoutRef = setTimeout(() => this.switch(), this._getRemainingMilliSeconds(e)), 
        this._genDateDirPath(e));
        return this.dateDirPath != e && (this.dateDirPath = e, this.qyLogFileSaver.switch(path.join(e, "change.txt")), 
        this.switchFileConsole(e)), this;
    }
    async _op_startFileConsole(e) {
        await ensureDir(e), setFileConsoleDateDirPath(e, this.options.clearLogAtStart);
    }
    async _op_stop() {
        clearTimeout(this.timeoutRef), this.timeoutRef = void 0, closeFileConsole(), 
        await this.qyLogFileSaver.stop();
    }
    async _op_switchFileConsole(e) {
        await ensureDir(e), setFileConsoleDateDirPath(e, this.options.clearLogAtStart);
    }
    _genDateDirPath(e) {
        var t = e.getUTCFullYear(), i = e.getUTCMonth() + 1, s = e.getUTCDate(), e = e.getUTCHours();
        return path.join(this.logFileFolder, t.toString(), this._patch(i), this._patch(s), this._patch(e));
    }
    _patch(e) {
        return e.toString().padStart(2, "0");
    }
    _getRemainingMilliSeconds(e) {
        return 1e3 * (60 * (60 - e.getUTCMinutes()) - e.getUTCSeconds());
    }
}

Object.assign(module.exports, {
    QyFileLogger: QyFileLogger
});