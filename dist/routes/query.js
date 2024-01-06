"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const basicDetails_1 = require("../scrapingFunctions/basicDetails");
const db_1 = require("../db/db");
const query = (0, express_1.default)();
query.use(express_1.default.json());
query.post('/new_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emailId = req.body.emailId || null;
    try {
        const details = yield (0, basicDetails_1.getBasicDetails)(req.body.instaAccount);
        yield db_1.prisma.$connect();
        yield db_1.prisma.user.create({
            data: {
                emailId: emailId,
                instaAccount: details.instaAccount,
                accountName: details.accountName,
                posts: details.posts,
                followers: details.followers,
                following: details.following,
                description: details.description,
                link: details.links,
                category: details.category,
                claimed: emailId ? true : false,
                accountType: req.body.accountType,
            },
        });
        res.json({ status: 200, message: "User Created Successfully", data: details });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
}));
query.get('/get_users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.prisma.$connect();
        const users = yield db_1.prisma.user.findMany();
        res.json({ status: 200, data: users });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
}));
query.post('/get_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.prisma.$connect();
        const user = yield db_1.prisma.user.findUnique({
            where: {
                instaAccount: req.body.instaAccount
            }
        });
        res.json({ status: 200, data: user });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
}));
exports.default = query;
