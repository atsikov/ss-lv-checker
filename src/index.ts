import axios from "axios";
import { CookieJar } from "./http/CookieJar";
import { getAdsUrls, getFullUrl } from "./http/http";
import { syncUrls } from "./storage";
import { StorageMongoDb } from "./storage/StorageMongoDb";
import { StorageJsonFile } from "./storage/StorageJsonFile";
import { Config } from "./config";

const config = require("../settings.json") as Config;

const FETCH_INTERVAL = (config.queryIntervalSec || 600) * 1000;

const storage = config.storage === "mongo"
    ? new StorageMongoDb(config.storageUri)
    : new StorageJsonFile(config.storageUri);
const cookieJar = new CookieJar();

(async function getNewUrls() {
    // console.log(new Date().toTimeString());
    
    const urls = await getAdsUrls(
        axios.create(),
        cookieJar,
        config.search,
    );
    // console.log(`Found ${urls.length} ads`);

    const newUrls = await syncUrls(storage, urls);
    if (newUrls.length) {
        console.log(`New ads found at ${new Date().toString()}:\n${newUrls.map(url => getFullUrl(url)).join("\n")}`);
    } else {
        // console.log("No new ads found");
    }

    // console.log(`Will run next check at ${new Date(Date.now() + FETCH_INTERVAL).toTimeString()}`);

    setTimeout(getNewUrls, FETCH_INTERVAL);
})();
