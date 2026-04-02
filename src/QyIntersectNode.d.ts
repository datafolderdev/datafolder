import { QyQueryNode } from "./QyUnionNode.ts";
export declare class QyIntersectNode extends QyQueryNode {
    sorted: boolean;
    constructor();
    containsFile(fileName: any): any;
    getFiles(queryCounter: any, resultMap?: {}): Generator<any, void, unknown>;
    addNode(node: any): void;
}
