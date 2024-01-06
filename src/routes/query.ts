import express, { Express, Request, Response } from "express";
import { CreateNewuser } from "../helpers/createNewUser";
import { prisma } from "../db/db";

const query = express();
query.use(express.json())

query.post('/new_user', async (req: Request, res: Response) => {
    const emailId = req.body.emailId || null;
    const instaAccount = req.body.instaAccount;
    const accountType = req.body.accountType;

    try {
        await CreateNewuser(emailId, instaAccount, accountType)
        res.json({ status: 200, message: "User Created Successfully" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

query.get('/get_users', async (req:Request, res:Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json({status:200, data:users})
    } catch(err) {
        console.log(err)
        res.status(500).json({message:"Internal Server Error"})
    } finally {
        await prisma.$disconnect();
    }
})

export default query;