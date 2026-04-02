export declare function mergeContent(oldContent: any, newContent: any): any;
export declare function mergeContentChanges(oldChanges: any, newChanges: any): any;
export declare function mergeContentAndGenDelta(oldContent: any, newContent: any): {
    merged: any;
    delta: any;
};
export declare function setValByNamePath(rootObj: any, namePath: any, value: any): any;
export declare function getValByNamePath(obj: any, namePath: any): any;
export declare function cleanContent(obj: any, shouldCleanMark?: boolean, strict?: boolean): any;
export declare function objToDelMarks(obj: any): any;
