import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getBasicDetails } from "./scrapingFunctions/basicDetails";
import { loginToInstagram } from "./scrapingFunctions/loginFunction";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {postsScrapper} from "./scrapingFunctions/postsScraper";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});


async function fetchAndLogDetails() {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: false });
  const page = (await browser.pages())[0];
  await loginToInstagram(page,process.env.USER_EMAIL, process.env.USER_PASSWORD);
  const details = await getBasicDetails(page,"healthkart");
  //await postsScrapper(page,"healthkart")
  //await browser.close();

  const result = await prisma.user.create({
  data: { 
    emailId:details.emailId,
    instaAccount:details.instaAccount,
    accountName:details.accountName,
    posts:details.posts,
    followers:details.followers,
    following:details.following,
    description:details.description,
    link:details.links,
    category:details.category
   },
  });

  console.log(result);
}

fetchAndLogDetails();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});