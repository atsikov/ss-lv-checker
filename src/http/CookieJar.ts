export class CookieJar {
    private jar: { [name: string]: string } = {};

    public addRawEntry(rawCookie: string) {
        const cookie = rawCookie.substring(0, rawCookie.indexOf(";"));
        const splitted = cookie.split("=");
        splitted[1] = splitted.slice(1).join("=");

        this.jar[splitted[0]] = splitted[1];
    }

    public getCookieValue(name: string) {
        return this.jar[name];
    }

    public getCookiesString() {
        return Object.entries(this.jar).reduce(
            (cookies, [name, value]) => `${name}=${value}; ${cookies}`,
            "",
        );
    }
}
