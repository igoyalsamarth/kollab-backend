import { prisma } from "../db/db";
import { getBasicDetails } from "../scrapingFunctions/basicDetails";

export async function CreateNewuser(emailId: string, instaAccount: string) {
    const details = await getBasicDetails(instaAccount);
    await prisma.user.create({
        data: {
            emailId: emailId,
            instaAccount: details.instaAccount,
            accountName: details.accountName,
            posts: details.posts,
            followers: details.followers,
            following: details.following,
            description: details.description,
            link: details.links,
            category: details.category
        },
    });
}