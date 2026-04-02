import u from "node:fs/promises";

import {
    mergeContent as g,
    mergeContentChanges as i,
    setValByNamePath as a
} from "./QyFileContentUtils.js";

import {
    isEmptyObj as m,
    arrayLast as n
} from "./QyUtils.js";

import {
    logger as d
} from "./QyLogger.js";

function r(r, t) {
    var {
        A: r,
        R: e,
        M: a,
        D: n
    } = r;
    n && delete n[t], t.startsWith("c") ? a && delete a[t] : (r && delete r[t], 
    e && delete e[t]);
}

function t(r, t) {
    var e, a, n, i, {
        D: t,
        A: s,
        R: o,
        M: f
    } = t;
    for (e in t) null != r[e] && (r[e] = void 0);
    for (a in s) {
        var c, l = r[a] || (r[a] = {});
        for (c of s[a]) l[c] = 1;
    }
    for (n in o) {
        var u = r[n];
        if (u) {
            var d = o[n];
            if (d) {
                for (var h of d) delete u[h];
                m(u) && (r[n] = void 0);
            }
        }
    }
    for (i in f) r[i] = g(r[i], f[i]);
}

function e(r, t) {
    var e, {
        D: r,
        A: a,
        R: n,
        M: i
    } = r;
    for (e of [ r, a, n, i ]) for (var s in e) t(s);
}

class s {
    cmdArgAsMapObj = {};
    cmdCount = 0;
    batchSize = 0;
    constructor() {}
    pushCmd(r, t, e = void 0) {
        switch (++this.cmdCount, r) {
          case "A":
            o(this, [ "A", t, e ]), f(this, [ "R", t, e ]);
            break;

          case "R":
            o(this, [ "R", t, e ]), f(this, [ "A", t, e ]);
            break;

          case "D":
            if (o(this, [ "D", t ]), t.startsWith("c")) f(this, [ "M", t ]); else for (var a of [ "A", "R" ]) f(this, [ a, t ]);
            break;

          case "M":
            {
                var n = this.cmdArgAsMapObj;
                let r = n.M;
                n = (r = null == r ? n.M = {} : r)[t];
                r[t] = null != n ? i(n, e) : e;
                break;
            }

          default:
            d.error(`unsupported cmdName:${r}, called with ${t} ` + e), --this.cmdCount;
        }
    }
    pushCmdArgAsListObj(r) {
        if (r) {
            ++this.batchSize;
            var t, e, a, {
                D: n,
                M: i
            } = r;
            for (t in n) this.pushCmd("D", t);
            for (e of [ "A", "R" ]) {
                var s, o = r[e];
                for (s in o) for (var f of o[s]) this.pushCmd(e, s, f);
            }
            for (a in i) this.pushCmd("M", a, i[a]);
        }
        return this;
    }
    takeCmdArgAsListObj() {
        var r, t = this.cmdArgAsMapObj;
        Object.assign(this, {
            cmdArgAsMapObj: {},
            cmdCount: 0,
            batchSize: 0
        });
        for (r of [ "A", "R" ]) {
            var e, a = t[r];
            for (e in a) {
                var n = Object.keys(a[e]);
                0 < n.length ? a[e] = n : delete a[e];
            }
            m(a) && delete t[r];
        }
        var {
            D: i,
            M: s
        } = t;
        return i && m(i) && delete t.D, s && m(s) && delete t.M, t;
    }
    toAclBuffer(r) {
        var t, e = this.batchSize;
        if (0 < e) return r = r, e = e, t = this.takeCmdArgAsListObj(), t = Buffer.from(JSON.stringify(t)), 
        Buffer.concat([ l([ r, e, t.length ]), t ]);
    }
}

function o(r, t, e = 1) {
    a(r.cmdArgAsMapObj, t, e);
}

function f(r, t) {
    let e = r.cmdArgAsMapObj;
    if (e && t && !(t.length <= 1)) {
        for (let r = 0; r < t.length - 1; ++r) if (null == (e = e[t[r]])) return;
        delete e[n(t)];
    }
}

async function c(t, r = !1, e = 0) {
    try {
        return await A(t, await u.readFile(t), r, e);
    } catch (r) {
        throw d.error(`Reading ${t} failed:`, r), r;
    }
}

let v = [ 1, 2, 4, 8 ];

function l(t) {
    var e = t.length, a = new Array(e), n = new Array(e);
    let i = e << 6, s = 1;
    for (let r = 0; r < e; ++r) {
        var o = a[r] = (o = t[r]) <= 255 ? 0 : o <= 65535 ? 1 : o <= 4294967295 ? 2 : 3, o = (i |= o << (r << 1), 
        n[r] = v[o]);
        s += o;
    }
    var f = Buffer.allocUnsafe(s);
    f.writeUInt8(i);
    let c = 1;
    for (let r = 0; r < e; ++r) {
        h = d = u = l = void 0;
        var [ l, u, d, h = 0 ] = [ f, t[r], n[r], c ];
        switch (d) {
          case 1:
            l.writeUInt8(u, h);
            break;

          case 2:
            l.writeUInt16BE(u, h);
            break;

          case 4:
            l.writeUInt32BE(u, h);
            break;

          default:
            l.writeBigUInt64BE(BigInt(u), h);
        }
        c += n[r];
    }
    return f;
}

function h(t, e, a) {
    var n = t.readUInt8(e), i = (++e, n >> 6 & 3);
    for (let r = 0; r < i; ++r) {
        var s = v[n >> (r << 1) & 3];
        a[r] = ((r, t, e = 0) => {
            switch (t) {
              case 1:
                return r.readUInt8(e);

              case 2:
                return r.readUInt16BE(e);

              case 4:
                return r.readUInt32BE(e);

              default:
                return Number(r.readBigUInt64BE(e));
            }
        })(t, s, e), e += s;
    }
    return e;
}

async function A(e, r, a, n) {
    var i = [];
    for (let t = 0; t < r.length; ) {
        var s = [], o = h(r, t, s), [ s, f, c ] = s;
        if (s <= n) d.warn(`changeId ${s} <= currentChangeId ${n} at ${e}:${t}. Ignored.`), 
        t = o + c; else {
            n + f != s && d.warn(`currentChangeId ${n} + batchSize ${f} != changeId ` + s);
            try {
                var l = JSON.parse(r.subarray(o, o + c));
                i.push([ s, l ]), n = s, t = o + c;
            } catch (r) {
                if (d.error(`Parse ${e} failed at ${t}:`, r), a) return d.warn(`Autorepair by truncating ${e} to ` + t), 
                null == (f = await u.truncate(e, t)) ? d.log("truncate success") : d.error("truncate failed:", f), 
                i;
                throw r;
            }
        }
    }
    return i;
}

export {
    r as delCmdKey,
    t as applyAclChange,
    e as iterCmdKeys,
    s as QyAclCmdGenerator,
    c as readAclFile,
    l as numsToBuffer,
    h as bufferToNums,
    A as readAclBuffer
};