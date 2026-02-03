let fsPromises = require("node:fs/promises"), {
    mergeContent,
    mergeContentChanges,
    setValByNamePath
} = require("./QyFileContentUtils.js"), {
    isEmptyObj,
    arrayLast
} = require("./QyUtils.js"), logger = require("./QyLogger.js").logger;

function delCmdKey(e, r) {
    var {
        A: e,
        R: t,
        M: a,
        D: n
    } = e;
    n && delete n[r], r.startsWith("c") ? a && delete a[r] : (e && delete e[r], 
    t && delete t[r]);
}

function applyAclChange(e, r) {
    var t, a, n, s, {
        D: r,
        A: i,
        R: o,
        M: l
    } = r;
    for (t in r) null != e[t] && (e[t] = void 0);
    for (a in i) {
        var f, u = e[a] || (e[a] = {});
        for (f of i[a]) u[f] = 1;
    }
    for (n in o) {
        var d = e[n];
        if (d) {
            var c = o[n];
            if (c) {
                for (var m of c) delete d[m];
                isEmptyObj(d) && (e[n] = void 0);
            }
        }
    }
    for (s in l) e[s] = mergeContent(e[s], l[s]);
}

function iterCmdKeys(e, r) {
    var t, {
        D: e,
        A: a,
        R: n,
        M: s
    } = e;
    for (t of [ e, a, n, s ]) for (var i in t) r(i);
}

class QyAclCmdGenerator {
    constructor() {
        Object.assign(this, {
            cmdArgAsMapObj: {},
            cmdCount: 0,
            batchSize: 0
        });
    }
    pushCmd(e, r, t) {
        switch (++this.cmdCount, e) {
          case "A":
            this._setCmdByNamePath([ "A", r, t ]), this._delCmdByNamePath([ "R", r, t ]);
            break;

          case "R":
            this._setCmdByNamePath([ "R", r, t ]), this._delCmdByNamePath([ "A", r, t ]);
            break;

          case "D":
            if (this._setCmdByNamePath([ "D", r ]), r.startsWith("c")) this._delCmdByNamePath([ "M", r ]); else for (var a of [ "A", "R" ]) this._delCmdByNamePath([ a, r ]);
            break;

          case "M":
            {
                var n = this.cmdArgAsMapObj;
                let e = n.M;
                n = (e = null == e ? n.M = {} : e)[r];
                e[r] = null != n ? mergeContentChanges(n, t) : t;
                break;
            }

          default:
            logger.error(`unsupported cmdName:${e}, called with ${r} ` + t), --this.cmdCount;
        }
    }
    pushCmdArgAsListObj(e) {
        if (e) {
            ++this.batchSize;
            var r, t, a, {
                D: n,
                M: s
            } = e;
            for (r in n) this.pushCmd("D", r);
            for (t of [ "A", "R" ]) {
                var i, o = e[t];
                for (i in o) for (var l of o[i]) this.pushCmd(t, i, l);
            }
            for (a in s) this.pushCmd("M", a, s[a]);
        }
        return this;
    }
    takeCmdArgAsListObj() {
        var e, r = this.cmdArgAsMapObj;
        Object.assign(this, {
            cmdArgAsMapObj: {},
            cmdCount: 0,
            batchSize: 0
        });
        for (e of [ "A", "R" ]) {
            var t, a = r[e];
            for (t in a) {
                var n = Object.keys(a[t]);
                0 < n.length ? a[t] = n : delete a[t];
            }
            isEmptyObj(a) && delete r[e];
        }
        var {
            D: s,
            M: i
        } = r;
        return s && isEmptyObj(s) && delete r.D, i && isEmptyObj(i) && delete r.M, 
        r;
    }
    toAclBuffer(e) {
        var r = this.batchSize;
        if (0 < r) return _toAclBuffer(e, r, this.takeCmdArgAsListObj());
    }
    _setCmdByNamePath(e, r = 1) {
        setValByNamePath(this.cmdArgAsMapObj, e, r);
    }
    _delCmdByNamePath(r) {
        let t = this.cmdArgAsMapObj;
        if (t && r && !(r.length <= 1)) {
            for (let e = 0; e < r.length - 1; ++e) if (null == (t = t[r[e]])) return;
            delete t[arrayLast(r)];
        }
    }
}

async function readAclFile(r, e = !1, t = 0) {
    try {
        return await readAclBuffer(r, await fsPromises.readFile(r), e, t);
    } catch (e) {
        throw logger.error(`Reading ${r} failed:`, e), e;
    }
}

let ByteCountList = [ 1, 2, 4, 8 ];

function numsToBuffer(r) {
    var t = r.length, a = new Array(t), n = new Array(t);
    let s = t << 6, i = 1;
    for (let e = 0; e < t; ++e) {
        var o = a[e] = _getByteCountType(r[e]), o = (s |= o << (e << 1), n[e] = ByteCountList[o]);
        i += o;
    }
    var l = Buffer.allocUnsafe(i);
    l.writeUInt8(s);
    let f = 1;
    for (let e = 0; e < t; ++e) _writeNum(l, r[e], n[e], f), f += n[e];
    return l;
}

function bufferToNums(r, t, a) {
    var n = r.readUInt8(t), s = (++t, n >> 6 & 3);
    for (let e = 0; e < s; ++e) {
        var i = ByteCountList[n >> (e << 1) & 3];
        a[e] = _readNum(r, i, t), t += i;
    }
    return t;
}

function _toAclBuffer(e, r, t) {
    t = Buffer.from(JSON.stringify(t) + "\n");
    return Buffer.concat([ numsToBuffer([ e, r, t.length ]), t ]);
}

async function readAclBuffer(t, e, a, n) {
    var s = [];
    for (let r = 0; r < e.length; ) {
        var i = [], o = bufferToNums(e, r, i), [ i, l, f ] = i;
        if (i <= n) logger.warn(`changeId ${i} <= currentChangeId ${n} at ${t}:${r}. Ignored.`), 
        r = o + f; else {
            n + l != i && logger.warn(`currentChangeId ${n} + batchSize ${l} != changeId ` + i);
            try {
                var u = JSON.parse(e.subarray(o, o + f));
                s.push([ i, u ]), n = i, r = o + f;
            } catch (e) {
                if (logger.error(`Parse ${t} failed at ${r}:`, e), a) return logger.warn(`Autorepair by truncating ${t} to ` + r), 
                null == (l = await fsPromises.truncate(t, r)) ? logger.log("truncate success") : logger.error("truncate failed:", l), 
                s;
                throw e;
            }
        }
    }
    return s;
}

function _writeNum(e, r, t, a = 0) {
    switch (t) {
      case 1:
        e.writeUInt8(r, a);
        break;

      case 2:
        e.writeUInt16BE(r, a);
        break;

      case 4:
        e.writeUInt32BE(r, a);
        break;

      default:
        e.writeBigUInt64BE(BigInt(r), a);
    }
}

function _readNum(e, r, t = 0) {
    switch (r) {
      case 1:
        return e.readUInt8(t);

      case 2:
        return e.readUInt16BE(t);

      case 4:
        return e.readUInt32BE(t);

      default:
        return Number(e.readBigUInt64BE(t));
    }
}

function _getByteCountType(e) {
    return e <= 255 ? 0 : e <= 65535 ? 1 : e <= 4294967295 ? 2 : 3;
}

Object.assign(module.exports, {
    QyAclCmdGenerator: QyAclCmdGenerator,
    applyAclChange: applyAclChange,
    iterCmdKeys: iterCmdKeys,
    readAclFile: readAclFile,
    readAclBuffer: readAclBuffer,
    numsToBuffer: numsToBuffer,
    bufferToNums: bufferToNums,
    delCmdKey: delCmdKey
});