import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";

export async function postsScrapper(username: string) {
    puppeteer.use(StealthPlugin());

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });

    const links = await page.$$eval('a[href^="/p/"]', links => links.map(a => a.getAttribute('href')));
    console.log(links)


    //await page.goto(`https://www.instagram.com${links[0]}`, { waitUntil: 'networkidle0' });

    //const likes = await page.$eval('span.xdj266r', span => span.textContent);

    const posts: any = {};

    for (let link of links) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
        const likes = await page.$eval('span.xdj266r', span => span.textContent);
        if (link) {
            const postId = link.split('/')[2]; // Extract the post ID from the link

            posts[postId] = { likes: likes };
        }
    }

    console.log(posts)
    // Wait for the posts to load
}