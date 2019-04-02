import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "./CookieJar";
import { getUrlEncodedPayload, searchToQuery } from "../utils";
import { ApartmentSearch } from "../config";

export const domain = "https://www.ss.com";

export function getFullUrl(uriOrUrl: string) {
    return uriOrUrl.match(/^https?\:\/\//)
        ? uriOrUrl
        : uriOrUrl.startsWith("/")
            ? `${domain}${uriOrUrl}`
            : `${domain}/${uriOrUrl}`;
}

export async function getAdsUrls(
    axios: AxiosInstance,
    cookieJar: CookieJar,
    search: ApartmentSearch,
) {
    axios.interceptors.request.use(addRequestCookies(cookieJar));
    axios.interceptors.response.use(
        updateCookiesOnResponse(cookieJar),
        updateCookiesOnError(cookieJar),
    );

    try {
        // set cookies for filter session
        console.log("Run filter query");
        console.log(searchToQuery(search));
        await axios.post(
            getFullUrl(search.url),
            getUrlEncodedPayload(searchToQuery(search)),
            { maxRedirects: 0 }
        );
    } catch (e) { /* expected exception as final http status will be 302, not 200 */ }

    let urls: string[] = [];
    console.log("Get first result page");
    await axios.get(getFullUrl(search.url))
        .then(response => {
            const page = cheerio.load(response.data);
            const links = page("a[name=\"nav_id\"]").toArray()
                .map(el => el.attribs.href)
                .slice(1, -1);
            console.log(`Found ${links.length} more page(s)`);
            urls = urls.concat(getLinksFromPage(page));

            return Promise.all(links
                .map(
                    link => axios
                        .get(getFullUrl(link))
                        .then(response => {
                            const nextPage = cheerio.load(response.data);
                            urls = urls.concat(getLinksFromPage(nextPage));
                        })
                ),
            );
        });

    return urls;
}

function addRequestCookies(cookieJar: CookieJar) {
    return function(request: AxiosRequestConfig) {
        // console.log('Starting Request', request);
        return {
            ...request,
            headers: {
                ...request.headers,
                "cookie": cookieJar.getCookiesString(),
            },
        };
    }
}

function updateCookies(response: AxiosResponse<any>, cookieJar: CookieJar) {
    console.log(response.status);
    console.log(response.headers);
    if (response.headers["set-cookie"]) {
        console.log(response.headers["set-cookie"]);
        response.headers["set-cookie"].forEach(
            cookie => cookieJar.addRawEntry(cookie),
        );
    }
    console.log('Request headers:', response.request._header);
    // console.log('Response headers:', response.headers);
    return response;
};

function updateCookiesOnResponse(cookieJar: CookieJar) {
    return function(response: AxiosResponse) {
        return updateCookies(response, cookieJar);
    }
}

function updateCookiesOnError(cookieJar: CookieJar) {
    return function(error: { response?: AxiosResponse<any> }) {
        if (error.response) {
            updateCookies(error.response, cookieJar);
        }
        return error;
    }
}

function getLinksFromPage(page: CheerioStatic): string[] {
    const urls: string[] = [];
    const tableHeader = page("tr#head_line");
    let tableEntry = tableHeader.next();
    while (tableEntry && tableEntry.find(".d1 a").length) {
        urls.push(tableEntry.find(".d1 a").first().attr().href);
        tableEntry = tableEntry.next();
    }

    return urls;
}