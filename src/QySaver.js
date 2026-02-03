let fsPromises = require("node:fs/promises"), path = require("node:path"), logger = require("./QyLogger.js").logger, qyUtils = require("./QyUtils.js"), getDefaultOptions = require("./QyDefaultOptions.js").getDefaultOptions;

class QySaver {
    constructor(e, r) {
        Object.assign(this, {
            dataFolder: e,
            options: {
                ...getDefaultOptions("QySaver"),
                ...r
            }
        });
    }
    setDataFolder(e) {
        return this.dataFolder = e, this;
    }
    processAfterLoad(e) {
        return e;
    }
    processBeforeSave(e) {
        return qyUtils.toBuffer(e);
    }
    async loadFromFile(e, r) {
        var t = path.join(this.dataFolder, e);
        if (null != r && !await qyUtils.folderOrFileExists(t)) return r;
        try {
            var a = await fsPromises.readFile(t);
            return logger.info(`Loading "${t}" succeeded. Total size:${qyUtils.getSizeStr(a.length)}.`), 
            this.processAfterLoad(a, e);
        } catch (e) {
            if (null != r) return r;
            logger.error(`Loading "${t}" failed:`, e);
        }
    }
    async saveToFile(e, t, r = !1) {
        var {
            dataFolder: a,
            options: i
        } = this, s = path.join(a, t);
        if (!r && await qyUtils.folderOrFileExists(s)) logger.error(s + " already exists."); else {
            var {
                retryTimes: o,
                retryIntervalFactor: l,
                maxRetryInterval: n
            } = i, g = path.join(a, ".tmp", t), d = this.processBeforeSave(e, t);
            let r;
            for (let e = 0; e < o; ++e) {
                if (await this._saveTmpFileAndRename(d, g, s)) return !0;
                r = r ? Math.min(n, r * l) : 1, logger.warn(`Retrying to create ${s} in ${r} seconds.`), 
                await qyUtils.sleep(r);
            }
            logger.error(`Failed to create ${t} after retrying ${o} times.`);
        }
        return !1;
    }
    async _saveTmpFileAndRename(e, r, t) {
        var a = e.length;
        if (await this._saveContent(r, e) != a) logger.error(`Creating ${t} failed when trying to create ${r} first.`); else try {
            if (await fsPromises.rename(r, t), await qyUtils.getSize(t) === a) return logger.info(`Renaming ${r} to ${t} succeeded.`), 
            !0;
            logger.error(t + " size is not correct.");
        } catch (e) {
            logger.error(`Renaming ${r} to ${t} failed：`, e);
        }
        return !1;
    }
    async _saveContent(r, e) {
        var t = e.length;
        try {
            await qyUtils.ensureParentDir(r), await fsPromises.writeFile(r, e, {
                flush: !0
            });
            var a = `Saving ${r} size ` + qyUtils.getSizeStr(t), i = await qyUtils.getSize(r);
            return i === t ? logger.info(a + " succeeded.") : logger.warn(a + " failed."), 
            i;
        } catch (e) {
            return logger.error(`Saving "${r}" failed:`, e), !1;
        }
    }
}

Object.assign(module.exports, {
    QySaver: QySaver
});