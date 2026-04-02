export declare const ThreadMark: string;
declare class QyLogger {
    _level: number;
    fileConsole: any;
    stdout: any;
    stderr: any;
    constructor();
    get level(): string;
    set level(val: string);
    info(...args: any[]): void;
    log(...args: any[]): void;
    debug(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    handleOutMsg(msg: any): void;
    handleErrMsg(msg: any): void;
    closeFileConsole(): void;
    setFileConsoleDateDirPath(dateDirPath: string, clearLogAtStart?: boolean): void;
}
export declare const logger: QyLogger;
export {};
