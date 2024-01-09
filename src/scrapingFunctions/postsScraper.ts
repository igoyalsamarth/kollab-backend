import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";

export async function postsScrapper(username: string) {
    puppeteer.use(StealthPlugin());

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });

    const links = await page.$$eval('a[href^="/p/"]', links => links.map(a => a.getAttribute('href')));
    console.log(links)


    //await page.goto(`https://www.instagram.com/p/C0lNjDjB0bB/`, { waitUntil: 'networkidle0' });

    //const likes = await page.$eval('span.xdj266r', span => span.textContent);

    //const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));

    //const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a:any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, '')).filter((href: string) => href !== username), username);

    const posts: any = {};

    //console.log(likes)
    //console.log(time)
    //console.log(hrefs)

    for (let link of links) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
        const likes = await page.$eval('span.xdj266r', span => span.textContent);
        const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));
        const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a: any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, ''))
            .filter((href: string) => href !== username), username);

        const { locations, brands } = hrefs.reduce((acc, href) => {
            if (href.includes('location')) {
                const locationParts = href.split('/');
                const locationName = locationParts.pop();
                acc.locations.push(locationName);
            } else {
                acc.brands.push(href);
            }
            return acc;
        }, { locations: [], brands: [] });

        if (link) {
            const postId = link.split('/')[2]; // Extract the post ID from the link

            posts[postId] = { likes: likes, time: time, brands: brands, locations: locations };
        }
    }

    console.log(posts)
    // Wait for the posts to load

}