const prisma = require("../db/prisma");

/**
 * Query the database for posts
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next
 */
async function postsGet(req, res, next) {
    let limit = 10;
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }
    const order = req.query.order ? req.query.order : "desc";

    // Query the database for posts
    const [posts, count] = await prisma.$transaction([
        prisma.post.findMany({
            take: limit,
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
        }),
        prisma.post.count(),
    ]);

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

    res.status(200).json({
        count: count,
        limit: limit,
        result: shaped,
        // can also list next and previous pages
    });
};

module.exports = {
    postsGet
}