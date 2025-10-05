const prisma = require("../db/prisma");
const {validate} = require("uuid");

/**
 * Query the database for posts
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next
 */
async function readPosts(req, res, next) {
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


async function createPostForUser(req, res, next) {
    if (!req.params.userId) {
        console.error("No userId parameter found");
        throw new Error("No userId parameter found");
    }
    const userId = req.params.userId;

    // Validate the userId before going forward
    validate(userId);
    uuidv4(userId);

    const {
        book,
        author,
        cover,
        genres: rawGenres,
        formats: rawFormats,
        series = undefined,
        entry = undefined,
        score,
        content
    } = req.body;

    const genres = Array.isArray(rawGenres) ? rawGenres : [rawGenres];
    const formats = Array.isArray(rawFormats) ? rawFormats : [rawFormats];

    // For book only create if it does not exist
        // Can connectORCreate on unique field
    const result = await prisma.post.create({
        data: {
            title: book,
            user: {
                connect: {
                    id: userId
                }
            },
            content: content,
            score: score,
            book: {
                create: {
                    title: book,
                    author: author,
                    series: series,
                    entry: entry,
                    cover: cover,
                    genres: {
                        connect: genres.map((g) => ({ name: g }))
                    },
                }
            },
            formats: {
                connect: formats.map((f) => ({ name: f }))
            },
        },
    });

    console.log(result);
};

module.exports = {
    readPosts,
    createPostForUser
}