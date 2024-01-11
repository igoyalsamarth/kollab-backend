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
const db_1 = require("../db/db");
const postsScraper_1 = require("../scrapingFunctions/postsScraper");
const reelsScrapper_1 = require("../scrapingFunctions/reelsScrapper");
const posts = (0, express_1.default)();
posts.use(express_1.default.json());
posts.post('/populate_static_posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const staticPosts = yield (0, postsScraper_1.postsScrapper)(req.body.instaAccount);
        yield db_1.prisma.$connect();
        const createPosts = staticPosts.map((post) => db_1.prisma.staticPostsDetails.create({
            data: {
                id: post.id,
                instaAccount: req.body.instaAccount,
                likes: post.likes,
                postedAt: post.time,
                brands: post.brands,
                locations: post.locations,
                audio: post.audio,
            },
        }));
        yield db_1.prisma.$transaction(createPosts);
        res.json({ status: 200, message: "Static Posts Generated Successfully", data: staticPosts });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
}));
posts.post('/populate_reels', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reelsPosts = yield (0, reelsScrapper_1.reelsScrapper)(req.body.instaAccount);
        yield db_1.prisma.$connect();
        const createReels = reelsPosts.map((post) => db_1.prisma.reelPostsDetails.create({
            data: {
                id: post.id,
                instaAccount: req.body.instaAccount,
                likes: post.likes,
                comments: post.comments,
                views: post.views,
                postedAt: post.time,
                brands: post.brands,
                locations: post.locations,
                audio: post.audio,
            },
        }));
        yield db_1.prisma.$transaction(createReels);
        res.json({ status: 200, message: "Reels Generated Successfully", data: reelsPosts });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
}));
exports.default = posts;
