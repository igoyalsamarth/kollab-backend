import express, { Request, Response } from "express";
import { getBasicDetails } from "../scrapingFunctions/basicDetails";
import { prisma } from "../db/db";

const query = express();
query.use(express.json())

query.post('/new_user', async (req: Request, res: Response) => {
    const emailId = req.body.emailId || null;
    try {
        const details = await getBasicDetails(req.body.instaAccount);
        await prisma.$connect();
        await prisma.user.create({
            data: {
                emailId: emailId,
                instaAccount: details.instaAccount,
                accountName: details.accountName,
                imgSource: details.byteaImage,
                posts: details.posts,
                followers: details.followers,
                following: details.following,
                description: details.description,
                link: details.links,
                category: details.category,
                claimed: emailId ? true : false,
                accountType: req.body.accountType,
            },
        }); res.json({ status: 200, message: "User Created Successfully", data: details })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_professionals/:id', async (req: Request, res: Response) => {
    try {
        const category = req.params.id;
        await prisma.$connect();
        let users;
        if (category === 'null') {
            users = await prisma.user.findMany({
                where: {
                    accountType: "PROFESSIONAL",
                    OR: [
                        { category: "" },
                        { category: null }
                    ]
                }
            });
        } else {
            users = await prisma.user.findMany({
                where: {
                    accountType: "PROFESSIONAL",
                    category: {
                        equals: category,
                        mode: "insensitive"
                    }
                }
            });
        }
        res.json({ status: 200, data: users })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_professionals', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const users = await prisma.user.findMany({
            where: {
                accountType: "PROFESSIONAL",
            }
        });
        res.json({ status: 200, data: users })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_businesses', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const users = await prisma.user.findMany({
            where: {
                accountType: "BUSINESS",
            }
        });
        res.json({ status: 200, data: users })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_user/:instaAccount', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const user = await prisma.user.findUnique({
            where: {
                instaAccount: req.params.instaAccount
            }
        })
        const reels = await prisma.reelPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            }
        });
        const staticPosts = await prisma.staticPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            }
        });
        const numberOfReels = reels.length;
        const numberOfStaticPosts = staticPosts.length;
        const reelsWithBrands = (reels as any[]).filter(reel => reel.brands && reel.brands.length > 0);
        const staticPostsWithBrands = (staticPosts as any[]).filter(post => post.brands && post.brands.length > 0);

        const numberOfReelsWithBrands = reelsWithBrands.length;
        const numberOfStaticPostsWithBrands = staticPostsWithBrands.length;
        const brandCollaborations = numberOfReelsWithBrands + numberOfStaticPostsWithBrands

        res.json({ status: 200, data: { user, numberOfReels, numberOfStaticPosts, brandCollaborations } })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_user_static_posts/:instaAccount', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const allStaticPosts = await prisma.staticPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            }
        });
        const totalLikes = allStaticPosts.reduce((sum, reel) => sum + (reel.likes ?? 0), 0);
        const averageLikes = totalLikes / allStaticPosts.length;
        const latestStaticPosts = await prisma.staticPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            },
            orderBy: {
                postedAt: 'desc'
            },
            take: 6
        });
        res.json({ status: 200, data: latestStaticPosts, likes: averageLikes });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

query.get('/get_user_reels_posts/:instaAccount', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const allReels = await prisma.reelPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            }
        });
        const totalViews = allReels.reduce((sum, reel) => sum + (reel.views ?? 0), 0);
        const totalLikes = allReels.reduce((sum, reel) => sum + (reel.likes ?? 0), 0);
        const totalComments = allReels.reduce((sum, reel) => sum + (reel.comments ?? 0), 0);
        const averageViews = totalViews / allReels.length;
        const averageLikes = totalLikes / allReels.length;
        const averageComments = totalComments / allReels.length;
        const latestReels = await prisma.reelPostsDetails.findMany({
            where: {
                instaAccount: req.params.instaAccount
            },
            orderBy: {
                postedAt: 'desc'
            },
            take: 8
        });
        res.json({ status: 200, data: latestReels, averages: { views: averageViews, likes: averageLikes, comments: averageComments } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

export default query;