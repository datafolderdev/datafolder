let fs = require("node:fs"), fsPromises = require("node:fs/promises"), path = require("node:path"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions, {
    Hash_Key_Length,
    folderOrFileExists,
    listToMap,
    isEmptyObj
} = require("./QyUtils.js"), QyBinWriter = require("./QyBinWriter.js").QyBinWriter, {
    bufferToNums,
    numsToBuffer,
    applyAclChange,
    iterCmdKeys
} = require("./QyAcl.js"), QyJsonSaver = require("./QyJsonSaver.js").QyJsonSaver, logger = require("./QyLogger.js").logger, isArray = Array.isArray;

class QySnapshots {
    constructor(t, e) {
        (e = {
            ...getDefaultOptions("QySnapshots"),
            ...e
        }).vLOutdatedPercent = 2 * e.pMOutdatedPercent;
        var a = path.join(t, "info");
        Object.assign(this, {
            snapshotFolder: t,
            snapshotInfoFolder: a,
            options: e,
            qyJsonSaver: new QyJsonSaver(a, e),
            numToSnapshotMap: {},
            keyToSnapshotMap: {},
            fDMap: {},
            prefixMap: {},
            snapshotMaxChangeId: 0,
            maxSnapshotNum: 0,
            snapshotCount: 0
        });
    }
    async loadSnapshotInfos() {
        let {
            snapshotInfoFolder: t,
            qyJsonSaver: o,
            numToSnapshotMap: n
        } = this;
        if (await folderOrFileExists(t)) {
            var e = (await fsPromises.readdir(t)).filter(t => /^[1-9]/.test(t)).map(t => parseInt(t)).sort((t, e) => t - e);
            let r = 0, s = 0;
            await Promise.all(e.map(async t => {
                var e = await o.loadFromFile(t + ".json"), a = n[t] = {
                    snapshotNum: t,
                    info: e,
                    posMap: {},
                    outdatedCount: 0
                };
                ++this.snapshotCount, t > r && (r = t, s = e.maxChangeId), await this._loadPrefixPM(a);
            })), Object.assign(this, {
                maxSnapshotNum: r,
                snapshotMaxChangeId: s
            }), this._setupPrefixMaps(e);
        }
    }
    closeAllFDs() {
        var t, e = this.fDMap;
        for (t in e) fs.close(e[t]), delete e[t];
    }
    saveKeyValueMap(t) {
        var e, {
            keyValueMap: a,
            info: r
        } = t, s = (++r.vLVersion, new QyBinWriter()), o = (s.start(this.getVLFilePath(t)), 
        Object.keys(a).sort()), n = {};
        let i = 0, p = 0;
        for (e of o) {
            var u = a[e];
            let t;
            null == u ? t = Undefined_Mark : (u = Buffer.isBuffer(u) ? u : _valueToBuffer(e, u), 
            u = (s.save(u), u).length, t = [ i, u ], i += u), n[e] = t, ++p;
        }
        return Object.assign(t, {
            posMap: n,
            outdatedCount: 0
        }), Object.assign(r, {
            totalCount: p,
            outdatedCount: 0
        }), Promise.all([ this.savePosMap(t, o), s.stop() ]);
    }
    addMaxSnapshot(t) {
        var e, {
            numToSnapshotMap: a,
            keyToSnapshotMap: r
        } = this, {
            posMap: s,
            keyValueMap: o,
            snapshotNum: n,
            info: i
        } = t, i = i.maxChangeId, i = (Object.assign(this, {
            maxSnapshotNum: n,
            snapshotMaxChangeId: i
        }), o || s);
        for (e in i) r[e] = t;
        a[n] = t, ++this.snapshotCount;
    }
    removeKey(t) {
        var e = this.keyToSnapshotMap, a = e[t];
        if (a) return this.removeKeyFromSnapshot(a, t), delete e[t], !0;
    }
    applyCmdObj(t, e, a) {
        if (null != a) {
            var r = a.length;
            for (let t = 0; t < r; t += 2) {
                var s = a[t], o = a[t + 1];
                e[s] = null != o && _isListKey(s) ? listToMap(o) : o;
            }
        }
        iterCmdKeys(t, t => {
            t in e || (e[t] = this.getValueSync(t)), this.removeKey(t);
        }), applyAclChange(e, t);
    }
    getValueSync(t) {
        var e, a, r = this._getSnapshotByKey(t);
        if (r) return {
            keyValueMap: a,
            posMap: e
        } = r, a ? a[t] : (a = e[t]) && ([ e, a ] = a, 0 != a) ? this._readValFromFile(r, t, e, a) : void 0;
    }
    iterPMBuffer(e, a) {
        var r = e.length;
        for (let t = 0; t < r; ) {
            var s = t + Hash_Key_Length, o = e.toString("latin1", t, s), n = [];
            t = bufferToNums(e, s, n), a(o, n);
        }
    }
    loadPartialPosMapBuffer(a, t, e) {
        let {
            posMap: r,
            prefixPM: s
        } = a, o = (delete s[t], this).keyToSnapshotMap;
        this.iterPMBuffer(e, (t, e) => {
            t in o ? ++a.outdatedCount : (r[t] = e, o[t] = a);
        });
    }
    delSnapshot(t) {
        delete this.numToSnapshotMap[t.snapshotNum], --this.snapshotCount, this._closeFD(this.getVLFilePath(t)), 
        this._closeFD(this.getPMFilePath(t));
    }
    calOutdates() {
        var t, e = [], a = [], r = [], s = [], {
            options: o,
            numToSnapshotMap: n
        } = this, {
            pMOutdatedPercent: i,
            vLOutdatedPercent: p
        } = o;
        for (t in n) {
            var u, h = n[t];
            h.isOut || (100 == (u = _getTotalOutdatedPercent(h)) ? (this.delSnapshot(h), 
            e.push(t)) : p < u ? (this._canCombine(h) ? a : s).push(h) : _getCurrentOutdatedPercent(h) > i ? r.push(h) : this._isSmallSnapshot(h) && this._canCombine(h) && a.push(h));
        }
        return 1 == a.length && _getTotalOutdatedPercent(a[0]) < p && (a.length = 0), 
        0 < r.length && logger.log("pMCompacts:" + r.map(t => t.snapshotNum)), 0 < s.length && logger.log("vLCompacts:" + s.map(t => t.snapshotNum)), 
        0 < a.length && logger.log("combiningSnapshots:" + a.map(t => t.snapshotNum)), 
        {
            emptySnapshotNumList: e,
            combiningSnapshotList: a,
            pMCompactSnapshotList: r,
            vLCompactSnapshotList: s
        };
    }
    getMaxCombinedSnapshot(t) {
        let e, a;
        for (var r of t) {
            var s = r.snapshotNum;
            (!a || a < s) && (e = r, a = s);
        }
        return e;
    }
    getPMFilePath(t) {
        var {
            snapshotNum: t,
            info: e
        } = t;
        return path.join(this.snapshotFolder, "" + t, e.pMVersion + "_pM.txt");
    }
    getVLFilePath(t) {
        var {
            snapshotNum: t,
            info: e
        } = t;
        return path.join(this.snapshotFolder, "" + t, e.vLVersion + "_vL.txt");
    }
    saveSnapshotInfo(t, e) {
        var {
            outdatedCount: a,
            totalCount: r
        } = e;
        return e.outdated = Math.round(100 * a / r) + "%", this.qyJsonSaver.saveToFile(e, t + ".json", !0);
    }
    savePosMap(t, e) {
        var a, {
            outdatedCount: r,
            info: s,
            posMap: o
        } = t, n = (s.outdatedCount += r, t.outdatedCount = 0, ++s.pMVersion, new QyBinWriter()), i = (n.start(this.getPMFilePath(t)), 
        t.prefixPM = {});
        let p = 0, u = 0, h;
        for (a of e = e || Object.keys(o).sort()) {
            null == h ? h = _getPrefix(a) : a.startsWith(h) || (i[h] = [ p, u ], 
            h = _getPrefix(a), p += u, u = 0);
            var l = Buffer.from(a), f = numsToBuffer(o[a]);
            n.save(l), n.save(f), u += l.length + f.length;
        }
        return null != h && (i[h] = [ p, u ]), Promise.all([ n.stop(), this._savePrefixPM(t) ]);
    }
    isEmptySnapshot(t) {
        var {
            info: t,
            outdatedCount: e
        } = t;
        return e + t.outdatedCount == t.totalCount;
    }
    _setupPrefixMaps(t) {
        var e, {
            numToSnapshotMap: a,
            prefixMap: r
        } = this;
        for (e of t) {
            var s, o = a[e], n = o.prefixPM;
            for (s in n) {
                var i = r[s];
                i ? i.push(o) : r[s] = [ o ];
            }
        }
    }
    async _loadPrefixPM(t) {
        var e = this._getPrefixPMFilePath(t), a = (logger.info("Loading " + e), 
        await fsPromises.readFile(e)), r = a.length, s = t.prefixPM = {};
        for (let t = 0; t < r; ) {
            var o = t + Prefix_Length, n = s[a.toString("latin1", t, o)] = [];
            t = bufferToNums(a, o, n);
        }
    }
    _loadPartialPosMap(t, e) {
        var a, {
            posMap: r,
            prefixPM: s
        } = t, s = s[e];
        if (s) return [ s, a ] = s, s = this._readBufferFromFile(this.getPMFilePath(t), s, a), 
        this.loadPartialPosMapBuffer(t, e, s), r;
    }
    _getSnapshotByKey(t) {
        var {
            keyToSnapshotMap: e,
            prefixMap: a
        } = this;
        let r = e[t];
        if (r) return r;
        var s = _getPrefix(t), o = a[s];
        if (o) for (;0 < o.length; ) {
            r = o.pop();
            var n = this._loadPartialPosMap(r, s);
            if (n && t in n) return r;
        }
    }
    _readValFromFile(t, e, a, r) {
        t = this.getVLFilePath(t), t = this._readBufferFromFile(t, a, r);
        if (t) return _parseBuffer(e, t);
    }
    _readBufferFromFile(e, a, r) {
        var s = this._getFD(e), o = Buffer.allocUnsafe(r);
        for (let t = 0; t < r; ) {
            var n = fs.readSync(s, o, t, r - t, a + t);
            if (0 == n) return void logger.error(`readSync ${e} at ${a + t} returning 0 byte`);
            t += n;
        }
        return o;
    }
    _canCombine(t) {
        var {
            keyValueMap: e,
            prefixPM: a
        } = t;
        return e || null == a || isEmptyObj(t.prefixPM);
    }
    _isSmallSnapshot(t) {
        return t.info.totalCount < this.options.minSnapshotKeyCount;
    }
    _getPrefixPMFilePath(t) {
        var {
            snapshotNum: t,
            info: e
        } = t;
        return path.join(this.snapshotFolder, "" + t, e.pMVersion + "_prefixPM.txt");
    }
    removeKeyFromSnapshot(t, e) {
        var {
            posMap: a,
            keyValueMap: r
        } = t;
        r && delete r[e], a && delete a[e], ++t.outdatedCount;
    }
    _getFD(e) {
        var t = this.fDMap;
        let a = t[e];
        if (!a) {
            logger.info("Opening " + e);
            try {
                a = t[e] = fs.openSync(e, "r");
            } catch (t) {
                throw logger.error(`Opening ${e} failed:`, t), t;
            }
        }
        return a;
    }
    _closeFD(t) {
        var e = this.fDMap, a = e[t];
        null != a && (fs.close(a), delete e[t]);
    }
    _savePrefixPM(t) {
        var e, a = new QyBinWriter(), r = (a.start(this._getPrefixPMFilePath(t)), 
        t).prefixPM;
        for (e in r) a.save(Buffer.from(e)), a.save(numsToBuffer(r[e]));
        return a.stop();
    }
}

let Undefined_Mark = [ 0, 0 ], Prefix_Length = 3;

function _getPrefix(t) {
    return t.substring(0, Prefix_Length);
}

function _isListKey(t) {
    return !t.startsWith("c");
}

function _valueToBuffer(t, e) {
    return Buffer.from(JSON.stringify(_isListKey(t) && !isArray(e) ? Object.keys(e) : e) + "\n");
}

function _parseBuffer(t, e) {
    e = JSON.parse(e);
    return _isListKey(t) ? listToMap(e) : e;
}

function _getTotalOutdatedPercent(t) {
    var {
        outdatedCount: t,
        info: e
    } = t, a = e.totalCount, t = t + e.outdatedCount;
    return t == a ? 100 : Math.round(t / a * 100);
}

function _getCurrentOutdatedPercent(t) {
    return Math.round(t.outdatedCount / t.info.totalCount * 100);
}

Object.assign(module.exports, {
    QySnapshots: QySnapshots
});