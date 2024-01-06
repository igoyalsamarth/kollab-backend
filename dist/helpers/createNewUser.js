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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewuser = void 0;
const db_1 = require("../db/db");
const basicDetails_1 = require("../scrapingFunctions/basicDetails");
function CreateNewuser(emailId, instaAccount, accountType) {
    return __awaiter(this, void 0, void 0, function* () {
        const details = yield (0, basicDetails_1.getBasicDetails)(instaAccount);
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
                accountType: accountType,
            },
        });
    });
}
exports.CreateNewuser = CreateNewuser;
