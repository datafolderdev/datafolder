import type { QyDir } from "./QyDir.ts";
import type { QyCache } from "./QyCache.ts";
export declare class QyItem {
    name: string;
    parentDir: QyDir | undefined;
    flagInt: number;
    constructor(name: string | number, created?: boolean, parentDir?: QyDir);
    get qyCache(): QyCache | undefined;
    get _created(): boolean;
    set _created(val: boolean);
    get subdirMapLoaded(): boolean;
    set subdirMapLoaded(val: boolean);
    get fileMapLoaded(): boolean;
    set fileMapLoaded(val: boolean);
    get fileContentLoaded(): boolean;
    set fileContentLoaded(val: boolean);
    get visited(): boolean;
    set visited(val: boolean);
    get nameNum(): number | string;
    cmp({ nameNum: num2 }: {
        nameNum: any;
    }): 1 | 0 | -1;
    get fullPath(): string;
    get fullPathHash(): string;
    get isItem(): boolean;
    get underHiddenFolder(): boolean;
    get parentList(): QyDir[];
    get parentNamePath(): string[];
    get namePath(): string[];
}
