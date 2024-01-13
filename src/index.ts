import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import query from './routes/query'
import posts from "./routes/posts";
import { scrollToTheEnd } from "./scrapingFunctions/scrollToTheEnd";
import { postsScrapper } from "./scrapingFunctions/postsScraper";
import { reelsScrapper } from "./scrapingFunctions/reelsScrapper";
import { getBasicDetails } from "./scrapingFunctions/basicDetails";

const cors = require('cors')
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200
}
dotenv.config();

const app: Express = express();
const port = 5000;

app.get("/", (req: Request, res: Response) => {
  console.log('Working')
  res.send("Backend For Kollab");
});

app.use(cors(corsOptions));
app.use('/query', query)
app.use('/posts', posts)

app.listen(port,'0.0.0.0', () => {
  console.log(`[server]: Server is running ${port}`);
});