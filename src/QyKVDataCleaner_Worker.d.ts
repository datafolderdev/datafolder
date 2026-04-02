import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QyKVDataCleaner_Worker extends QyMessageWorker {
    kvFolder: any;
    snapshotFolder: any;
    snapshotInfoFolder: any;
    aclFolder: any;
    historyAclFolder: any;
    historySnapshotFolder: any;
    constructor({ kvFolder, options }: {
        kvFolder: any;
        options: any;
    });
    _op_start(): void;
    _op_stop(): void;
    _op_cleanAclFiles(maxSnapshotNum: any): Promise<void>;
    _op_cleanPMFiles(pMChangeList: any): Promise<void>;
    _op_cleanVLFiles(snapshotNum: any, vLVersion: any): Promise<void>;
    _op_removeSnapshotsFiles(snapshotNumVersionList: any): Promise<void>;
}
