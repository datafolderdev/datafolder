import { QyOpRunner } from "./QyOpRunner.ts";
export declare class QyFileLogger extends QyOpRunner {
    qyLogFileSaver: any;
    logFileFolder: any;
    dateDirPath: any;
    timeoutRef: any;
    constructor(logFileFolder: any, options: any);
    save(changeId: any, data: any): any;
    getDateDirPath(): any;
    _op_start(): Promise<void>;
    switch(): this;
    _op_startFileConsole(dateDirPath: any): Promise<void>;
    _op_stop(): Promise<void>;
    _op_switchFileConsole(dateDirPath: any): Promise<void>;
}
