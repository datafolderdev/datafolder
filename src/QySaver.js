import s, {
    readFile as i
} from "node:fs/promises";

import {
    join as c
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

class e {
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
    async loadFromFile(e, r) {
        var t = c(this.dataFolder, e);
        if (null != r && !await u(t)) return r;
        try {
            var a = await i(t);
            return m.info(`Loading "${t}" succeeded. Total size:${o(a.length)}.`), 
            this.processAfterLoad(a, e);
        } catch (e) {
            if (null != r) return r;
            m.error(`Loading "${t}" failed:`, e);
        }
    }
    async saveToFile(e, t, r = !1) {
        var {
            dataFolder: a,
            options: i
        } = this, s = c(a, t);
        if (!r && await u(s)) m.error(s + " already exists."); else {
            var {
                retryTimes: o,
                retryIntervalFactor: n,
                maxRetryInterval: l
            } = i, d = c(a, ".tmp", t), f = this.processBeforeSave(e, t);
            let r;
            for (let e = 0; e < o; ++e) {
                if (await this._saveTmpFileAndRename(f, d, s)) return !0;
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
    e as QySaver
};