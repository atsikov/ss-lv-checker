export interface DataStorage {
    open(): Promise<void>;
    close(): Promise<void>;
    insertUrls(urls: string[]): Promise<{}>;
    selectAllUrls(): Promise<string[]>;
    deleteUrls(urls: string[]): Promise<{}>;
}
