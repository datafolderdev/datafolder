import { QyOpRunner } from "./QyOpRunner.ts";
export declare class QyMessageWorker extends QyOpRunner {
    constructor(options: any, callOpNameList?: any[], castOpNameList?: any[]);
    castParent(opName: any, ...args: any[]): void;
}
