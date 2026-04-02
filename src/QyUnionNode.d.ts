export declare class QueryCounter {
    limit: any;
    cursor: any;
    added: number;
    count: number;
    encounteredMap: any;
    constructor(limit: any, cursor?: number);
    get isFull(): boolean;
    encounterOne(fileName: any): true | undefined;
    countOne(): true | undefined;
}
export declare class QyQueryNode {
    fileCount: number;
    nodeList: any;
    constructor();
    encounterOne(resultMap: any, fileName: any, queryCounter: any): true | undefined;
}
export declare class QyUnionNode extends QyQueryNode {
    dirMap: any;
    checkedDirMap: any;
    constructor(dir?: undefined);
    containsFile(fileName: any): boolean;
    getFiles(queryCounter: any, resultMap?: {}): Generator<any, void, any>;
    addNode(node: any): void;
    addDir(dir: any): void;
}
