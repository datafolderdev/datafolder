import EventEmitter from "node:events";
export declare class QyOpRunner extends EventEmitter {
    running: boolean;
    opQueue: any;
    options: any;
    runningOp: any;
    constructor(options: any, callOpNameList?: any[], castOpNameList?: any[]);
    get firstOp(): any;
    get lastOp(): any;
    finish(): any;
    pushAndRunWithPromise(op: any): any;
    pushAndRun(...ops: any[]): void;
    run(): Promise<void>;
}
