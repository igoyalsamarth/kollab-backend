import express, { Request, Response } from "express";
import { prisma } from "../db/db";
import { postsScrapper } from "../scrapingFunctions/postsScraper";
import { reelsScrapper } from "../scrapingFunctions/reelsScrapper";

const posts = express();
posts.use(express.json())

posts.post('/populate_static_posts', async (req: Request, res: Response) => {
    try {
        const staticPosts = await postsScrapper(req.body.instaAccount);
        await prisma.$connect();
        const createPosts = await Promise.all(staticPosts.map((post:any) => prisma.staticPostsDetails.create({
            data: {
                id: post.id,
                instaAccount: req.body.instaAccount,
                imgSource:post.byteaImage,
                likes: post.likes,
                postedAt: post.time,
                brands: post.brands,
                locations: post.locations,
                audio: post.audio,
            },
        })));
        await prisma.$transaction(createPosts);
        res.json({ status: 200, message: "Static Posts Generated Successfully", data:  staticPosts })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

posts.post('/populate_reels', async (req: Request, res: Response) => {
    try {
        const reelsPosts = await reelsScrapper(req.body.instaAccount);
        await prisma.$connect();
        const createReels:any[] = await Promise.all( reelsPosts.map((post:any) => prisma.reelPostsDetails.create({
            data: {
                id: post.id,
                instaAccount: req.body.instaAccount,
                imgSource:post.byteaImage,
                likes: post.likes,
                comments: post.comments,
                views: post.views,
                postedAt: post.time,
                brands: post.brands,
                locations: post.locations,
                audio: post.audio,
            },
        })));
        await prisma.$transaction(createReels);
        res.json({ status: 200, message: "Reels Generated Successfully", data: reelsPosts })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

export default posts;