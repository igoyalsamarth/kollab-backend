"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsScrapper = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const openBrowserAndLogin_1 = require("../helpers/openBrowserAndLogin");
function postsScrapper(username) {
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        const page = yield (0, openBrowserAndLogin_1.OpenBrowserAndLogin)();
        yield page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });
        const links = yield page.$$eval('a[href^="/p/"]', links => links.map(a => a.getAttribute('href')));
        console.log(links);
        //await page.goto(`https://www.instagram.com/p/C0lNjDjB0bB/`, { waitUntil: 'networkidle0' });
        //const likes = await page.$eval('span.xdj266r', span => span.textContent);
        //const time = await page.$eval('time._aaqe', time => time.getAttribute('datetime'));
        //const hrefs = await page.$$eval('div.xyinxu5 a', (links, username) => links.map((a:any) => a.getAttribute('href').trim().replace(/^\/|\/$/g, '')).filter((href: string) => href !== username), username);
        const posts = {};
        //console.log(likes)
        //console.log(time)
        //console.log(hrefs)
        for (let link of links) {
            yield page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
            const likes = yield page.$eval('span.xdj266r', span => span.textContent);
            const time = yield page.$eval('time._aaqe', time => time.getAttribute('datetime'));
            const hrefs = yield page.$$eval('div.xyinxu5 a', (links, username) => links.map((a) => a.getAttribute('href').trim().replace(/^\/|\/$/g, ''))
                .filter((href) => href !== username), username);
            const { locations, brands } = hrefs.reduce((acc, href) => {
                if (href.includes('location')) {
                    const locationParts = href.split('/');
                    const locationName = locationParts.pop();
                    acc.locations.push(locationName);
                }
                else {
                    acc.brands.push(href);
                }
                return acc;
            }, { locations: [], brands: [] });
            if (link) {
                const postId = link.split('/')[2]; // Extract the post ID from the link
                posts[postId] = { likes: likes, time: time, brands: brands, locations: locations };
            }
        }
        console.log(posts);
        // Wait for the posts to load
    });
}
exports.postsScrapper = postsScrapper;
