export declare class QyKVDataLoader {
    options: any;
    kvFolder: any;
    aclFolder: any;
    snapshotFolder: any;
    qySnapshots: any;
    loadedMaxAclNum: number;
    aclKeyValueMap: any;
    maxChangeId: number;
    constructor(kvFolder: any, options: any);
    load(): Promise<{
        maxChangeId: number;
        loadedMaxAclNum: number;
        qySnapshots: any;
        aclKeyValueMap: any;
    }>;
}
