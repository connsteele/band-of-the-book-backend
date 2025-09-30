const { connect } = require("../routes/homeRouter");
const prisma = require("./prisma");

async function populateGenreTable() {
    const genres = [
        { name: "Fantasy" },
        { name: "Sci-fi" },
        { name: "Horror" },
        { name: "Non-fiction" },
    ];

    try {
        await prisma.genre.createMany({
            data: genres,
            skipDuplicates: true
        });
    } catch (err) {
        console.log("ERROR: Failed to populate Genre Table", err);
        throw err;
    }
}

async function populateFormatTable() {
    const formats = [
        { name: "Physical" },
        { name: "eBook" },
        { name: "Audiobook" }
    ];

    try {
        await prisma.format.createMany({
            data: formats,
            skipDuplicates: true
        });
    } catch (err) {
        console.log("ERROR: Failed to populate Format Table", err);
        throw err;
    }
}

async function populateUserTable() {
    const users = [
        {
            name: "example",
            email: "test@example.com",
            password: "password"
        }
    ];

    try {
        await prisma.user.createMany({
            data: users,
            skipDuplicates: true
        })
    } catch (err) {
        console.log("ERROR: Failed to populate User Table", err);
        throw err;
    }
}

async function populateBookTable() {
    const books = [
        {
            title: "Best Served Cold",
            author: "Joe Abercrombie",
            series: "The First Law",
            entry: 4,
            cover: "https://m.media-amazon.com/images/I/91OCKDQpnbL._SL1500_.jpg",
            genres: ["Fantasy"]
        }
    ];

    try {
        for (book of books) {

            const exists = await prisma.book.findMany({
                where: {
                    title: book.title
                }
            });
            // For now skip books with the same name
            if (exists.length > 0) {
                continue;
            }

            await prisma.book.create({
                data: {
                    title: book.title,
                    author: book.author,
                    series: book.series,
                    entry: book.entry,
                    cover: book.cover,
                    genres: {
                        // maps to an array of object like [{name: "Fantasy"}, ...]
                        connect: book.genres.map((genre) => ({ name: genre }) )
                    }
                }
            });
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function populatePostTable() {
    const posts = [
        {
            title: "Best Served Cold",
            userName: "example",
            content: "Seeded review",
            score: 4.25,
            formats: ["eBook", "Audiobook"],

        }
    ]

    // createMany cannot create nested relations
    try {
        for (post of posts) {

            const exists = await prisma.post.findMany({
                where: {
                    title: post.title
                }
            })
            if (exists) {
                continue;
            }

            // createOrConnect book
            const book = await prisma.book.findFirst({
                where: {
                    title: "Best Served Cold"
                }
            })

            const user = await prisma.user.findUnique({
                where: { name: post.userName }
            })
            if (!user) {
                throw new Error("User does not exist!");
            }

            await prisma.post.create({
                data: {
                    title: post.title,
                    user: {
                        connect: {
                            name: post.userName
                        }
                    },
                    book: {
                        connect: {
                            id: book.id
                        }
                    },
                    formats: {
                        connect: post.formats.map((format) => ({ name: format }) )
                    },
                    content: post.content,
                    score: post.score
                }
            });
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function populateTables() {
    await populateGenreTable();
    await populateFormatTable();
    await populateUserTable();
    await populateBookTable();
    await populatePostTable();
}

module.exports = {
    populateTables
}