export declare class QyMessager {
    started: any;
    worker: any;
    receiverQueueMap: any;
    options: any;
    constructor(parent: any, workerTypeFileName: any, initArgMap: any, options: any, callOpNameList?: any[], castOpNameList?: any[]);
    start(...args: any[]): any;
    stop(...args: any[]): any;
    castWorker(opName: any, args: any): void;
    callWorker(opName: any, args: any): any;
}
