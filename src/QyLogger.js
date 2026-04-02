import o from "node:fs";

import r from "node:path";

import {
    Console as i
} from "node:console";

import {
    parentPort as n,
    isMainThread as l,
    threadId as e
} from "node:worker_threads";

import {
    Writable as t
} from "node:stream";

let a = l ? "" : `W${e}:`, d = {
    info: 1,
    debug: 2,
    log: 3,
    warn: 4,
    error: 5,
    none: 6
}, s = Object.fromEntries(Object.entries(d).map(([ e, t ]) => [ t, e ]));

class h {
    _level = d.debug;
    fileConsole;
    stdout;
    stderr;
    constructor() {
        var e, t;
        l || (e = this.stdout = p("%o_"), t = this.stderr = p("%e_"), this.fileConsole = new i({
            stdout: e,
            stderr: t,
            inspectOptions: {
                depth: 3,
                colors: !1
            }
        }));
    }
    get level() {
        return s[this._level];
    }
    set level(e) {
        this._level = d[e];
    }
    info(...e) {
        c(this, "info", e);
    }
    log(...e) {
        c(this, "log", e);
    }
    debug(...e) {
        c(this, "debug", e);
    }
    warn(...e) {
        c(this, "warn", e);
    }
    error(...e) {
        c(this, "error", e);
    }
    handleOutMsg(e) {
        l ? u(this.stdout, e) : n?.postMessage(e);
    }
    handleErrMsg(e) {
        l ? u(this.stderr, e) : n?.postMessage(e);
    }
    closeFileConsole() {
        l && (this.fileConsole = void 0, this.stdout && (this.stdout.close(), this.stdout = void 0), 
        this.stderr) && (this.stderr.close(), this.stderr = void 0);
    }
    setFileConsoleDateDirPath(e, t = !1) {
        var s;
        l && (this.closeFileConsole(), t = {
            flags: t ? "w" : "a",
            flush: !0,
            autoClose: !1
        }, s = this.stdout = o.createWriteStream(r.join(e, "stdout.txt"), t), e = this.stderr = o.createWriteStream(r.join(e, "stderr.txt"), t), 
        this.fileConsole = new i({
            stdout: s,
            stderr: e,
            inspectOptions: {
                depth: 3,
                colors: !1
            }
        }));
    }
}

function u(e, t) {
    var s, o;
    e && ({
        chunks: t,
        chunk: s,
        encoding: o
    } = t, t ? e.writev(t) : e.write(s, o));
}

function c(e, t, s) {
    var o;
    e._level <= d[t] && (o = ((o = (o = new Error().stack?.split("\n")) && /([^/\\()]+)\)?$/.exec(o[3] ?? "")) && o[1]) ?? "", 
    o = `${new Date().toISOString()} ${a}${o}:${t}:`, console[t](o, ...s), e.fileConsole) && e.fileConsole[t](o, ...s);
}

function p(o) {
    return new t({
        write(e, t, s) {
            return n?.postMessage({
                opName: o,
                chunk: e,
                encoding: t
            }), s && s(), !0;
        },
        writev(e, t) {
            return n?.postMessage({
                opName: o,
                chunks: e
            }), t && t(), !0;
        }
    });
}

var f = new h();

export {
    a as ThreadMark,
    f as logger
};