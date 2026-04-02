import { QyItem } from "./QyItem.ts";
import type { QyDir } from "./QyDir.ts";
export declare class QyFile extends QyItem {
    _fileContentKey: any;
    _fileContent: any;
    cChangeId: number;
    constructor(name: string | number, created?: boolean, parentDir?: QyDir);
    get created(): boolean;
    set created(val: boolean);
    get fileContentKey(): any;
    get fileContent(): any;
    set fileContent(x: any);
    get qyIndexPropTree(): any;
    get isFile(): boolean;
    get contentAsText(): any;
    get clonedContent(): any;
    setContent(content: any): void;
    view(spec: string | undefined, noClone: any): any;
    prop(namePath: any, spec: string | undefined, noClone: any): any;
    unloadFileContent(): void;
}
