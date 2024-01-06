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
const createNewUser_1 = require("../helpers/createNewUser");
const db_1 = require("../db/db");
const query = (0, express_1.default)();
query.use(express_1.default.json());
query.post('/new_user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emailId = req.body.emailId || null;
    const instaAccount = req.body.instaAccount;
    const accountType = req.body.accountType;
    try {
        yield (0, createNewUser_1.CreateNewuser)(emailId, instaAccount, accountType);
        res.json({ status: 200, message: "User Created Successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
query.get('/get_users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
exports.default = query;
