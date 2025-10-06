const prisma = require("../db/prisma");

const validQueries = new Set([
    "title",
    "author"
]);

async function searchBook(req, res, next) {
    // Collection request
    if (Object.entries(req.query).length === 0) {
        console.log("Send paginated collection as response");
    }

    // Request Validation
    const validP = new Map([
        ["title", false],
        ["author", false]
    ]);
    for (const [key, value] of Object.entries(req.query)) {
        if (!validQueries.has(key)) {
            console.error("Invalid search request");
            return res.status(400).json(`Invalid query ${param}. Only use required queries: title & author`);
        }
    }

    const {
        title,
        author
    } = req.query;


    // Specific book request, search db and API
    // 1 Check Database
    const dbRes = await prisma.book.findFirst({
        where: {
            title: title,
            author: author,
        }
    });
    if (dbRes) {
        const protocol = req.protocol;
        const host = req.get("host");
        const bookUrl = `${protocol}://${host}/books/${dbRes.id}`
        res.status(200).json({
            result: bookUrl
        });
    }

    // 2 Check Books API


}

async function readBook(req, res, next) {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: `Invalid book id ${id}` });

    const dbRes = await prisma.book.findUnique({
        where: { id: id},
        include: {
            genres: true,
        },
    })

    if (dbRes) {
        const result = dbRes;
        return res.status(200).json(result);
    }
}

module.exports = {
    searchBook,
    readBook
};