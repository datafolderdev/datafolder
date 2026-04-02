export declare class QyTriggerNode {
    name: any;
    parent: any;
    children: {};
    triggerMap: {};
    constructor(name?: any, parent?: any);
    insertTrigger(triggerName: any, fileNamePath: any, propNamePathList: any, fun: any): void;
    removeTrigger(triggerName: any, fileNamePath: any): boolean;
    get isEmpty(): boolean;
    removeEmptyNodes(): void;
    checkTrigger(file: any, delta: any): void;
}
export declare function updateTriggerNodes(rootDir: any, fileNamePath: any): void;
