import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { OpenBrowserAndLogin } from "../helpers/openBrowserAndLogin";
import { scrollToTheEnd } from "./scrollToTheEnd";
import axios from 'axios'

export async function reelsScrapper(username: string) {

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

    puppeteer.use(StealthPlugin());

    const page = await OpenBrowserAndLogin()

    await page.goto(`https://www.instagram.com/${username}/reels`, { waitUntil: 'networkidle0' });

    let previousHeight;
    let loadingIndicatorExists = true;
    let linksAndBgImages: any[] = [];

    let postCount = 0;

    while (loadingIndicatorExists) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000)); // Adjust this timeout as needed

        // Fetch data
        const newLinksAndBgImages: any = await page.$$eval('a[href^="/reel/"]', (links, postCount) => links.map((a, index) => {
            const div = a.querySelector('div._aag6');
            const style = div ? div.getAttribute('style') : null;
            const bgImage = index < 8 && style ? style.match(/url\("(.*)"\)/)?.[1] : null; // Set bgImage to null after 8 posts
            return {
                link: a.getAttribute('href'),
                bgImage
            };
        }), postCount); // Pass postCount as an argument to $$eval

        const uniqueNewLinksAndBgImages = newLinksAndBgImages.filter((newItem: any) => !linksAndBgImages.some(existingItem => existingItem.link === newItem.link));

        linksAndBgImages = [...linksAndBgImages, ...uniqueNewLinksAndBgImages];
        postCount += uniqueNewLinksAndBgImages.length; // Update the post count

        let newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) {
            loadingIndicatorExists = false;
            console.log('Reached the end of the page');
        } else {
            try {
                await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 });
            } catch (error) {
                loadingIndicatorExists = false;
                console.log('Scroll height did not increase within 5 seconds');
            }
        }
    }

    for (let item of linksAndBgImages) {
        if (item.bgImage) {
            const response = await axios.get(item.bgImage, { responseType: 'arraybuffer' });
            item.byteaImage = Buffer.from(response.data, 'binary');
            delete item.bgImage;
        }
    }

    const posts = await page.$$eval('div._aaj-', posts => posts.map(post => {
        const stats = Array.from(post.querySelectorAll('ul._abpo li span.xdj266r')).map(li => li.textContent);
        const likes = stats.length > 0 ? stats[0] : null;
        const comments = stats.length > 1 ? stats[1] : null;
        return { likes, comments };
    }));

    const views = await page.$$eval('div._aaj_ span.xdj266r', spans => spans.map(span => span.textContent));

    let result: any[] = [];

    for (let i = 0; i < linksAndBgImages.length; i++) {
        const { link, byteaImage } = linksAndBgImages[i];
        const id: any = link?.split('/')[2]; // Add null check before accessing the array element
        result.push({
            id: id,
            byteaImage,
            likes: posts[i] ? convertKMB(posts[i].likes) : null,
            comments: posts[i] ? convertKMB(posts[i].comments) : null,
            views: posts[i] ? convertKMB(views[i]) : null
        });
    }

    for (let { link, byteaImage } of linksAndBgImages) {
        await page.goto(`https://www.instagram.com${link}`, { waitUntil: 'domcontentloaded' });
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

            // Find the post in the result array and update it
            const postIndex = result.findIndex(post => post.id === postId);
            if (postIndex !== -1) {
                result[postIndex] = {
                    ...result[postIndex],
                    byteaImage,
                    time: time,
                    brands: brands.length > 0 ? brands : null,
                    locations: locations.length > 0 ? locations : null,
                    audio: audio.length > 0 ? audio : null
                };
            }
        }
    }
    return result;
}