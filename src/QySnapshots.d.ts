export declare class QySnapshots {
    snapshotFolder: any;
    snapshotInfoFolder: any;
    options: any;
    qyJsonSaver: any;
    numToSnapshotMap: any;
    keyToSnapshotMap: any;
    fDMap: any;
    prefixMap: any;
    snapshotMaxChangeId: number;
    maxSnapshotNum: number;
    snapshotCount: number;
    constructor(snapshotFolder: any, options: any);
    loadSnapshotInfos(): Promise<void>;
    closeAllFDs(): void;
    saveKeyValueMap(snapshot: any): Promise<[[any, any], any]>;
    addMaxSnapshot(maxSnapshot: any): void;
    removeKey(key: any): true | undefined;
    applyCmdObj(cmdObj: any, aclKeyValueMap: any, syncList: any): void;
    getValueSync(key: any): any;
    loadPartialPosMapBuffer(snapshot: any, prefix: any, buffer: any): void;
    delSnapshot(snapshot: any): void;
    calOutdates(): {
        emptySnapshotNumVerList: any[];
        combiningSnapshotList: any[];
        pMCompactSnapshotList: any[];
        vLCompactSnapshotList: any[];
    };
    getMaxCombinedSnapshot(snapshotList: any): any;
    getPMFilePath(snapshot: any): string;
    getVLFilePath(snapshot: any): string;
    saveSnapshotInfo(snapshotNum: any, info: any): Promise<boolean>;
    savePosMap(snapshot: any, sortedKeyList: any): Promise<[any, any]>;
    isEmptySnapshot(snapshot: any): boolean;
    removeKeyFromSnapshot(snapshot: any, key: any): void;
}
export declare function iterPMBuffer(buffer: any, fun: any): void;
export declare function loadPrefixPMFile(prefixPMFilePath: any): Promise<{}>;
export declare function getInfoFileName(snapshotNum: any, version: any): string;
