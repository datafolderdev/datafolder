import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QySnapshotSaver_Worker extends QyMessageWorker {
    kvFolder: any;
    snapshotFolder: any;
    qySnapshots: any;
    qyKVDataCleaner: any;
    aclKeyValueMap: any;
    snapshotSavedChangeId: number;
    maxChangeId: any;
    constructor({ kvFolder, options }: {
        kvFolder: any;
        options: any;
    });
    _op_start(maxChangeId: any, loadedMaxAclNum: any, aclKeyValueMap: any): void;
    castSave(changeId: any, cmdArgAsListObj: any, syncList: any): void;
    saveSnapshot(maxSnapshotNum: any): Promise<void>;
    releaseSnapshot(snapshotNum: any): void;
    _op_stop(): Promise<number>;
    _op_waitForSnapshotSaved({ saveMaxSnapshotInfoPromise, outdates }: {
        saveMaxSnapshotInfoPromise: any;
        outdates: any;
    }): Promise<void>;
}
