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
exports.getBasicDetails = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
function getBasicDetails(page, username) {
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        yield page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
        //
        let instaAccount, accountName, data, category, description, links;
        // Wait for the page name element to load
        try {
            yield page.waitForSelector('h2', { timeout: 60000 });
            instaAccount = yield page.$eval('h2', (h2) => h2.textContent || '');
        }
        catch (e) {
            instaAccount = null;
        }
        // Fetch accountName
        try {
            yield page.waitForSelector('div.x9f619.xjbqb8w.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1oa3qoh.x6s0dn4.x78zum5.x1b8z93w.x1amjocr.xl56j7k span', { timeout: 60000 });
            accountName = yield page.$eval('div.x9f619.xjbqb8w.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1oa3qoh.x6s0dn4.x78zum5.x1b8z93w.x1amjocr.xl56j7k span', (span) => span.textContent || '');
            // Wait for the elements to load
        }
        catch (err) {
            accountName = null;
        }
        try {
            yield page.waitForSelector('ul.x78zum5.x1q0g3np.xieb3on li span._ac2a', { timeout: 60000 });
            data = yield page.$$eval('ul.x78zum5.x1q0g3np.xieb3on li span._ac2a', (spans) => {
                let posts, followers, following;
                for (let i = 0; i < spans.length; i++) {
                    const span = spans[i];
                    const text = i === 1 ? span.title : span.textContent || '';
                    if (i === 0) {
                        posts = parseInt(text.replace(/,/g, ''), 10);
                    }
                    else if (i === 1) {
                        followers = parseInt(text.replace(/,/g, ''), 10);
                    }
                    else if (i === 2) {
                        following = parseInt(text.replace(/,/g, ''), 10);
                    }
                }
                return { posts, followers, following };
            });
        }
        catch (err) {
            data = { posts: null, followers: null, following: null };
        }
        try {
            // Wait for the category element to load
            yield page.waitForSelector('div._ap3a._aaco._aacu._aacy._aad6._aade', { timeout: 60000 });
            category = yield page.$eval('div._ap3a._aaco._aacu._aacy._aad6._aade', (div) => div.textContent);
        }
        catch (e) {
            category = null;
        }
        try {
            // Wait for the description element to load
            yield page.waitForSelector('h1._ap3a._aaco._aacu._aacx._aad6._aade', { timeout: 60000 });
            description = yield page.$eval('h1._ap3a._aaco._aacu._aacx._aad6._aade', (h1) => {
                // Replace the a tag with its text content
                const a = h1.querySelector('a');
                if (a)
                    a.outerHTML = a.textContent || '';
                // Replace the br tag with a full stop
                h1.innerHTML = h1.innerHTML.replace(/<br>/g, '. ');
                // Get the text content
                let text = h1.textContent || '';
                return text;
            });
        }
        catch (e) {
            description = null;
        }
        try {
            // Simulate a click on the div
            let buttonExists = yield page.$('button._acan._acao._acas._aj1-._ap30');
            let buttonText = buttonExists ? yield page.$eval('button._acan._acao._acas._aj1-._ap30', (button) => button.textContent || '') : '';
            let divExists = yield page.$('div.x3nfvp2 a');
            let divText = divExists ? yield page.$eval('div.x3nfvp2 a', (div) => div.textContent || '') : '';
            // Initialize an empty links array
            // Check if the text ends with '+ (something)'
            if ((buttonText === null || buttonText === void 0 ? void 0 : buttonText.length) > 0) {
                if (/\+\s*\d+$/.test(buttonText)) {
                    // Simulate a click on the div
                    yield page.click('button._acan._acao._acas._aj1-._ap30');
                    // Wait for the popup to load
                    yield page.waitForSelector('div[role="dialog"]', { timeout: 60000 });
                    // Fetch the links on the popup
                    links = yield page.$$eval('div[role="dialog"] button', (buttons) => {
                        return buttons.map((button) => {
                            // Find the divs that contain the link description and URL
                            let descriptionDiv = button.querySelector('div._ap3a._aacp._adda._aacz._aada._aade');
                            let urlDiv = button.querySelector('div._ap3a._aaco._aacu._aacx._aada._aade');
                            // Get the text content of the divs
                            let description = descriptionDiv ? descriptionDiv.textContent : null;
                            let url = urlDiv ? urlDiv.textContent : null;
                            // Return the link information
                            return { description, url };
                        });
                    });
                    // Remove the first element of the links array
                    links.shift();
                }
            }
            else if ((divText === null || divText === void 0 ? void 0 : divText.length) > 0) {
                // Remove "Link" text and spaces from divText
                links = [{ context: 'url', urlLink: divText }];
            }
            else {
                links = [];
            }
        }
        catch (e) {
            links = [];
        }
        const emailId = 'samarth.goyal1999@gmail.com';
        return Object.assign(Object.assign({ instaAccount, accountName }, data), { category, description, links, emailId });
    });
}
exports.getBasicDetails = getBasicDetails;
