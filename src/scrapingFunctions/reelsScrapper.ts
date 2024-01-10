import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";

export async function reelsScrapper(username: string) {
    puppeteer.use(StealthPlugin());

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/reels`, { waitUntil: 'networkidle0' });

    const links = await page.$$eval('a[href^="/reel/"]', links => links.map(a => a.getAttribute('href')));

    const posts = await page.$$eval('div._aaj-', posts => posts.map(post => {
        const stats = Array.from(post.querySelectorAll('ul._abpo li span.xdj266r')).map(li => li.textContent);
        const likes = stats[0];
        const comments = stats[1];
        return { likes, comments };
    }));

    const views = await page.$$eval('div._aaj_ span.xdj266r', spans => spans.map(span => span.textContent));

    let result: any = {};
    for (let i = 0; i < links.length; i++) {
        const id: any = links[i]?.split('/')[2]; // Add null check before accessing the array element
        result[id] = {
            likes: posts[i].likes,
            comments: posts[i].comments,
            views: views[i]
        };
    }


    for (let link of links) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
        const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));
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

            // Update the result object with the time, brands, and locations
            result[postId] = {
                ...result[postId],
                time: time,
                brands: brands,
                locations: locations,
                audio: audio
            };
        }
    }

    console.log(result);
}