import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QyAclSaver_Worker extends QyMessageWorker {
    qyAclWriter: any;
    constructor(options: any);
    _op_start(aclFilePath: any): Promise<void>;
    _op_stop(): Promise<void>;
    switch(aclFilePath: any): void;
    callSave(changeId: any, cmdArgAsListObj: any): Promise<void>;
    castSave(changeId: any, cmdArgAsListObj: any): void;
}
