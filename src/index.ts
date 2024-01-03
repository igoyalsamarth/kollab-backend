import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getBasicDetails } from "./scrapingFunctions/basicDetails";
import { loginToInstagram } from "./scrapingFunctions/loginFunction";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {postsScrapper} from "./scrapingFunctions/postsScraper";

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
  //const details = await getBasicDetails(page,"healthkart");
  //console.log(details);
  await postsScrapper(page,"healthkart")
  //await browser.close();
}

fetchAndLogDetails();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});