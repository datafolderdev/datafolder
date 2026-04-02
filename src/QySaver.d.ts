export declare class QySaver {
    dataFolder: any;
    options: any;
    constructor(dataFolder: any, options: any);
    setDataFolder(dataFolder: any): this;
    processAfterLoad(data: any): any;
    processBeforeSave(data: any): Buffer<any>;
    removeFile(fileName: any): Promise<void>;
    loadFromFile(fileName: any, defaultValue: any): Promise<any>;
    saveToFile(data: any, fileName: any, override?: boolean): Promise<boolean>;
    _saveTmpFileAndRename(contentBuffer: any, tmpFilePath: any, targetFilePath: any): Promise<boolean>;
    _saveContent(filePath: any, contentBuffer: any): Promise<number | false>;
}
