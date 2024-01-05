import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";

export async function getBasicDetails( username: string) {
    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    //
    let instaAccount: any, accountName: any, data: any, category: any, description: any, links: any
    // Wait for the page name element to load
    try {
        await page.waitForSelector('h2', { timeout: 60000 });
        instaAccount = await page.$eval('h2', (h2: any) => h2.textContent || '');
    } catch (e) {
        instaAccount = null;
    }
    // Fetch accountName
    try {
        await page.waitForSelector('div.x9f619.xjbqb8w.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1oa3qoh.x6s0dn4.x78zum5.x1b8z93w.x1amjocr.xl56j7k span', { timeout: 60000 });
        accountName = await page.$eval('div.x9f619.xjbqb8w.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1oa3qoh.x6s0dn4.x78zum5.x1b8z93w.x1amjocr.xl56j7k span', (span: any) => span.textContent || '');

        // Wait for the elements to load
    } catch (err) {
        accountName = null;
    }
    try {
        await page.waitForSelector('ul.x78zum5.x1q0g3np.xieb3on li span._ac2a', { timeout: 60000 });
        data = await page.$$eval('ul.x78zum5.x1q0g3np.xieb3on li span._ac2a', (spans: any) => {
            let posts, followers, following;

            for (let i = 0; i < spans.length; i++) {
                const span = spans[i];
                const text = i === 1 ? span.title : span.textContent || '';

                if (i === 0) {
                    posts = parseInt(text.replace(/,/g, ''),10);
                } else if (i === 1) {
                    followers = parseInt(text.replace(/,/g, ''),10);
                } else if (i === 2) {
                    following = parseInt(text.replace(/,/g, ''),10);
                }
            }

            return { posts, followers, following };
        });

    } catch (err) {
        data = { posts: null, followers: null, following: null };
    }
    try {

        // Wait for the category element to load
        await page.waitForSelector('div._ap3a._aaco._aacu._aacy._aad6._aade', { timeout: 60000 });

        category = await page.$eval('div._ap3a._aaco._aacu._aacy._aad6._aade', (div: any) => div.textContent);
    } catch (e) {
        category = null;
    }
    try {
        // Wait for the description element to load
        await page.waitForSelector('h1._ap3a._aaco._aacu._aacx._aad6._aade', { timeout: 60000 });

        description = await page.$eval('h1._ap3a._aaco._aacu._aacx._aad6._aade', (h1: any) => {
            // Replace the a tag with its text content
            const a = h1.querySelector('a');
            if (a) a.outerHTML = a.textContent || '';

            // Replace the br tag with a full stop
            h1.innerHTML = h1.innerHTML.replace(/<br>/g, '. ');

            // Get the text content
            let text = h1.textContent || '';

            return text;
        });
    } catch (e) {
        description = null
    }
    try {

        // Simulate a click on the div
        let buttonExists = await page.$('button._acan._acao._acas._aj1-._ap30');
        let buttonText = buttonExists ? await page.$eval('button._acan._acao._acas._aj1-._ap30', (button: any) => button.textContent || '') : '';
        let divExists = await page.$('div.x3nfvp2 a');
        let divText = divExists ? await page.$eval('div.x3nfvp2 a', (div: any) => div.textContent || '') : '';


        // Initialize an empty links array
        // Check if the text ends with '+ (something)'
        if (buttonText?.length > 0) {
            if (/\+\s*\d+$/.test(buttonText)) {
                // Simulate a click on the div
                await page.click('button._acan._acao._acas._aj1-._ap30');

                // Wait for the popup to load
                await page.waitForSelector('div[role="dialog"]', { timeout: 60000 });

                // Fetch the links on the popup
                links = await page.$$eval('div[role="dialog"] button', (buttons: any) => {
                    return buttons.map((button: any) => {
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
            }
        } else if (divText?.length > 0) {
            // Remove "Link" text and spaces from divText
            links = [{ context: 'url', urlLink: divText}];
        } else {
            links = [];
        }
    } catch (e) {
        links = [];
    }


    return { instaAccount, accountName, ...data, category, description, links };
}