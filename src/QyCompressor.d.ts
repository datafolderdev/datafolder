export declare const Zip_File_Extension = ".gz";
export declare function compressFile(srcFilePath: any, destFilePath: any, options: any): any;
export declare function decompressFile(srcFilePath: any, destFilePath: any, options: any): any;
export declare function runOperation({ operation, srcFilePath, destFilePath, options }: {
    operation: any;
    srcFilePath: any;
    destFilePath: any;
    options: any;
}): Promise<void>;
