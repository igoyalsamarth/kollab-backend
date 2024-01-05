import express, { Express, Request, Response } from "express";
import { CreateNewuser } from "../helpers/createNewUser";

const app: Express = express();

app.post('new-user', async (req: Request, res: Response) => {
    const { emailId, instaAccount } = req.body;
    try {
        await CreateNewuser(emailId, instaAccount)
        res.json({ status: 200, message: "User Created Successfully" })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})