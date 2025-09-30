const prisma = require("../db/prisma");

/**
 * Query the database for posts
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next
 */
async function getHome(req, res, next) {
    const { limit, order } = req.query;
    const limitInt = parseInt(limit);

    // Query the database for posts
    const posts = await prisma.post.findMany({
        take: limitInt,
        orderBy: [{ createdAt: order }],
        omit: {
            id: true,
            userId: true,
            bookId: true
        },
        include: {
            user: {
                select: {
                    name: true
                }
            },
            book: {
                select: {
                    title: true,
                    author: true,
                    series: true,
                    entry: true,
                    cover: true,
                    genres: true
                }
            },
            formats: {
                select: {
                    name: true
                }
            }
        }
    });

    if (posts === undefined) {
        console.log(`Error, no post table exists`);
        throw new Error(`Prisma Client could not find post model`);
    }

    // Shape data for frontend
    const shaped = posts.map((post) => ({
        title: post.title,
        user: post.user.name,
        content: post.content,
        score: post.score.toNumber(),
        book: post.book.title,
        author: post.book.author,
        series: post.book.series,
        entry: post.book.entry.toNumber(),
        genres: post.book.genres.map((g) => g.name),
        formats: post.formats.map((f) => f.name),
        cover: post.book.cover
    }));

    res.json(shaped);
};

module.exports = {
    getHome
}