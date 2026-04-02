export declare function delCmdKey(cmdArgAsListObj: any, key: string): void;
export declare function applyAclChange(aclKeyValueMap: any, cmdArgAsListObj: any): void;
export declare function iterCmdKeys(cmdArgAsListObj: any, fun: any): void;
export declare class QyAclCmdGenerator {
    cmdArgAsMapObj: {};
    cmdCount: number;
    batchSize: number;
    constructor();
    pushCmd(cmdName: string, cmdHashKey: string, cmdArg?: any): void;
    pushCmdArgAsListObj(cmdArgAsListObj: any): this;
    takeCmdArgAsListObj(): {};
    toAclBuffer(changeId: any): Buffer<ArrayBuffer> | undefined;
}
export declare function readAclFile(aclFilePath: any, autoRepairAclFile?: boolean, currentChangeId?: number): Promise<any[]>;
export declare function numsToBuffer(nums: any): Buffer<ArrayBuffer>;
export declare function bufferToNums(buffer: any, offset: any, nums: any): any;
export declare function readAclBuffer(aclFilePath: any, contentBuffer: any, autoRepairAclFile: any, currentChangeId: any): Promise<any[]>;
