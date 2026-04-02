export declare function getIndexPropPaths(queryObj: any): any[] | undefined;
export declare function calDifferenceList(indexPropDir: any, indexPropPath: any, fileName: any, oldValue: any, newValue: any, rawContent: any): {
    toAddFileList: any[];
    toDelFileList: any[];
} | undefined;
export declare function parseNamePathAndQuery(indexHostDirNamePath: any, parentDir: any, indexPropPaths: any, queryObj: any, resultList: any, queryCounter: any): void;
