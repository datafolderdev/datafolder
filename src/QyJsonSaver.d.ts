import { QySaver } from "./QySaver.ts";
export declare class QyJsonSaver extends QySaver {
    constructor(dataFolder: any, options: any);
    processAfterLoad(binData: any): any;
    processBeforeSave(json: any): Buffer<any>;
}
