import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";
import { scrollToTheEnd } from "./scrollToTheEnd";

export async function postsScrapper(username: string) {
    puppeteer.use(StealthPlugin());

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });

    await scrollToTheEnd(username, page)

    const linksAndImgSrcs = await page.$$eval('a[href^="/p/"]', links => links.map(a => {
        const img = a.querySelector('img');
        const imgSrc = img ? img.getAttribute('src') : null;
        return {
            link: a.getAttribute('href'),
            imgSrc
        };
    }));

    console.log(linksAndImgSrcs)
    
    //console.log(links)

    //await page.goto(`https://www.instagram.com/p/C0lNjDjB0bB/`, { waitUntil: 'networkidle0' });

    //const likes = await page.$eval('span.xdj266r', span => span.textContent);

    //const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));

    //const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a:any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, '')).filter((href: string) => href !== username), username);

    //console.log(likes)
    //console.log(time)
    //console.log(hrefs)

    const posts: any = [];

    for (let { link, imgSrc } of linksAndImgSrcs) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('span.xdj266r');
        const likes = await page.$eval('span.xdj266r', span => span.textContent);
        await page.waitForSelector('time._aaqe');
        const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));
        await page.waitForSelector('div.xyinxu5 a');
        const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a: any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, ''))
            .filter((href: string) => href !== username), username);
    
            const { locations, brands, audio } = hrefs.reduce((acc, href) => {
                if (href.includes('location')) {
                    const locationParts = href.split('/');
                    const locationName = locationParts.pop();
                    acc.locations.push(locationName);
                } else if (href.includes('audio')) {
                    const audioParts = href.split('/');
                    const audioNumber = audioParts.pop();
                    acc.audio.push(audioNumber);
                } else {
                    if (!acc.brands.includes(href)) {
                        acc.brands.push(href);
                    }
                }
                return acc;
            }, { locations: [], brands: [], audio: [] });

        if (link) {
            const postId = link.split('/')[2]; // Extract the post ID from the link

            posts.push({ 
                id: postId, 
                imgSrc, // Add the imgSrc to the post object
                likes: likes ? parseInt(likes.replace(/,/g, '')) : 0, 
                time: time, 
                brands: brands.length > 0 ? brands : null, 
                locations: locations.length > 0? locations : null, 
                audio: audio.length > 0 ? audio : null
            });
        }
    }
    return posts;
}