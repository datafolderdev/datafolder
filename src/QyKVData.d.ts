export declare class QyKVData {
    kvFolder: any;
    snapshotFolder: any;
    qyCache: any;
    options: any;
    qyKVDataSaver: any;
    qySnapshotCompactor: any;
    qyKVDataCleaner: any;
    compactState: number;
    compactMaxChangeId: number;
    snapshotSavedChangeId: number;
    maxChangeId: number;
    emptySnapshotNumVerList: any[];
    isStopping: boolean;
    qySnapshots: any;
    aclKeyValueMap: any;
    compactInterval: any;
    unloadInterval: any;
    constructor(kvFolder: any, options: any, qyCache: any);
    start(maxChangeId: any, loadedMaxAclNum: any, qySnapshots: any, aclKeyValueMap: any): this;
    stop(): Promise<void>;
    save(changeId: any, cmdArgAsListObj: any, syncList: any, needPromise: any): any;
    increaseChangeId(): number;
    decreaseChangeId(): void;
    getValueSync(key: any): any;
    removeKey(key: any): any;
    onSnapshotSavedChangeId(snapshotSavedChangeId: any, pMOnlySnapshot?: any): void;
    onCompactUpdates(compactUpdates: any): void;
}
