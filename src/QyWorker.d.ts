import { Worker } from "node:worker_threads";
export declare function runOnceWithWorker(workerJsFilePath: any, workerData: any): {
    worker: Worker;
    promise: any;
};
