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
        //const postsSelector = generatePostSelector(1); // Select the first post    
        //const captionSelector = 'h1._ap3a._aaco._aacu._aacx._aad7._aade'; // Updated selector for the caption
        //const likesSelector = 'section._ae5m._ae5n._ae5o span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs'; // Updated selector for the likes
        const links = yield page.$$eval('a[href^="/p/"]', links => links.map(a => a.getAttribute('href')));
        console.log(links);
        //await page.goto(`https://www.instagram.com${links[0]}`, { waitUntil: 'networkidle0' });
        //const likes = await page.$eval('span.xdj266r', span => span.textContent);
        const posts = {};
        for (let link of links) {
            yield page.goto(`https://www.instagram.com${link}`, { waitUntil: 'networkidle0' });
            const likes = yield page.$eval('span.xdj266r', span => span.textContent);
            if (link) {
                const postId = link.split('/')[2]; // Extract the post ID from the link
                posts[postId] = { likes: likes };
            }
        }
        console.log(posts);
        // Wait for the posts to load
    });
}
exports.postsScrapper = postsScrapper;
