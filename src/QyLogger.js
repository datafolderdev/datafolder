let fs = require("node:fs"), path = require("node:path"), Console = require("node:console").Console, {
    isMainThread,
    threadId
} = require("node:worker_threads"), ThreadMark = isMainThread ? "" : `W${threadId}:`, LOG_LEVEL = {
    Info: 0,
    Debug: 1,
    Warn: 2,
    Error: 3,
    None: 4
}, strToLogLevel = {
    verbose: LOG_LEVEL.Info,
    info: LOG_LEVEL.Info,
    log: LOG_LEVEL.Debug,
    debug: LOG_LEVEL.Debug,
    warn: LOG_LEVEL.Warn,
    error: LOG_LEVEL.Error,
    none: LOG_LEVEL.None
}, logLevelToStr = Object.fromEntries(Object.entries(strToLogLevel).map(([ e, o ]) => [ o, e ])), logger = {
    currentLogLevel: LOG_LEVEL.Debug,
    info: function() {
        logger.currentLogLevel == LOG_LEVEL.Info && writeLog("info", arguments);
    },
    log: function() {
        logger.currentLogLevel <= LOG_LEVEL.Debug && writeLog("log", arguments);
    },
    debug: function() {
        logger.currentLogLevel <= LOG_LEVEL.Debug && writeLog("debug", arguments);
    },
    warn: function() {
        logger.currentLogLevel <= LOG_LEVEL.Warn && writeLog("warn", arguments);
    },
    error: function() {
        logger.currentLogLevel <= LOG_LEVEL.Error && writeLog("error", arguments);
    }
}, fileConsole, stdout, stderr;

function closeFileConsole() {
    fileConsole = void 0, stdout && (stdout.close(), stdout = void 0), stderr && (stderr.close(), 
    stderr = void 0);
}

function setFileConsoleDateDirPath(e, o) {
    closeFileConsole();
    o = {
        flags: o ? "w" : "a",
        flush: !0,
        autoClose: !1
    };
    stdout = fs.createWriteStream(path.join(e, "stdout.txt"), o), stderr = fs.createWriteStream(path.join(e, "stderr.txt"), o), 
    fileConsole = new Console({
        stdout: stdout,
        stderr: stderr,
        inspectOptions: {
            depth: 3,
            colors: !1
        }
    });
}

function writeLog(e, o) {
    var r = new Error().stack.split("\n"), r = `${new Date().toISOString()} ${ThreadMark}${/([^/\\()]+)\)?$/.exec(r[3])[1]}:${e}:`;
    console[e](r, ...o), fileConsole && fileConsole[e](r, ...o);
}

Object.defineProperty(logger, "level", {
    get() {
        return logLevelToStr[logger.currentLogLevel];
    },
    set(e) {
        logger.currentLogLevel = strToLogLevel[e];
    }
}), globalThis.logger = logger, Object.assign(module.exports, {
    logger: logger,
    setFileConsoleDateDirPath: setFileConsoleDateDirPath,
    closeFileConsole: closeFileConsole
});