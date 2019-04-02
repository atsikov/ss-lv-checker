import { DataStorage } from "./interface";

export async function syncUrls(storage: DataStorage, urls: string[]): Promise<string[]> {
    await storage.open();

    const savedUrls = await storage.selectAllUrls();

    const newUrls = urls.filter(url => !savedUrls.some(savedUrl => savedUrl === url));
    const outdatedUrls = savedUrls.filter(savedUrl => !urls.some(url => url === savedUrl));

    if (newUrls.length) {
        // console.log(`Found ${newUrls.length} new urls`);
        await storage.insertUrls(newUrls);
    }

    if (outdatedUrls.length) {
        // console.log(`Found ${outdatedUrls.length} outdated urls`);
        await storage.deleteUrls(outdatedUrls);
    }

    await storage.close();

    return newUrls;
}
