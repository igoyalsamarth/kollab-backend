import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";
import { scrollToTheEnd } from "./scrollToTheEnd";
import axios from 'axios'

export async function postsScrapper(username: string) {
    puppeteer.use(StealthPlugin());

    function convertKMB(likes: string | null): number | null {
        if (!likes) { return null }
        likes = likes.replace(/,/g, ''); // remove commas
        if (likes.endsWith('B')) {
            return parseFloat(likes.replace('B', '')) * 1000000000;
        } else if (likes.endsWith('M')) {
            return parseFloat(likes.replace('M', '')) * 1000000;
        } else if (likes.endsWith('K')) {
            return parseFloat(likes.replace('K', '')) * 1000;
        } else {
            return parseFloat(likes);
        }
    }

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });
    let previousHeight;
    let loadingIndicatorExists = true;
    let linksAndImgSrcs: any = [];


    let postCount = 0;

    while (loadingIndicatorExists) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 5000)); // Adjust this timeout as needed

        // Fetch data
        const newLinksAndImgSrcs: any = await page.$$eval('a[href^="/p/"]', (links, postCount) => {
            return links.map((a) => {
                const img = a.querySelector('img');
                const imgSrc = postCount < 7 && img ? img.getAttribute('src') : null; // Set imgSrc to null after 6 posts
                postCount++; // Increment the post count
                return {
                    link: a.getAttribute('href'),
                    imgSrc
                };
            });
        }, postCount); // Pass postCount as an argument to $$eval

        const uniqueNewLinksAndImgSrcs = newLinksAndImgSrcs.filter((newItem: any) =>
            !linksAndImgSrcs.some((existingItem: any) => existingItem.link === newItem.link)
        );

        linksAndImgSrcs = [...linksAndImgSrcs, ...uniqueNewLinksAndImgSrcs];
        postCount += uniqueNewLinksAndImgSrcs.length; // Update the post count

        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) {
            loadingIndicatorExists = false;
        } else {
            try {
                await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 });
            } catch (error) {
                loadingIndicatorExists = false;
            }
        }
    }

    for (let item of linksAndImgSrcs) {
        if (item.imgSrc) {
            const response = await axios.get(item.imgSrc, { responseType: 'arraybuffer' });
            item.byteaImage = Buffer.from(response.data, 'binary');
            delete item.imgSrc;
        }
    }

    //console.log(links)

    //await page.goto(`https://www.instagram.com/p/C0lNjDjB0bB/`, { waitUntil: 'networkidle0' });

    //const likes = await page.$eval('span.xdj266r', span => span.textContent);

    //const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));

    //const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a:any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, '')).filter((href: string) => href !== username), username);

    //console.log(likes)
    //console.log(time)
    //console.log(hrefs)

    const posts: any = [];
    let likes;

    for (let { link, byteaImage } of linksAndImgSrcs) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'domcontentloaded' });
        try {
            await page.waitForSelector('a span.xdj266r');
            const likesElement = await page.$('a span.xdj266r');
            likes = likesElement ? await page.evaluate(el => el.innerText, likesElement) : null;
        } catch (error) {
            likes = null;
        }
        console.log(likes)
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
                byteaImage, // Add the imgSrc to the post object
                likes: likes ? convertKMB(likes) : null,
                time: time,
                brands: brands.length > 0 ? brands : null,
                locations: locations.length > 0 ? locations : null,
                audio: audio.length > 0 ? audio : null
            });
        }
    }
    return posts;
}