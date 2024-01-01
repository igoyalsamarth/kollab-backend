import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export async function getBasicDetails(username: string) {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({headless: false});    
    const page = (await browser.pages())[0];
        await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
//
let instaAccount:any
    // Wait for the page name element to load
    try{
    await page.waitForSelector('h2', { timeout: 60000 });

    instaAccount = await page.$eval('h2', (h2) => h2.textContent || '');
    } catch(e) {
        instaAccount = null;
    }
    // Fetch accountName
    let accountName = await page.$eval('div.x9f619.xjbqb8w.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1oa3qoh.x6s0dn4.x78zum5.x1b8z93w.x1amjocr.xl56j7k span', span => span.textContent || '');

    // Wait for the elements to load
    await page.waitForSelector('ul li button', { timeout: 60000 });

    const data = await page.$$eval('ul li button', (buttons) => {
        let posts, followers, following;

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const span = button.querySelector('span');
            const text = button.textContent ? button.textContent.toLowerCase() : '';

            if (text.includes('posts')) {
                posts = span ? span.textContent : null;
            } else if (text.includes('followers')) {
                followers = span ? span.getAttribute('title') : null;
            } else if (text.includes('following')) {
                following = span ? span.textContent : null;
            }
        }

        return {
            posts,
            followers,
            following
        };
    });

    // Wait for the category element to load
    await page.waitForSelector('div._ap3a._aaco._aacu._aacy._aad6._aade', { timeout: 60000 });

    const category = await page.$eval('div._ap3a._aaco._aacu._aacy._aad6._aade', (div) => div.textContent);

    // Wait for the description element to load
    await page.waitForSelector('h1._ap3a._aaco._aacu._aacx._aad6._aade', { timeout: 60000 });

    const description = await page.$eval('h1._ap3a._aaco._aacu._aacx._aad6._aade', (h1) => {
        // Replace the a tag with its text content
        const a = h1.querySelector('a');
        if (a) a.outerHTML = a.textContent || '';

        // Replace the br tag with a full stop
        h1.innerHTML = h1.innerHTML.replace(/<br>/g, '. ');

        // Get the text content
        let text = h1.textContent || '';

        return text;
    });

    // Simulate a click on the div
    let divText = await page.$eval('div.x3nfvp2', div => div.textContent || '');

    // Initialize an empty links array
    let links = [];

    // Check if the text ends with '+ (something)'
    if (/\+\s*\(\w+\)$/.test(divText)) {
        console.log('clicking')
        // Simulate a click on the div
        await page.click('div.x3nfvp2');

        // Wait for the popup to load
        await page.waitForSelector('div[role="dialog"]', { timeout: 60000 });

        // Fetch the links on the popup
        links = await page.$$eval('div[role="dialog"] button', (buttons) => {
            return buttons.map(button => {
                // Find the divs that contain the link description and URL
                let descriptionDiv = button.querySelector('div._ap3a._aacp._adda._aacz._aada._aade');
                let urlDiv = button.querySelector('div._ap3a._aaco._aacu._aacx._aada._aade');

                // Get the text content of the divs
                let description = descriptionDiv ? descriptionDiv.textContent : null;
                let url = urlDiv ? urlDiv.textContent : null;

                // Return the link information
                return { description, url };
            });
        });

        // Remove the first element of the links array
        links.shift();
    } else {
        // Remove "Link" text and spaces from divText
        let url = divText.replace(/Link|\s/g, '');
        links.push({ description: 'URL', url });
    }

    await browser.close();

    return { instaAccount, accountName, ...data, category, description, links };
}