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
exports.reelsScrapper = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const openBrowserAndLogin_1 = require("../helpers/openBrowserAndLogin");
function reelsScrapper(username) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        const page = yield (0, openBrowserAndLogin_1.OpenBrowserAndLogin)();
        yield page.goto(`https://www.instagram.com/${username}/reels`, { waitUntil: 'networkidle0' });
        const links = yield page.$$eval('a[href^="/reel/"]', links => links.map(a => a.getAttribute('href')));
        const posts = yield page.$$eval('div._aaj-', posts => posts.map(post => {
            const stats = Array.from(post.querySelectorAll('ul._abpo li span.xdj266r')).map(li => li.textContent);
            const likes = stats[0];
            const comments = stats[1];
            return { likes, comments };
        }));
        const views = yield page.$$eval('div._aaj_ span.xdj266r', spans => spans.map(span => span.textContent));
        let result = {};
        for (let i = 0; i < links.length; i++) {
            const id = (_a = links[i]) === null || _a === void 0 ? void 0 : _a.split('/')[2]; // Add null check before accessing the array element
            result[id] = {
                likes: posts[i].likes,
                comments: posts[i].comments,
                views: views[i]
            };
        }
        for (let link of links) {
            yield page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
            const time = yield page.$eval('time._aaqe', time => time.getAttribute('datetime'));
            const hrefs = yield page.$$eval('div.xyinxu5 a', (links, username) => links.map((a) => a.getAttribute('href').trim().replace(/^\/|\/$/g, ''))
                .filter((href) => href !== username), username);
            const { locations, brands, audio } = hrefs.reduce((acc, href) => {
                if (href.includes('location')) {
                    const locationParts = href.split('/');
                    const locationName = locationParts.pop();
                    acc.locations.push(locationName);
                }
                else if (href.includes('audio')) {
                    const audioParts = href.split('/');
                    const audioNumber = audioParts.pop();
                    acc.audio.push(audioNumber);
                }
                else {
                    if (!acc.brands.includes(href)) {
                        acc.brands.push(href);
                    }
                }
                return acc;
            }, { locations: [], brands: [], audio: [] });
            if (link) {
                const postId = link.split('/')[2]; // Extract the post ID from the link
                // Update the result object with the time, brands, and locations
                result[postId] = Object.assign(Object.assign({}, result[postId]), { time: time, brands: brands, locations: locations, audio: audio });
            }
        }
        console.log(result);
    });
}
exports.reelsScrapper = reelsScrapper;
