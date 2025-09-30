const prisma = require("../db/prisma");

/**
 * Query the database for posts
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next
 */
async function getHome(req, res, next) {
    const {limit, order} = req.query;
    const limitInt = parseInt(limit);

    // Query the database for posts
    const posts = await prisma.post.findMany({
        take: limitInt,
        orderBy: [
            {
                createdAt: order
            }
        ]
    });

    if (posts === undefined) {
        console.log(`Error, no post table exists`);
        throw new Error(`Prisma Client could not find post model`);
    }

    res.json(posts);
};

module.exports = {
    getHome
}