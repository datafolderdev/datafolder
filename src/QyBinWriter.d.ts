import { QyOpRunner } from "./QyOpRunner.ts";
export declare class QyBinWriter extends QyOpRunner {
    _filePath: any;
    _totalSavedSize: number;
    fileHandle: any;
    constructor(options?: any, filePath?: any);
    get filePath(): any;
    set filePath(val: any);
    get totalSavedSize(): number;
    set totalSavedSize(val: number);
    save(changeId: any, data: any, needPromise: any): any;
    truncate(): any;
    switch(newFilePath: any): any;
    getBinData(dataQueue: any, changeId?: undefined): any;
    _op_start(filePath: any): Promise<this>;
    _op_stop(): Promise<void>;
    _op_save(changeId: any, dataQueue: any): Promise<void> | undefined;
    _op_truncate(): Promise<void>;
    _op_switch(newFilePath: any): Promise<void>;
}
