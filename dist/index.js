"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const query_1 = __importDefault(require("./routes/query"));
const reelsScrapper_1 = require("./scrapingFunctions/reelsScrapper");
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200
};
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use(cors(corsOptions));
app.use('/query', query_1.default);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    (0, reelsScrapper_1.reelsScrapper)('bhuvan.bam22');
});
