import s, {
    readFile as a,
    rm as e
} from "node:fs/promises";

import {
    join as f
} from "node:path";

import {
    logger as m
} from "./QyLogger.js";

import {
    toBuffer as r,
    folderOrFileExists as u,
    getSizeStr as o,
    sleep as g,
    getSize as n,
    ensureParentDir as l
} from "./QyUtils.js";

import {
    getDefaultOptions as t
} from "./QyDefaultOptions.js";

class i {
    dataFolder;
    options;
    constructor(e, r) {
        Object.assign(this, {
            dataFolder: e,
            options: {
                ...t("QySaver"),
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
        return r(e);
    }
    async removeFile(r) {
        r = f(this.dataFolder, r);
        try {
            await e(r);
        } catch (e) {
            m.warn(`Deleting ${r} failed:`, e);
        }
    }
    async loadFromFile(r, t) {
        r = f(this.dataFolder, r);
        if (null != t && !await u(r)) return t;
        try {
            var e = await a(r);
            return m.info(`Loading "${r}" succeeded. Total size:${o(e.length)}.`), 
            this.processAfterLoad(e);
        } catch (e) {
            if (null != t) return t;
            m.error(`Loading "${r}" failed:`, e);
        }
    }
    async saveToFile(e, t, r = !1) {
        var {
            dataFolder: a,
            options: i
        } = this, s = f(a, t);
        if (!r && await u(s)) m.error(s + " already exists."); else {
            var {
                retryTimes: o,
                retryIntervalFactor: n,
                maxRetryInterval: l
            } = i, d = f(a, ".tmp", t), c = this.processBeforeSave(e);
            let r;
            for (let e = 0; e < o; ++e) {
                if (await this._saveTmpFileAndRename(c, d, s)) return !0;
                r = r ? Math.min(l, r * n) : 1, m.warn(`Retrying to create ${s} in ${r} seconds.`), 
                await g(r);
            }
            m.error(`Failed to create ${t} after retrying ${o} times.`);
        }
        return !1;
    }
    async _saveTmpFileAndRename(e, r, t) {
        var a = e.length;
        if (await this._saveContent(r, e) != a) m.error(`Creating ${t} failed when trying to create ${r} first.`); else try {
            if (await s.rename(r, t), await n(t) === a) return m.info(`Renaming ${r} to ${t} succeeded.`), 
            !0;
            m.error(t + " size is not correct.");
        } catch (e) {
            m.error(`Renaming ${r} to ${t} failed：`, e);
        }
        return !1;
    }
    async _saveContent(r, e) {
        var t = e.length;
        try {
            await l(r), await s.writeFile(r, e, {
                flush: !0
            });
            var a = `Saving ${r} size ` + o(t), i = await n(r);
            return i === t ? m.info(a + " succeeded.") : m.warn(a + " failed."), 
            i;
        } catch (e) {
            return m.error(`Saving "${r}" failed:`, e), !1;
        }
    }
}

export {
    i as QySaver
};