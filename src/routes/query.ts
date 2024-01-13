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
                imgSource:details.imgSrc,
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
            where:{
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

query.post('/get_user', async (req: Request, res: Response) => {
    try {
        await prisma.$connect();
        const user = await prisma.user.findUnique({
            where: {
                instaAccount: req.body.instaAccount
            }
        })
        res.json({ status: 200, data: user })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    } finally {
        await prisma.$disconnect();
    }
})

export default query;