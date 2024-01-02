import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export async function postsScrapper(page:any,username:string ) {
    puppeteer.use(StealthPlugin());

    function generatePostSelector(index: number): string {
        return `div:nth-child(${index}) a`;
    }

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });

    const postsSelector = generatePostSelector(1); // Select the first post    
    const captionSelector = 'h1._ap3a._aaco._aacu._aacx._aad7._aade'; // Updated selector for the caption
    const likesSelector = 'section._ae5m._ae5n._ae5o span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs'; // Updated selector for the likes

    try {
        // Wait for the posts to load
        await page.waitForSelector(postsSelector, { timeout: 60000 });
        console.log('found list of posts')

        // Get the first post
        const post = await page.$(postsSelector);

        // Click on the post
        await post.click();

        // Wait for the post detail page to load
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Extract the caption and number of likes
        await page.waitForSelector(captionSelector, { timeout: 60000 });
        const caption = await page.$eval(captionSelector, (el:any) => el.textContent || '');
        const likes = await page.$eval(likesSelector, (el:any) => el.textContent || '');

        console.log(`Post 1:`);
        console.log(`Caption: ${caption}`);
        console.log(`Likes: ${likes}`);
    } catch (err) {
        console.error('Error scraping post:', err);
    }
}