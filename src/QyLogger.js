import r from "node:fs";

import n from "node:path";

import {
    Console as t
} from "node:console";

import {
    isMainThread as e,
    threadId as o
} from "node:worker_threads";

let i = e ? "" : `W${o}:`, s = {
    Info: 0,
    Debug: 1,
    Warn: 2,
    Error: 3,
    None: 4
}, l = {
    verbose: s.Info,
    info: s.Info,
    log: s.Debug,
    debug: s.Debug,
    warn: s.Warn,
    error: s.Error,
    none: s.None
}, a = Object.fromEntries(Object.entries(l).map(([ e, o ]) => [ o, e ])), c = {
    currentLogLevel: s.Debug,
    info: function() {
        c.currentLogLevel == s.Info && b("info", arguments);
    },
    log: function() {
        c.currentLogLevel <= s.Debug && b("log", arguments);
    },
    debug: function() {
        c.currentLogLevel <= s.Debug && b("debug", arguments);
    },
    warn: function() {
        c.currentLogLevel <= s.Warn && b("warn", arguments);
    },
    error: function() {
        c.currentLogLevel <= s.Error && b("error", arguments);
    }
}, u, g, f;

function d() {
    u = void 0, g && (g.close(), g = void 0), f && (f.close(), f = void 0);
}

function L(e, o) {
    d();
    o = {
        flags: o ? "w" : "a",
        flush: !0,
        autoClose: !1
    };
    g = r.createWriteStream(n.join(e, "stdout.txt"), o), f = r.createWriteStream(n.join(e, "stderr.txt"), o), 
    u = new t({
        stdout: g,
        stderr: f,
        inspectOptions: {
            depth: 3,
            colors: !1
        }
    });
}

function b(e, o) {
    var r = new Error().stack.split("\n"), r = `${new Date().toISOString()} ${i}${/([^/\\()]+)\)?$/.exec(r[3])[1]}:${e}:`;
    console[e](r, ...o), u && u[e](r, ...o);
}

Object.defineProperty(c, "level", {
    get() {
        return a[c.currentLogLevel];
    },
    set(e) {
        c.currentLogLevel = l[e];
    }
}), globalThis.logger = c;

export {
    c as logger,
    L as setFileConsoleDateDirPath,
    d as closeFileConsole
};