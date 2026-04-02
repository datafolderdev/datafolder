import { QyMessageWorker } from "./QyMessageWorker.ts";
export default class QyLogFileSaver_Worker extends QyMessageWorker {
    qyBinWriter: any;
    constructor(options: any);
    _op_start(logFilePath: any): Promise<void>;
    _op_stop(): Promise<void>;
    switch(logFilePath: any): Promise<void>;
    save(changeId: any, data: any): void;
}
