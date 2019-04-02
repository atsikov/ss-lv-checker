export interface Config {
    storage: "mongo" | "json";
    storageUri?: string;
    queryIntervalSec?: number;
    search: ApartmentSearch;
}

export interface ApartmentSearch {
    url?: string;
    priceMin?: number;
    priceMax?: number;
    roomsMin?: number;
    roomsMax?: number;
    squareMin?: number;
    squareMax?: number;
    floorMin?: number;
    floorMax?: number;
}
