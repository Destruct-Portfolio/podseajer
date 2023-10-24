import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());
export default class PuppeteerScrapper {
    $page;
    _browser;
    payload;
    constructor() {
        this.$page = null;
        this._browser = null;
        this.payload = [];
    }
    async _setup() {
        this._browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            protocolTimeout: 240000, // 60 saniye olarak ayarlanmıştır
        });
        this.$page = await this._browser.newPage();
        if (this.$page)
            await this.$page.setViewport({
                height: 1200,
                width: 1500,
            });
    }
    async _cleanup() {
        if (this.$page && this._browser) {
            await this.$page.close();
            this.$page = null;
            await this._browser.close();
            this._browser = null;
        }
    }
    async $exists(selector) {
        return await this.$page.waitForSelector(selector, { timeout: 1000 })
            .then(() => {
            return true;
        })
            .catch((err) => {
            return false;
        });
    }
    async $restart() {
        await this._cleanup();
        await this._setup();
    }
    async $extract() { }
    async exec() {
        await this._setup();
        await this.$extract();
        await this._cleanup();
        return this.payload;
    }
}
