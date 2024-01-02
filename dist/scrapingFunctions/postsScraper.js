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
function postsScrapper(page, username) {
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        function generatePostSelector(index) {
            return `div:nth-child(${index}) a`;
        }
        yield page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
        const postsSelector = generatePostSelector(1); // Select the first post    
        const captionSelector = 'h1._ap3a._aaco._aacu._aacx._aad7._aade'; // Updated selector for the caption
        const likesSelector = 'section._ae5m._ae5n._ae5o span.html-span.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1hl2dhg.x16tdsg8.x1vvkbs'; // Updated selector for the likes
        try {
            // Wait for the posts to load
            yield page.waitForSelector(postsSelector, { timeout: 60000 });
            console.log('found list of posts');
            // Get the first post
            const post = yield page.$(postsSelector);
            // Click on the post
            yield post.click();
            // Wait for the post detail page to load
            yield page.waitForNavigation({ waitUntil: 'networkidle0' });
            // Extract the caption and number of likes
            yield page.waitForSelector(captionSelector, { timeout: 60000 });
            const caption = yield page.$eval(captionSelector, (el) => el.textContent || '');
            const likes = yield page.$eval(likesSelector, (el) => el.textContent || '');
            console.log(`Post 1:`);
            console.log(`Caption: ${caption}`);
            console.log(`Likes: ${likes}`);
        }
        catch (err) {
            console.error('Error scraping post:', err);
        }
    });
}
exports.postsScrapper = postsScrapper;
