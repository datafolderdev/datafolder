import u from "node:fs/promises";

import {
    mergeContent as m,
    mergeContentChanges as n,
    setValByNamePath as a
} from "./QyFileContentUtils.js";

import {
    isEmptyObj as g,
    arrayLast as s
} from "./QyUtils.js";

import {
    logger as d
} from "./QyLogger.js";

function r(r, e) {
    var {
        A: r,
        R: t,
        M: a,
        D: s
    } = r;
    s && delete s[e], e.startsWith("c") ? a && delete a[e] : (r && delete r[e], 
    t && delete t[e]);
}

function e(r, e) {
    var t, a, s, n, {
        D: e,
        A: i,
        R: o,
        M: f
    } = e;
    for (t in e) null != r[t] && (r[t] = void 0);
    for (a in i) {
        var c, l = r[a] || (r[a] = {});
        for (c of i[a]) l[c] = 1;
    }
    for (s in o) {
        var u = r[s];
        if (u) {
            var d = o[s];
            if (d) {
                for (var h of d) delete u[h];
                g(u) && (r[s] = void 0);
            }
        }
    }
    for (n in f) r[n] = m(r[n], f[n]);
}

function t(r, e) {
    var t, {
        D: r,
        A: a,
        R: s,
        M: n
    } = r;
    for (t of [ r, a, s, n ]) for (var i in t) e(i);
}

class i {
    constructor() {
        Object.assign(this, {
            cmdArgAsMapObj: {},
            cmdCount: 0,
            batchSize: 0
        });
    }
    pushCmd(r, e, t) {
        switch (++this.cmdCount, r) {
          case "A":
            o(this, [ "A", e, t ]), f(this, [ "R", e, t ]);
            break;

          case "R":
            o(this, [ "R", e, t ]), f(this, [ "A", e, t ]);
            break;

          case "D":
            if (o(this, [ "D", e ]), e.startsWith("c")) f(this, [ "M", e ]); else for (var a of [ "A", "R" ]) f(this, [ a, e ]);
            break;

          case "M":
            {
                var s = this.cmdArgAsMapObj;
                let r = s.M;
                s = (r = null == r ? s.M = {} : r)[e];
                r[e] = null != s ? n(s, t) : t;
                break;
            }

          default:
            d.error(`unsupported cmdName:${r}, called with ${e} ` + t), --this.cmdCount;
        }
    }
    pushCmdArgAsListObj(r) {
        if (r) {
            ++this.batchSize;
            var e, t, a, {
                D: s,
                M: n
            } = r;
            for (e in s) this.pushCmd("D", e);
            for (t of [ "A", "R" ]) {
                var i, o = r[t];
                for (i in o) for (var f of o[i]) this.pushCmd(t, i, f);
            }
            for (a in n) this.pushCmd("M", a, n[a]);
        }
        return this;
    }
    takeCmdArgAsListObj() {
        var r, e = this.cmdArgAsMapObj;
        Object.assign(this, {
            cmdArgAsMapObj: {},
            cmdCount: 0,
            batchSize: 0
        });
        for (r of [ "A", "R" ]) {
            var t, a = e[r];
            for (t in a) {
                var s = Object.keys(a[t]);
                0 < s.length ? a[t] = s : delete a[t];
            }
            g(a) && delete e[r];
        }
        var {
            D: n,
            M: i
        } = e;
        return n && g(n) && delete e.D, i && g(i) && delete e.M, e;
    }
    toAclBuffer(r) {
        var e, t = this.batchSize;
        if (0 < t) return r = r, t = t, e = this.takeCmdArgAsListObj(), e = Buffer.from(JSON.stringify(e)), 
        Buffer.concat([ l([ r, t, e.length ]), e ]);
    }
}

function o(r, e, t = 1) {
    a(r.cmdArgAsMapObj, e, t);
}

function f(r, e) {
    let t = r.cmdArgAsMapObj;
    if (t && e && !(e.length <= 1)) {
        for (let r = 0; r < e.length - 1; ++r) if (null == (t = t[e[r]])) return;
        delete t[s(e)];
    }
}

async function c(e, r = !1, t = 0) {
    try {
        return await v(e, await u.readFile(e), r, t);
    } catch (r) {
        throw d.error(`Reading ${e} failed:`, r), r;
    }
}

let A = [ 1, 2, 4, 8 ];

function l(e) {
    var t = e.length, a = new Array(t), s = new Array(t);
    let n = t << 6, i = 1;
    for (let r = 0; r < t; ++r) {
        var o = a[r] = (o = e[r]) <= 255 ? 0 : o <= 65535 ? 1 : o <= 4294967295 ? 2 : 3, o = (n |= o << (r << 1), 
        s[r] = A[o]);
        i += o;
    }
    var f = Buffer.allocUnsafe(i);
    f.writeUInt8(n);
    let c = 1;
    for (let r = 0; r < t; ++r) {
        h = d = u = l = void 0;
        var [ l, u, d, h = 0 ] = [ f, e[r], s[r], c ];
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
        c += s[r];
    }
    return f;
}

function h(e, t, a) {
    var s = e.readUInt8(t), n = (++t, s >> 6 & 3);
    for (let r = 0; r < n; ++r) {
        var i = A[s >> (r << 1) & 3];
        a[r] = ((r, e, t = 0) => {
            switch (e) {
              case 1:
                return r.readUInt8(t);

              case 2:
                return r.readUInt16BE(t);

              case 4:
                return r.readUInt32BE(t);

              default:
                return Number(r.readBigUInt64BE(t));
            }
        })(e, i, t), t += i;
    }
    return t;
}

async function v(t, r, a, s) {
    var n = [];
    for (let e = 0; e < r.length; ) {
        var i = [], o = h(r, e, i), [ i, f, c ] = i;
        if (i <= s) d.warn(`changeId ${i} <= currentChangeId ${s} at ${t}:${e}. Ignored.`), 
        e = o + c; else {
            s + f != i && d.warn(`currentChangeId ${s} + batchSize ${f} != changeId ` + i);
            try {
                var l = JSON.parse(r.subarray(o, o + c));
                n.push([ i, l ]), s = i, e = o + c;
            } catch (r) {
                if (d.error(`Parse ${t} failed at ${e}:`, r), a) return d.warn(`Autorepair by truncating ${t} to ` + e), 
                null == (f = await u.truncate(t, e)) ? d.log("truncate success") : d.error("truncate failed:", f), 
                n;
                throw r;
            }
        }
    }
    return n;
}

export {
    i as QyAclCmdGenerator,
    e as applyAclChange,
    t as iterCmdKeys,
    c as readAclFile,
    v as readAclBuffer,
    l as numsToBuffer,
    h as bufferToNums,
    r as delCmdKey
};