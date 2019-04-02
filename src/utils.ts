import { ApartmentSearch } from "./config";

export function getUrlEncodedPayload(data: { [key: string]: string }) {
    return Object.entries(data).reduce(
        (query, [name, value]) => `${query}${encodeURIComponent(name)}=${encodeURIComponent(value)}&`,
        "",
    );
}

const mapSearchQueryProps: { [key in keyof ApartmentSearch]: string } = {
    priceMin: "topt[8][min]",
    priceMax: "topt[8][max]",
    roomsMin: "topt[1][min]",
    roomsMax: "topt[1][max]",
    squareMin: "topt[3][min]",
    squareMax: "topt[3][max]",
    floorMin: "topt[4][max]",
    floorMax: "topt[4][min]",
}

export function searchToQuery(search: ApartmentSearch): { [key: string]: string } {
    return Object.entries(search).reduce((query, [prop, value]) => {
        if (mapSearchQueryProps[prop]) {
            query[mapSearchQueryProps[prop]] = String(value);
        }
        return query;
    }, {})
}
