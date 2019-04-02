import { DataStorage } from "./interface";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

interface FileEntry {
    timestamp: number;
    url: string;
}

export class StorageJsonFile implements DataStorage {
    private static fileContents: FileEntry[];

    private filePath: string;
    constructor(filePath: string = "storage.json") {
        this.filePath = resolve(__dirname, "..", "..", filePath);
    }

    open(): Promise<void> {
        return Promise.resolve()
            .then(() => {
                    StorageJsonFile.fileContents = existsSync(this.filePath)
                        ? JSON.parse(
                            readFileSync(this.filePath).toString(),
                        )
                        : [];
            });
    }

    close(): Promise<void> {
        return Promise.resolve()
            .then(() => {
                writeFileSync(
                    this.filePath,
                    JSON.stringify(StorageJsonFile.fileContents, undefined, 2),
                );
            });
    }

    insertUrls(urls: string[]): Promise<{}> {
        return Promise.resolve()
            .then(() => {
                return StorageJsonFile.fileContents.push(
                    ...urls.map(url => ({
                        url: url,
                        timestamp: Date.now(),
                    })),
                );
            });
    }

    selectAllUrls(): Promise<string[]> {
        return Promise.resolve().then(() =>
            StorageJsonFile.fileContents.map(entry => entry.url),
        );
    }

    deleteUrls(urls: string[]): Promise<{}> {
        return Promise.resolve()
            .then(() => {
                return StorageJsonFile.fileContents = StorageJsonFile.fileContents.filter(
                    entry => !urls.some(url => url === entry.url),
                );
            });
    }
}
