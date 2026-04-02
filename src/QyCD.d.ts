import type { QyCache } from "./QyCache.ts";
import type { QyDir } from "./QyDir.ts";
import type { QyFile } from "./QyFile.ts";
export declare class QyCD {
    qyCache: any;
    currentDir: any;
    constructor(qyCache?: QyCache);
    cd(namePath: string | string[] | QyDir, parentDir?: any): this;
    cdP(namePath: string | string[] | QyDir, parentDir?: any): this;
    dir(namePath: string | string[], parentDir?: any): QyDir | undefined;
    dirP(namePath: string | string[], parentDir?: any): QyDir | undefined;
    indexDir(indexHostDirNamePath: string | string[] | QyDir, namePath: string | string[], parentDir?: any): QyDir | undefined;
    indexDirP(indexHostDirNamePath: string | string[] | QyDir, namePath: string | string[], parentDir?: any): QyDir | undefined;
    file(namePath: string | string[], parentDir?: any): QyFile | undefined;
    fileP(namePath: string | string[], parentDir?: any): QyFile | undefined;
    triggerFile(triggerName: any): any;
    get triggerFileList(): any;
    rpcFile(rpcName: any): any;
    get rpcFileList(): any;
    view(namePath: any, spec?: undefined, parentDir?: any): any;
    viewP(namePath: any, spec: any, parentDir?: any): any;
    queryFiles(indexHostDirNamePath: any, queryObj: any, limit: any, cursor: any, parentDir?: any): any;
    queryFilesMulti(indexHostDirNamePathMulti: any, limit: any, cursor: any, parentDir?: any): any;
    queryTree(indexHostDirNamePath: any, queryObj: any, view: any, limit: any, cursor: any, parentDir?: any): {
        tree: any;
        count: any;
    };
    queryTreeMulti(indexHostDirNamePathMulti: any, view: any, limit: any, cursor: any, parentDir?: any): {
        tree: any;
        count: any;
    };
    resetCurrentDir(): void;
    fileListToTree(fileList: any, view: any): {
        tree: any;
        count: any;
    };
}
