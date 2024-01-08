import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import query from './routes/query'
const cors = require('cors')
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});
app.use(cors(corsOptions));
app.use('/query', query)
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});