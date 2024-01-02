import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';


export async function loginToInstagram(page:any ,email: string|undefined, password: string|undefined) {
    puppeteer.use(StealthPlugin());
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

    // Type in the email and password
    await page.type('input[name="username"]', email);
    await page.type('input[name="password"]', password);

    // Click the login button
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]'),
    ]);
}

