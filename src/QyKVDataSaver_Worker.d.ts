import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QyKVDataSaver_Worker extends QyMessageWorker {
    kvFolder: any;
    aclFolder: any;
    qyAclSaver: any;
    qySnapshotSaver: any;
    isStopping: any;
    currentAclNum: any;
    maxChangeId: any;
    snapshotMaxChangeId: any;
    isSavingSnapshot: any;
    saveSnapshotResolve: any;
    constructor({ kvFolder, options }: {
        kvFolder: any;
        options: any;
    });
    _op_start(maxChangeId: any, maxSnapshotNum: any, loadedMaxAclNum: any, aclKeyValueMap: any): void;
    _op_stop(): Promise<any>;
    callSave(changeId: any, cmdArgAsListObj: any, syncList: any): any;
    castSave(changeId: any, cmdArgAsListObj: any, syncList: any): any;
    releaseSnapshot(snapshotNum: any): void;
    onSnapshotSavedChangeId(snapshotSavedChangeId: any, pMOnlySnapshot: any): void;
}
