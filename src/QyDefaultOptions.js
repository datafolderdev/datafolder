var e = {
    append: !1,
    retryIntervalFactor: 2,
    maxRetryInterval: 60,
    emitSaveEvent: !1,
    maxFileSize: 1 / 0
};

let t = {
    QyBaseWriter: e,
    QyBinWriter: e,
    QyBatch: {
        fileLogLevel: "delta",
        maxHistoryCmdObjCount: 100
    },
    QyKVData: {
        append: !0,
        emitSaveEvent: !0,
        saveSnapshotAtStop: !0,
        autoRepairAclFile: !0,
        snapshotMaxChangeCount: 1e6,
        compactSnapshotsInterval: 6e4,
        bgLoadPosMaps: !0,
        unloadMemInterval: 12e4,
        maxFileCountToUnload: 1e5,
        compactAtStart: !0
    },
    QyCache: {
        dumpStructureAtStart: !1,
        queryAutoCreateIndex: !0,
        preloadFoldersAtStart: !1
    },
    QyFileLogger: {
        clearLogAtStart: !1
    },
    QySaver: {
        retryTimes: 10,
        retryIntervalFactor: 2,
        maxRetryInterval: 60
    },
    QyQueue: {
        maxLenBeforeRecycle: 1e3
    },
    QySnapshots: {
        pMOutdatedPercent: 30,
        minSnapshotKeyCount: 3e3,
        compressValText: !0
    },
    QyKVDataCleaner_Worker: {
        compressRedundantFile: !1
    },
    QySnapshotSaver_Worker: {
        maxInMemSnapshotCount: 3
    }
};

function a(e) {
    return e && t[e] || void 0;
}

export {
    a as getDefaultOptions
};