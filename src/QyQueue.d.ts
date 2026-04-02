export declare class QyQueue {
    options: any;
    queue: any[];
    firstIdx: number;
    _waterMark: number;
    constructor(options: any);
    get first(): any;
    get last(): any;
    get isEmpty(): boolean;
    get waterMark(): number;
    pop(): any;
    reset(): void;
    push(...args: any[]): void;
    shift(): any;
}
