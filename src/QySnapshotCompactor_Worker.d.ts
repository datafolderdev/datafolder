import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QySnapshotCompactor_Worker extends QyMessageWorker {
    kvFolder: any;
    snapshotFolder: any;
    qySnapshots: any;
    qyKVDataCleaner: any;
    pMInfoMap: any;
    vLInfoMap: any;
    combinedSnapshotNumVerList: any[];
    constructor({ kvFolder, options }: {
        kvFolder: any;
        options: any;
    });
    _op_start(): void;
    _op_stop(): Promise<void>;
    _op_compactSnapshots(pMCompactSnapshotList: any, vLCompactSnapshotList: any, combiningSnapshotList: any): Promise<void>;
    _op_saveSnapshotInfos(): Promise<void>;
}
