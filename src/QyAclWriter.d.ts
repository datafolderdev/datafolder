import { QyBinWriter } from "./QyBinWriter.ts";
export declare class QyAclWriter extends QyBinWriter {
    qyAclCmdGenerator: any;
    constructor(options: any, filePath?: any);
    getBinData(dataQueue: any, changeId: any): any;
}
