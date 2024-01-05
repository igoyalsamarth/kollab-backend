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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const basicDetails_1 = require("./scrapingFunctions/basicDetails");
const loginFunction_1 = require("./scrapingFunctions/loginFunction");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
function fetchAndLogDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        const browser = yield puppeteer_extra_1.default.launch({ headless: false });
        const page = (yield browser.pages())[0];
        yield (0, loginFunction_1.loginToInstagram)(page, process.env.USER_EMAIL, process.env.USER_PASSWORD);
        const details = yield (0, basicDetails_1.getBasicDetails)(page, "bhuvan.bam22");
        //await postsScrapper(page,"healthkart")
        //await browser.close();
        const result = yield prisma.user.create({
            data: {
                emailId: details.emailId,
                instaAccount: details.instaAccount,
                accountName: details.accountName,
                posts: details.posts,
                followers: details.followers,
                following: details.following,
                description: details.description,
                link: details.links,
                category: details.category
            },
        });
        console.log(result);
    });
}
fetchAndLogDetails();
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
