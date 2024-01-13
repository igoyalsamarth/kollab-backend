import { loginToInstagram } from "../scrapingFunctions/loginFunction";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export async function OpenBrowserAndLogin() {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ headless: false });
    const page = (await browser.pages())[0];
    await loginToInstagram(page, process.env.USER_EMAIL, process.env.USER_PASSWORD);
    return page;
}